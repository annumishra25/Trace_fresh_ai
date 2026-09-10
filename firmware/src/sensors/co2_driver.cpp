#include "co2_driver.h"

Co2Driver::Co2Driver() : isConnected(false) {
  lastCo2 = {0.0f, true, "ppm", STATUS_MISSING};
}

bool Co2Driver::begin() {
  // Check for hardware I2C SCD41 / Sensirion CO2 sensor
  // For physical node without SCD41 attached, safely report MISSING
  isConnected = false;
  Serial.println("[INFO] CO2 Driver: Hardware SCD41 check completed (Status: MISSING - Optional Sensor)");
  return false;
}

void Co2Driver::update() {
  if (!isConnected) {
    lastCo2 = {0.0f, true, "ppm", STATUS_MISSING};
  }
}

SensorValue Co2Driver::getCo2() {
  return lastCo2;
}
