#include "voc_gas_driver.h"

VocGasDriver::VocGasDriver() : bootTime(0), lastReadTime(0), isInitialized(false) {
  lastVoc = {0.0f, true, "ppm", STATUS_MISSING};
  lastGas = {0.0f, true, "ppm", STATUS_MISSING};
}

bool VocGasDriver::begin() {
  bootTime = millis();
  pinMode(MQ135_PIN, INPUT);
  
  int rawAdc = analogRead(MQ135_PIN);
  if (rawAdc == 0 || rawAdc > 4095) {
    Serial.println("[WARN] MQ135 ADC pin reading out of expected range");
  }

  isInitialized = true;
  Serial.println("[INFO] MQ135 VOC/Gas driver initialized");
  return true;
}

void VocGasDriver::update() {
  if (millis() - lastReadTime < SENSOR_READ_INTERVAL_MS) {
    return;
  }
  lastReadTime = millis();

  // Check if sensor is warming up / calibrating
  if (millis() - bootTime < MQ135_WARMUP_MS) {
    lastVoc = {0.0f, true, "ppm", STATUS_CALIBRATING};
    lastGas = {0.0f, true, "ppm", STATUS_CALIBRATING};
    return;
  }

  int rawAdc = analogRead(MQ135_PIN);

  if (rawAdc < 0 || rawAdc > 4095) {
    lastVoc = {0.0f, true, "ppm", STATUS_ERROR};
    lastGas = {0.0f, true, "ppm", STATUS_ERROR};
    return;
  }

  // Linear estimation formula based on MQ135 load resistor baseline ratio R0
  // Note: Raw ADC is mapped to estimated ppm for demonstration purposes. Full laboratory calibration required for high accuracy.
  float estimatedPpm = (rawAdc / 4095.0f) * 10.0f; // Scale 0-10 ppm estimate
  float gasEstimate = estimatedPpm * 0.25f;

  lastVoc = {estimatedPpm, false, "ppm", STATUS_OK};
  lastGas = {gasEstimate, false, "ppm", STATUS_OK};
}

SensorValue VocGasDriver::getVoc() {
  return lastVoc;
}

SensorValue VocGasDriver::getGas() {
  return lastGas;
}
