#include "telemetry_builder.h"

String TelemetryBuilder::buildJson(const SensorPackage& pkg, const char* nodeId) {
  StaticJsonDocument<1024> doc;

  doc["nodeId"] = nodeId;
  doc["batchId"] = nullptr;
  doc["shipmentId"] = nullptr;
  
  if (pkg.timestamp.length() > 0) {
    doc["timestamp"] = pkg.timestamp;
  } else {
    doc["timestamp"] = "2026-09-05T13:00:00Z";
  }

  // Sensors object
  JsonObject sensors = doc.createNestedObject("sensors");

  // Temperature
  JsonObject tempObj = sensors.createNestedObject("temperature");
  if (pkg.temperature.isNull) {
    tempObj["value"] = nullptr;
  } else {
    tempObj["value"] = pkg.temperature.value;
  }
  tempObj["unit"] = pkg.temperature.unit;
  tempObj["status"] = pkg.temperature.getStatusString();

  // Humidity
  JsonObject humObj = sensors.createNestedObject("humidity");
  if (pkg.humidity.isNull) {
    humObj["value"] = nullptr;
  } else {
    humObj["value"] = pkg.humidity.value;
  }
  humObj["unit"] = pkg.humidity.unit;
  humObj["status"] = pkg.humidity.getStatusString();

  // CO2
  JsonObject co2Obj = sensors.createNestedObject("co2");
  if (pkg.co2.isNull) {
    co2Obj["value"] = nullptr;
  } else {
    co2Obj["value"] = pkg.co2.value;
  }
  co2Obj["unit"] = pkg.co2.unit;
  co2Obj["status"] = pkg.co2.getStatusString();

  // VOC
  JsonObject vocObj = sensors.createNestedObject("voc");
  if (pkg.voc.isNull) {
    vocObj["value"] = nullptr;
  } else {
    vocObj["value"] = pkg.voc.value;
  }
  vocObj["unit"] = pkg.voc.unit;
  vocObj["status"] = pkg.voc.getStatusString();

  // Gas
  JsonObject gasObj = sensors.createNestedObject("gas");
  if (pkg.gas.isNull) {
    gasObj["value"] = nullptr;
  } else {
    gasObj["value"] = pkg.gas.value;
  }
  gasObj["unit"] = pkg.gas.unit;
  gasObj["status"] = pkg.gas.getStatusString();

  // GPS object
  JsonObject gpsObj = doc.createNestedObject("gps");
  if (pkg.gps.hasFix) {
    gpsObj["latitude"] = pkg.gps.latitude;
    gpsObj["longitude"] = pkg.gps.longitude;
    gpsObj["speedKmh"] = pkg.gps.speedKmh;
    gpsObj["accuracyM"] = pkg.gps.accuracyM;
  } else {
    gpsObj["latitude"] = nullptr;
    gpsObj["longitude"] = nullptr;
    gpsObj["speedKmh"] = nullptr;
    gpsObj["accuracyM"] = nullptr;
  }
  gpsObj["status"] = pkg.gps.getStatusString();

  // Device object
  JsonObject devObj = doc.createNestedObject("device");
  if (pkg.device.batteryIsNull) {
    devObj["batteryPercent"] = nullptr;
  } else {
    devObj["batteryPercent"] = pkg.device.batteryPercent;
  }

  if (pkg.device.signalIsNull) {
    devObj["signalStrengthDbm"] = nullptr;
  } else {
    devObj["signalStrengthDbm"] = pkg.device.signalStrengthDbm;
  }
  devObj["firmwareVersion"] = pkg.device.firmwareVersion;

  // Crucial tag identifying telemetry from real microcontroller hardware
  doc["source"] = "hardware";

  String output;
  serializeJson(doc, output);
  return output;
}
