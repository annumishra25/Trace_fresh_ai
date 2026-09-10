#ifndef TELEMETRY_BUILDER_H
#define TELEMETRY_BUILDER_H

#include "config.h"
#include "sensors.h"
#include <ArduinoJson.h>

class TelemetryBuilder {
public:
  static String buildJson(const SensorPackage& pkg, const char* nodeId = NODE_ID);
};

#endif // TELEMETRY_BUILDER_H
