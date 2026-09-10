#include "temp_hum_driver.h"

TempHumDriver::TempHumDriver() : dht(DHT_PIN, DHT_TYPE), lastReadTime(0), isInitialized(false) {
  lastTemperature = {0.0f, true, "C", STATUS_MISSING};
  lastHumidity = {0.0f, true, "%", STATUS_MISSING};
}

bool TempHumDriver::begin() {
  dht.begin();
  delay(100); // Allow sensor startup stabilization
  
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("[WARN] Temp/Humidity sensor not detected on configured pin");
    isInitialized = false;
    lastTemperature.status = STATUS_MISSING;
    lastHumidity.status = STATUS_MISSING;
    return false;
  }

  isInitialized = true;
  Serial.println("[INFO] Temp/Humidity sensor initialized successfully");
  return true;
}

void TempHumDriver::update() {
  if (millis() - lastReadTime < SENSOR_READ_INTERVAL_MS) {
    return;
  }
  lastReadTime = millis();

  if (!isInitialized) {
    // Attempt re-init safely
    begin();
    if (!isInitialized) return;
  }

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  // Validate bounds
  if (isnan(t) || t < TEMP_MIN_C || t > TEMP_MAX_C) {
    lastTemperature.isNull = true;
    lastTemperature.status = isnan(t) ? STATUS_MISSING : STATUS_ERROR;
  } else {
    lastTemperature.value = t;
    lastTemperature.isNull = false;
    lastTemperature.status = STATUS_OK;
  }

  if (isnan(h) || h < HUM_MIN_PCT || h > HUM_MAX_PCT) {
    lastHumidity.isNull = true;
    lastHumidity.status = isnan(h) ? STATUS_MISSING : STATUS_ERROR;
  } else {
    lastHumidity.value = h;
    lastHumidity.isNull = false;
    lastHumidity.status = STATUS_OK;
  }
}

SensorValue TempHumDriver::getTemperature() {
  return lastTemperature;
}

SensorValue TempHumDriver::getHumidity() {
  return lastHumidity;
}
