import math
from datetime import datetime, timezone


def normalize_sensor_value(value, min_val, max_val, decimals=2):
    """Safely clamp and round floating point sensor values."""
    if value is None:
        return None
    try:
        val = float(value)
        if math.isnan(val) or math.isinf(val):
            return None
        val = max(min_val, min(max_val, val))
        return round(val, decimals)
    except (TypeError, ValueError):
        return None


def normalize_telemetry_payload(raw_telemetry):
    """
    Standardize telemetry payload into a clean, uniform schema.
    
    Structure:
    {
      "timestamp": "ISO-8601 UTC",
      "nodeId": "TF-NODE-01|TF-NODE-02",
      "shipmentId": "SHIP-APL-110",
      "batchId": "TF-APL-2026-001",
      "temperatureC": 5.8,
      "humidityPct": 71.2,
      "co2Ppm": null|number,
      "vocIndex": 1.4,
      "gasPpm": 0.35,
      "gasRaw": 180,
      "sensorQuality": 95,
      "source": "hardware|simulator",
      "battery": 88
    }
    """
    if not isinstance(raw_telemetry, dict):
        return None

    node_id = raw_telemetry.get("nodeId", "TF-NODE-01")
    timestamp = raw_telemetry.get("timestamp") or datetime.now(timezone.utc).isoformat()
    source = raw_telemetry.get("source", "simulator")
    shipment_id = raw_telemetry.get("assignedShipmentId") or raw_telemetry.get("shipmentId", "SHIP-APL-110")
    batch_id = raw_telemetry.get("assignedBatchId") or raw_telemetry.get("batchId", "TF-APL-2026-001")

    # Extract sensors dictionary or top-level fields
    sensors = raw_telemetry.get("sensors", {})
    if not isinstance(sensors, dict):
        sensors = {}

    # Temperature (°C)
    raw_temp = sensors.get("temperature", {}).get("value") if isinstance(sensors.get("temperature"), dict) else raw_telemetry.get("temperature")
    temp_c = normalize_sensor_value(raw_temp, -40.0, 85.0, 2)

    # Humidity (%)
    raw_hum = sensors.get("humidity", {}).get("value") if isinstance(sensors.get("humidity"), dict) else raw_telemetry.get("humidity")
    hum_pct = normalize_sensor_value(raw_hum, 0.0, 100.0, 2)

    # CO2 (ppm)
    raw_co2 = sensors.get("co2", {}).get("value") if isinstance(sensors.get("co2"), dict) else raw_telemetry.get("co2")
    co2_ppm = normalize_sensor_value(raw_co2, 0.0, 10000.0, 1)

    # VOC Index / VOC (ppm)
    raw_voc = sensors.get("voc", {}).get("value") if isinstance(sensors.get("voc"), dict) else raw_telemetry.get("voc")
    voc_index = normalize_sensor_value(raw_voc, 0.0, 1000.0, 2)

    # Gas (ppm or raw MQ135)
    raw_gas = sensors.get("gas", {}).get("value") if isinstance(sensors.get("gas"), dict) else raw_telemetry.get("gas", raw_telemetry.get("mq135"))
    gas_ppm = normalize_sensor_value(raw_gas, 0.0, 2000.0, 2)
    gas_raw = int(gas_ppm * 100) if gas_ppm is not None else None

    # Battery (%)
    device = raw_telemetry.get("device", {})
    raw_batt = device.get("batteryPercent") if isinstance(device, dict) else raw_telemetry.get("batteryPercent")
    battery = normalize_sensor_value(raw_batt, 0.0, 100.0, 0)

    return {
        "timestamp": timestamp,
        "nodeId": node_id,
        "shipmentId": shipment_id,
        "batchId": batch_id,
        "temperatureC": temp_c,
        "humidityPct": hum_pct,
        "co2Ppm": co2_ppm,
        "vocIndex": voc_index,
        "gasPpm": gas_ppm,
        "gasRaw": gas_raw,
        "source": source,
        "battery": battery
    }
