#include "gps_driver.h"

GpsDriver::GpsDriver() : gpsSerial(2), lastReadTime(0), isInitialized(false) {
  lastGpsData = {0.0f, 0.0f, 0.0f, 0.0f, false, GPS_NO_FIX};
}

bool GpsDriver::begin() {
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  delay(100);
  isInitialized = true;
  Serial.println("[INFO] GPS HardwareSerial 2 initialized on RX:" + String(GPS_RX_PIN) + " TX:" + String(GPS_TX_PIN));
  return true;
}

void GpsDriver::update() {
  // Feed incoming UART NMEA characters to TinyGPS++ parser
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();
    tinyGps.encode(c);
  }

  if (millis() - lastReadTime < GPS_READ_INTERVAL_MS) {
    return;
  }
  lastReadTime = millis();

  if (tinyGps.location.isValid() && tinyGps.location.isUpdated()) {
    float lat = tinyGps.location.lat();
    float lon = tinyGps.location.lng();
    float speed = tinyGps.speed.kmph();
    float hdop = tinyGps.hdop.hdop();

    // Validate bounds
    if (lat >= -90.0f && lat <= 90.0f && lon >= -180.0f && lon <= 180.0f) {
      lastGpsData.latitude = lat;
      lastGpsData.longitude = lon;
      lastGpsData.speedKmh = speed >= 0 ? speed : 0.0f;
      lastGpsData.accuracyM = hdop > 0 ? hdop * 5.0f : 5.0f; // Approx accuracy
      lastGpsData.hasFix = true;
      lastGpsData.status = GPS_LOCKED;
      return;
    }
  }

  if (tinyGps.satellites.value() > 0) {
    lastGpsData.hasFix = false;
    lastGpsData.status = GPS_ACQUIRING;
  } else {
    lastGpsData.hasFix = false;
    lastGpsData.status = GPS_NO_FIX;
  }
}

GpsData GpsDriver::getGpsData() {
  return lastGpsData;
}
