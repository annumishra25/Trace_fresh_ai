#ifndef TRACEFRESH_CONFIG_H
#define TRACEFRESH_CONFIG_H

#include <Arduino.h>

// ============================================================
// 1. NODE IDENTIFICATION & FIRMWARE METADATA
// ============================================================
// To flash Node 01: #define NODE_ID "TF-NODE-01"
// To flash Node 02: #define NODE_ID "TF-NODE-02"
#ifndef NODE_ID
#define NODE_ID "TF-NODE-01"
#endif

#define FIRMWARE_VERSION "0.2.0"
#define HARDWARE_REVISION "ESP32-REV2-MULTINODE"

// ============================================================
// 2. NETWORK & BACKEND CONFIGURATION
// ============================================================
#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_WIFI_SSID"
#endif

#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#endif

// IMPORTANT: Do NOT use "localhost" on ESP32!
// Replace <SERVER_LAN_IP> with the IPv4 address of your computer running Flask
#ifndef BACKEND_TELEMETRY_URL
#define BACKEND_TELEMETRY_URL "http://192.168.1.100:5000/api/telemetry"
#endif

// ============================================================
// 3. HARDWARE PIN DEFINITIONS (ESP32-WROOM-32)
// ============================================================
#define DHT_PIN 4
#define DHT_TYPE DHT11

#define MQ135_PIN 34

#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GPS_BAUD 9600

#define BATTERY_PIN 35
#define DIAGNOSTIC_BUTTON_PIN 0
#define STATUS_LED_PIN 2

// ============================================================
// 4. TIMING & SAMPLING INTERVALS (NON-BLOCKING)
// ============================================================
#define SENSOR_READ_INTERVAL_MS 2000
#define GPS_READ_INTERVAL_MS 1000
#define TELEMETRY_SEND_INTERVAL_MS 3000
#define WIFI_RECONNECT_INTERVAL_MS 5000
#define MQ135_WARMUP_MS 20000

// ============================================================
// 5. OFFLINE STORAGE & SAFETY BOUNDS
// ============================================================
#define MAX_OFFLINE_BUFFER_SIZE 50

#define TEMP_MIN_C -20.0f
#define TEMP_MAX_C 70.0f
#define HUM_MIN_PCT 0.0f
#define HUM_MAX_PCT 100.0f

#endif // TRACEFRESH_CONFIG_H
