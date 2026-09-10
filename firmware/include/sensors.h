#ifndef TRACEFRESH_SENSORS_H
#define TRACEFRESH_SENSORS_H

#include <Arduino.h>

enum SensorStatus {
  STATUS_OK,
  STATUS_MISSING,
  STATUS_ERROR,
  STATUS_STALE,
  STATUS_CALIBRATING
};

enum GpsStatus {
  GPS_NO_FIX,
  GPS_ACQUIRING,
  GPS_LOCKED,
  GPS_ERROR,
  GPS_UNAVAILABLE
};

struct SensorValue {
  float value;
  bool isNull;
  String unit;
  SensorStatus status;

  String getStatusString() const {
    switch (status) {
      case STATUS_OK: return "OK";
      case STATUS_MISSING: return "MISSING";
      case STATUS_ERROR: return "ERROR";
      case STATUS_STALE: return "STALE";
      case STATUS_CALIBRATING: return "CALIBRATING";
      default: return "ERROR";
    }
  }
};

struct GpsData {
  float latitude;
  float longitude;
  float speedKmh;
  float accuracyM;
  bool hasFix;
  GpsStatus status;

  String getStatusString() const {
    switch (status) {
      case GPS_LOCKED: return "LOCKED";
      case GPS_ACQUIRING: return "SEARCHING";
      case GPS_NO_FIX: return "LOST";
      case GPS_UNAVAILABLE: return "UNAVAILABLE";
      case GPS_ERROR: return "ERROR";
      default: return "UNAVAILABLE";
    }
  }
};

struct DeviceMetadata {
  int batteryPercent;
  bool batteryIsNull;
  int signalStrengthDbm;
  bool signalIsNull;
  String firmwareVersion;
};

struct SensorPackage {
  SensorValue temperature;
  SensorValue humidity;
  SensorValue co2;
  SensorValue voc;
  SensorValue gas;
  GpsData gps;
  DeviceMetadata device;
  String timestamp;
};

#endif // TRACEFRESH_SENSORS_H
