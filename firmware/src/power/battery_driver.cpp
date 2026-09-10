#include "battery_driver.h"

BatteryDriver::BatteryDriver() : lastBatteryPercent(100), isNull(false) {}

bool BatteryDriver::begin() {
  pinMode(BATTERY_PIN, INPUT);
  Serial.println("[INFO] Battery ADC monitoring initialized on GPIO " + String(BATTERY_PIN));
  return true;
}

void BatteryDriver::update() {
  int rawAdc = analogRead(BATTERY_PIN);
  
  if (rawAdc <= 0 || rawAdc > 4095) {
    // If ADC pin is floating or unattached
    isNull = true;
    lastBatteryPercent = 0;
    return;
  }

  // 12-bit ADC (0-4095), 3.3V ref, 2:1 resistor divider (V_bat = V_adc * 2)
  float pinVoltage = (rawAdc / 4095.0f) * 3.3f;
  float batteryVoltage = pinVoltage * 2.0f;

  // LiPo voltage curve estimation (3.2V empty, 4.2V full)
  if (batteryVoltage >= 4.2f) {
    lastBatteryPercent = 100;
  } else if (batteryVoltage <= 3.2f) {
    lastBatteryPercent = 0;
  } else {
    lastBatteryPercent = (int)(((batteryVoltage - 3.2f) / 1.0f) * 100.0f);
  }
  isNull = false;
}

DeviceMetadata BatteryDriver::getDeviceMetadata(int signalStrengthDbm) {
  DeviceMetadata meta;
  meta.batteryPercent = lastBatteryPercent;
  meta.batteryIsNull = isNull;
  meta.signalStrengthDbm = signalStrengthDbm;
  meta.signalIsNull = (signalStrengthDbm == 0);
  meta.firmwareVersion = FIRMWARE_VERSION;
  return meta;
}
