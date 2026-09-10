#ifndef VOC_GAS_DRIVER_H
#define VOC_GAS_DRIVER_H

#include "config.h"
#include "sensors.h"

class VocGasDriver {
private:
  unsigned long bootTime;
  unsigned long lastReadTime;
  SensorValue lastVoc;
  SensorValue lastGas;
  bool isInitialized;

public:
  VocGasDriver();
  bool begin();
  void update();
  SensorValue getVoc();
  SensorValue getGas();
};

#endif // VOC_GAS_DRIVER_H
