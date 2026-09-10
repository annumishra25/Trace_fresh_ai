#ifndef GPS_DRIVER_H
#define GPS_DRIVER_H

#include "config.h"
#include "sensors.h"
#include <HardwareSerial.h>
#include <TinyGPS++.h>

class GpsDriver {
private:
  HardwareSerial gpsSerial;
  TinyGPSPlus tinyGps;
  GpsData lastGpsData;
  unsigned long lastReadTime;
  bool isInitialized;

public:
  GpsDriver();
  bool begin();
  void update();
  GpsData getGpsData();
};

#endif // GPS_DRIVER_H
