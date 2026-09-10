/*
 * TraceFresh Smart Monitoring Node (TF-NODE-01 / TF-NODE-02)
 * Arduino IDE Single Sketch Wrapper
 * 
 * Hardware Support: ESP32-WROOM-32 / ESP32-S3
 * Sensors: Temperature/Humidity (DHT11/SHT45), VOC (MQ135), GPS (NEO-6M), Battery Divider
 * Pipeline Contract: POST /api/telemetry (Source: "hardware")
 */

#include <Arduino.h>
#include "../include/config.h"
#include "../include/sensors.h"
#include "../src/sensors/temp_hum_driver.cpp"
#include "../src/sensors/voc_gas_driver.cpp"
#include "../src/sensors/co2_driver.cpp"
#include "../src/gps/gps_driver.cpp"
#include "../src/power/battery_driver.cpp"
#include "../src/network/wifi_manager.cpp"
#include "../src/network/http_client.cpp"
#include "../src/telemetry/telemetry_builder.cpp"
#include "../src/telemetry/offline_buffer.cpp"
#include "../src/main.cpp"
