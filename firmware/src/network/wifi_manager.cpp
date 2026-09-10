#include "wifi_manager.h"

WifiManager::WifiManager(const char* ssid, const char* password) 
  : ssid(ssid), password(password), lastReconnectAttempt(0), isConnectedState(false) {}

void WifiManager::begin() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("[INFO] WiFi connecting to SSID: ");
  Serial.println(ssid);
}

void WifiManager::update() {
  if (WiFi.status() == WL_CONNECTED) {
    if (!isConnectedState) {
      isConnectedState = true;
      Serial.print("[INFO] WiFi connected successfully! IP: ");
      Serial.println(WiFi.localIP());
    }
  } else {
    if (isConnectedState) {
      isConnectedState = false;
      Serial.println("[WARN] WiFi disconnected!");
    }

    if (millis() - lastReconnectAttempt > WIFI_RECONNECT_INTERVAL_MS) {
      lastReconnectAttempt = millis();
      Serial.println("[INFO] Attempting WiFi reconnection...");
      WiFi.disconnect();
      WiFi.begin(ssid, password);
    }
  }
}

bool WifiManager::isConnected() {
  return (WiFi.status() == WL_CONNECTED);
}

int WifiManager::getRssi() {
  if (isConnected()) {
    return WiFi.RSSI();
  }
  return 0;
}
