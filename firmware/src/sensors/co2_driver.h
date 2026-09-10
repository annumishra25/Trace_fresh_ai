#ifndef CO2_DRIVER_H
#define CO2_DRIVER_H

#include "config.h"
#include "sensors.h"

class Co2Driver {
private:
  bool isConnected;
  SensorValue lastCo2;

public:
  Co2Driver();
  bool begin();
  void update();
  SensorValue getCo2();
};

#endif // CO2_DRIVER_H
