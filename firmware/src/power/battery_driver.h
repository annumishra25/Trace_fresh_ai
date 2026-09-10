#ifndef BATTERY_DRIVER_H
#define BATTERY_DRIVER_H

#include "config.h"
#include "sensors.h"

class BatteryDriver {
private:
  int lastBatteryPercent;
  bool isNull;

public:
  BatteryDriver();
  bool begin();
  void update();
  DeviceMetadata getDeviceMetadata(int signalStrengthDbm);
};

#endif // BATTERY_DRIVER_H
