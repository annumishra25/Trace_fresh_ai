#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "sensors/temp_hum_driver.h"
#include "sensors/voc_gas_driver.h"
#include "sensors/co2_driver.h"
#include "gps/gps_driver.h"
#include "power/battery_driver.h"
#include "network/wifi_manager.h"
#include "network/http_client.h"
#include "telemetry/telemetry_builder.h"
#include "telemetry/offline_buffer.h"

// Subsystem Instances
TempHumDriver tempHumDriver;
VocGasDriver vocGasDriver;
Co2Driver co2Driver;
GpsDriver gpsDriver;
BatteryDriver batteryDriver;

WifiManager wifiManager;
TelemetryHttpClient httpClient;
OfflineBuffer offlineBuffer;

unsigned long lastTelemetrySendTime = 0;

void printLog(const char* level, const String& msg) {
  Serial.print("[");
  Serial.print(NODE_ID);
  Serial.print("][");
  Serial.print(level);
  Serial.print("] ");
  Serial.println(msg);
}

void runDiagnosticSelfTest() {
  Serial.println("\n==================================================");
  Serial.print("  TRACEFRESH SMART NODE DIAGNOSTICS ("); Serial.print(NODE_ID); Serial.println(")");
  Serial.println("==================================================");
  Serial.print("Node ID: "); Serial.println(NODE_ID);
  Serial.print("Firmware Version: "); Serial.println(FIRMWARE_VERSION);
  Serial.print("Hardware Revision: "); Serial.println(HARDWARE_REVISION);
  Serial.println("--------------------------------------------------");

  // 1. Temp / Hum Sensor
  SensorValue t = tempHumDriver.getTemperature();
  SensorValue h = tempHumDriver.getHumidity();
  Serial.print("Temperature Sensor: ");
  if (t.status == STATUS_OK) {
    Serial.print("OK ("); Serial.print(t.value); Serial.println(" °C)");
  } else {
    Serial.print(t.getStatusString()); Serial.println(" (Read Failed / Sensor Absent)");
  }

  Serial.print("Humidity Sensor:    ");
  if (h.status == STATUS_OK) {
    Serial.print("OK ("); Serial.print(h.value); Serial.println(" %)");
  } else {
    Serial.print(h.getStatusString()); Serial.println(" (Read Failed / Sensor Absent)");
  }

  // 2. VOC / Gas
  SensorValue voc = vocGasDriver.getVoc();
  Serial.print("MQ135 VOC / Gas:    ");
  Serial.print(voc.getStatusString());
  if (voc.status == STATUS_OK) {
    Serial.print(" (Estimated "); Serial.print(voc.value); Serial.println(" ppm)");
  } else if (voc.status == STATUS_CALIBRATING) {
    Serial.println(" (Sensor Warm-up in Progress)");
  } else {
    Serial.println();
  }

  // 3. CO2
  SensorValue co2 = co2Driver.getCo2();
  Serial.print("CO2 (SCD41 NDIR):   "); Serial.println(co2.getStatusString());

  // 4. GPS
  GpsData gps = gpsDriver.getGpsData();
  Serial.print("GPS Module:         ");
  Serial.print(gps.getStatusString());
  if (gps.hasFix) {
    Serial.print(" (Lat: "); Serial.print(gps.latitude, 4);
    Serial.print(", Lon: "); Serial.print(gps.longitude, 4); Serial.println(")");
  } else {
    Serial.println(" (No Fix / Searching Satellites)");
  }

  // 5. Battery
  DeviceMetadata dev = batteryDriver.getDeviceMetadata(wifiManager.getRssi());
  Serial.print("Battery Level:      ");
  if (!dev.batteryIsNull) {
    Serial.print(dev.batteryPercent); Serial.println(" %");
  } else {
    Serial.println("Unavailable (Floating ADC)");
  }

  // 6. Network
  Serial.print("WiFi Network:       ");
  if (wifiManager.isConnected()) {
    Serial.print("OK (Signal: "); Serial.print(dev.signalStrengthDbm); Serial.println(" dBm)");
  } else {
    Serial.println("Disconnected / Reconnecting");
  }

  Serial.println("==================================================\n");
}

void setup() {
  Serial.begin(115200);
  delay(500);

  printLog("INFO", "Booting TraceFresh Smart Monitoring Node...");
  printLog("INFO", String("Firmware Version: ") + FIRMWARE_VERSION);

  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(DIAGNOSTIC_BUTTON_PIN, INPUT_PULLUP);
  digitalWrite(STATUS_LED_PIN, HIGH);

  // Initialize Subsystem Drivers
  tempHumDriver.begin();
  vocGasDriver.begin();
  co2Driver.begin();
  gpsDriver.begin();
  batteryDriver.begin();

  // Initialize Network Connection
  wifiManager.begin();
  digitalWrite(STATUS_LED_PIN, LOW);

  runDiagnosticSelfTest();
}

void loop() {
  // Update Subsystem Drivers (Non-blocking)
  wifiManager.update();
  tempHumDriver.update();
  vocGasDriver.update();
  co2Driver.update();
  gpsDriver.update();
  batteryDriver.update();

  // Diagnostic Button Check (GPIO 0 / BOOT button)
  if (digitalRead(DIAGNOSTIC_BUTTON_PIN) == LOW) {
    delay(50);
    if (digitalRead(DIAGNOSTIC_BUTTON_PIN) == LOW) {
      runDiagnosticSelfTest();
      while (digitalRead(DIAGNOSTIC_BUTTON_PIN) == LOW) {
        delay(10);
      }
    }
  }

  // Telemetry Send Timer (Non-blocking)
  if (millis() - lastTelemetrySendTime >= TELEMETRY_SEND_INTERVAL_MS) {
    lastTelemetrySendTime = millis();

    SensorPackage pkg;
    pkg.temperature = tempHumDriver.getTemperature();
    pkg.humidity = tempHumDriver.getHumidity();
    pkg.voc = vocGasDriver.getVoc();
    pkg.gas = vocGasDriver.getGas();
    pkg.co2 = co2Driver.getCo2();
    pkg.gps = gpsDriver.getGpsData();
    pkg.device = batteryDriver.getDeviceMetadata(wifiManager.getRssi());

    String jsonPayload = TelemetryBuilder::buildJson(pkg, NODE_ID);

    if (wifiManager.isConnected()) {
      digitalWrite(STATUS_LED_PIN, HIGH);
      
      // Flush offline buffered telemetry first
      httpClient.flushBuffer(offlineBuffer);

      // Send live telemetry packet
      bool success = httpClient.sendTelemetry(jsonPayload);
      if (!success) {
        printLog("WARN", "Telemetry POST failed! Buffering locally...");
        offlineBuffer.push(jsonPayload);
      } else {
        printLog("INFO", "Telemetry packet sent successfully.");
      }
      
      digitalWrite(STATUS_LED_PIN, LOW);
    } else {
      printLog("WARN", "WiFi disconnected. Buffering telemetry offline...");
      offlineBuffer.push(jsonPayload);
    }
  }
}
