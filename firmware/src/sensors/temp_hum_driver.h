#ifndef TEMP_HUM_DRIVER_H
#define TEMP_HUM_DRIVER_H

#include "config.h"
#include "sensors.h"
#include <DHT.h>

class TempHumDriver {
private:
  DHT dht;
  unsigned long lastReadTime;
  SensorValue lastTemperature;
  SensorValue lastHumidity;
  bool isInitialized;

public:
  TempHumDriver();
  bool begin();
  void update();
  SensorValue getTemperature();
  SensorValue getHumidity();
};

#endif // TEMP_HUM_DRIVER_H
