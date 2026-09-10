#include "offline_buffer.h"

OfflineBuffer::OfflineBuffer() : head(0), tail(0), count(0) {}

bool OfflineBuffer::push(const String& jsonPayload) {
  if (count >= MAX_OFFLINE_BUFFER_SIZE) {
    // Drop oldest item to prevent memory exhaustion
    head = (head + 1) % MAX_OFFLINE_BUFFER_SIZE;
    count--;
    Serial.println("[WARN] Offline telemetry buffer full! Dropping oldest packet.");
  }

  buffer[tail] = jsonPayload;
  tail = (tail + 1) % MAX_OFFLINE_BUFFER_SIZE;
  count++;
  Serial.print("[INFO] Telemetry buffered locally. Current buffer size: ");
  Serial.println(count);
  return true;
}

String OfflineBuffer::pop() {
  if (count == 0) return "";

  String payload = buffer[head];
  head = (head + 1) % MAX_OFFLINE_BUFFER_SIZE;
  count--;
  return payload;
}

bool OfflineBuffer::isEmpty() const {
  return count == 0;
}

int OfflineBuffer::size() const {
  return count;
}

void OfflineBuffer::clear() {
  head = 0;
  tail = 0;
  count = 0;
}
