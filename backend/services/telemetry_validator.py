from datetime import datetime

ALLOWED_SENSOR_STATUSES = {"OK", "MISSING", "ERROR", "STALE", "CALIBRATING"}
ALLOWED_GPS_STATUSES = {"LOCKED", "SEARCHING", "LOST", "UNAVAILABLE"}
ALLOWED_SOURCES = {"simulator", "hardware", "manual_test"}
REQUIRED_SENSORS = {"temperature", "humidity", "co2", "voc", "gas"}

def is_number(val):
    if val is None or isinstance(val, bool):
        return False
    return isinstance(val, (int, float))

def validate_telemetry_payload(payload):
    """
    Validates telemetry payload structure according to TraceFresh Telemetry Contract.
    Returns tuple: (is_valid, errors_list, normalized_payload)
    """
    errors = []
    
    if not isinstance(payload, dict):
        return False, ["Payload must be a JSON object"], None
        
    normalized = dict(payload)

    # 1. Validate nodeId
    node_id = normalized.get("nodeId")
    if not node_id or not isinstance(node_id, str) or not node_id.strip():
        errors.append("Field 'nodeId' is required and must be a non-empty string.")

    # 2. Validate timestamp
    timestamp = normalized.get("timestamp")
    if not timestamp or not isinstance(timestamp, str):
        errors.append("Field 'timestamp' is required and must be an ISO 8601 string.")
    else:
        try:
            # Check basic ISO format parsing
            clean_ts = timestamp.replace("Z", "+00:00")
            datetime.fromisoformat(clean_ts)
        except Exception:
            errors.append(f"Timestamp '{timestamp}' is not a valid ISO 8601 date string.")

    # 3. Validate sensors
    sensors = normalized.get("sensors")
    if not isinstance(sensors, dict):
        errors.append("Field 'sensors' is required and must be an object.")
    else:
        for sensor_name in REQUIRED_SENSORS:
            if sensor_name not in sensors or not isinstance(sensors[sensor_name], dict):
                errors.append(f"Sensor '{sensor_name}' is missing or not an object in 'sensors'.")
                continue

            s_data = sensors[sensor_name]
            status = s_data.get("status")
            value = s_data.get("value")

            if status not in ALLOWED_SENSOR_STATUSES:
                errors.append(
                    f"Sensor '{sensor_name}' status must be one of {sorted(list(ALLOWED_SENSOR_STATUSES))}, got '{status}'."
                )

            if status == "OK":
                if not is_number(value):
                    errors.append(f"Sensor '{sensor_name}' with status 'OK' must have a numeric 'value', got {value}.")
            else:
                if value is not None and not is_number(value):
                    errors.append(f"Sensor '{sensor_name}' value must be numeric or null when status is '{status}'.")

    # 4. Validate GPS
    gps = normalized.get("gps")
    if not isinstance(gps, dict):
        errors.append("Field 'gps' is required and must be an object.")
    else:
        lat = gps.get("latitude")
        lon = gps.get("longitude")
        speed = gps.get("speedKmh")
        accuracy = gps.get("accuracyM")
        gps_status = gps.get("status")

        if gps_status not in ALLOWED_GPS_STATUSES:
            errors.append(f"GPS status must be one of {sorted(list(ALLOWED_GPS_STATUSES))}, got '{gps_status}'.")

        if lat is not None:
            if not is_number(lat) or not (-90.0 <= float(lat) <= 90.0):
                errors.append(f"GPS latitude must be between -90 and 90, got {lat}.")

        if lon is not None:
            if not is_number(lon) or not (-180.0 <= float(lon) <= 180.0):
                errors.append(f"GPS longitude must be between -180 and 180, got {lon}.")

        if speed is not None and (not is_number(speed) or float(speed) < 0):
            errors.append(f"GPS speedKmh must be a non-negative number, got {speed}.")

        if accuracy is not None and (not is_number(accuracy) or float(accuracy) < 0):
            errors.append(f"GPS accuracyM must be a non-negative number, got {accuracy}.")

    # 5. Validate Device metadata
    device = normalized.get("device")
    if not isinstance(device, dict):
        errors.append("Field 'device' is required and must be an object.")
    else:
        battery = device.get("batteryPercent")
        signal = device.get("signalStrengthDbm")

        if battery is not None:
            if not is_number(battery) or not (0 <= float(battery) <= 100):
                errors.append(f"Device batteryPercent must be between 0 and 100, got {battery}.")

        if signal is not None:
            if not is_number(signal) or not (-150 <= float(signal) <= 0):
                errors.append(f"Device signalStrengthDbm must be between -150 and 0 dBm, got {signal}.")

    # 6. Validate source
    source = normalized.get("source", "simulator")
    if source not in ALLOWED_SOURCES:
        errors.append(f"Field 'source' must be one of {sorted(list(ALLOWED_SOURCES))}, got '{source}'.")
    normalized["source"] = source

    is_valid = len(errors) == 0
    return is_valid, errors, normalized
