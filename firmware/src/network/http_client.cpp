#include "http_client.h"

TelemetryHttpClient::TelemetryHttpClient(const char* url) : backendUrl(url) {}

bool TelemetryHttpClient::sendTelemetry(const String& jsonPayload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WARN] HTTP Tx skipped: WiFi not connected");
    return false;
  }

  HTTPClient http;
  http.begin(backendUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4000); // 4 second connection timeout

  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    String response = http.getString();
    if (httpCode == HTTP_CODE_CREATED || httpCode == HTTP_CODE_OK) {
      Serial.print("[INFO] Telemetry POST Success (");
      Serial.print(httpCode);
      Serial.println(")");
      http.end();
      return true;
    } else {
      Serial.print("[ERROR] HTTP POST Error Code: ");
      Serial.print(httpCode);
      Serial.print(" | Response: ");
      Serial.println(response);
    }
  } else {
    Serial.print("[ERROR] HTTP Connection failed: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
  return false;
}

void TelemetryHttpClient::flushBuffer(OfflineBuffer& buffer) {
  if (buffer.isEmpty() || WiFi.status() != WL_CONNECTED) {
    return;
  }

  Serial.print("[INFO] Flushes ");
  Serial.print(buffer.size());
  Serial.println(" buffered offline telemetry packets to backend...");

  int flushedCount = 0;
  while (!buffer.isEmpty() && WiFi.status() == WL_CONNECTED && flushedCount < 10) {
    String payload = buffer.pop();
    if (!sendTelemetry(payload)) {
      // Re-push payload to buffer if transmission fails
      buffer.push(payload);
      break;
    }
    flushedCount++;
    delay(200); // Brief delay between burst packets
  }
}
