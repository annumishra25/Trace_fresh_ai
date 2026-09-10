#ifndef NETWORK_HTTP_CLIENT_H
#define NETWORK_HTTP_CLIENT_H

#include "config.h"
#include "offline_buffer.h"
#include <HTTPClient.h>
#include <WiFi.h>

class TelemetryHttpClient {
private:
  const char* backendUrl;

public:
  TelemetryHttpClient(const char* url = BACKEND_TELEMETRY_URL);
  bool sendTelemetry(const String& jsonPayload);
  void flushBuffer(OfflineBuffer& buffer);
};

#endif // NETWORK_HTTP_CLIENT_H
