#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include "config.h"
#include <WiFi.h>

class WifiManager {
private:
  const char* ssid;
  const char* password;
  unsigned long lastReconnectAttempt;
  bool isConnectedState;

public:
  WifiManager(const char* ssid = WIFI_SSID, const char* password = WIFI_PASSWORD);
  void begin();
  void update();
  bool isConnected();
  int getRssi();
};

#endif // WIFI_MANAGER_H
