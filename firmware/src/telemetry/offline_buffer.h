#ifndef OFFLINE_BUFFER_H
#define OFFLINE_BUFFER_H

#include "config.h"
#include <Arduino.h>

class OfflineBuffer {
private:
  String buffer[MAX_OFFLINE_BUFFER_SIZE];
  int head;
  int tail;
  int count;

public:
  OfflineBuffer();
  bool push(const String& jsonPayload);
  String pop();
  bool isEmpty() const;
  int size() const;
  void clear();
};

#endif // OFFLINE_BUFFER_H
