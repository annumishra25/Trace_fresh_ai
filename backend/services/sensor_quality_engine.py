from datetime import datetime, timezone


def evaluate_sensor_quality(normalized_record, recent_history=None):
    """
    Evaluates telemetry signal quality and data integrity.
    
    Returns:
    {
      "qualityScore": 95,  # 0 to 100
      "status": "GOOD|DEGRADED|BAD|OFFLINE",
      "issues": ["CO2 sensor missing", "Minor temperature spike"],
      "confidence": 0.95
    }
    """
    if not normalized_record or not isinstance(normalized_record, dict):
        return {
            "qualityScore": 0,
            "status": "OFFLINE",
            "issues": ["No telemetry data received"],
            "confidence": 0.0
        }

    score = 100
    issues = []

    temp = normalized_record.get("temperatureC")
    hum = normalized_record.get("humidityPct")
    co2 = normalized_record.get("co2Ppm")
    voc = normalized_record.get("vocIndex")
    gas = normalized_record.get("gasPpm")
    timestamp_str = normalized_record.get("timestamp")

    # 1. Critical Missing Sensor Checks
    if temp is None:
        score -= 30
        issues.append("Critical: Temperature sensor reading missing")

    if hum is None:
        score -= 25
        issues.append("Critical: Humidity sensor reading missing")

    # Optional Missing Sensors
    if co2 is None:
        issues.append("Notice: CO2 sensor not installed or disabled")

    if voc is None and gas is None:
        score -= 10
        issues.append("Warning: Air quality / VOC sensor missing")

    # 2. Out-of-Range Impossible Value Checks
    if temp is not None and (temp < -20.0 or temp > 65.0):
        score -= 25
        issues.append(f"Anomaly: Temperature ({temp}°C) out of plausible physical range [-20°C, 65°C]")

    if hum is not None and (hum < 5.0 or hum > 99.5):
        score -= 20
        issues.append(f"Anomaly: Humidity ({hum}%) out of plausible physical range [5%, 99%]")

    if gas is not None and (gas < 0.0 or gas > 1500.0):
        score -= 15
        issues.append(f"Anomaly: Gas reading ({gas} ppm) out of range")

    # 3. Timestamp & Staleness Validation
    if timestamp_str:
        try:
            ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            delta_sec = (now - ts).total_seconds()
            if delta_sec > 120:
                score -= 35
                issues.append(f"Stale: Telemetry is {int(delta_sec)} seconds old (>120s timeout)")
            elif delta_sec > 45:
                score -= 15
                issues.append(f"Warning: Telemetry delayed by {int(delta_sec)} seconds")
        except Exception:
            score -= 15
            issues.append("Warning: Invalid or unparseable timestamp format")

    # 4. History Checks (Sudden impossible jumps & stuck values)
    if recent_history and len(recent_history) >= 2:
        last_rec = recent_history[-1]
        prev_temp = last_rec.get("temperatureC")
        
        if temp is not None and prev_temp is not None:
            temp_diff = abs(temp - prev_temp)
            if temp_diff > 12.0:
                score -= 25
                issues.append(f"Jump Error: Unrealistic temperature jump of {temp_diff:.1f}°C between samples")

        # Stuck values check (5 identical consecutive readings)
        if len(recent_history) >= 5:
            temps = [r.get("temperatureC") for r in recent_history[-5:] if r.get("temperatureC") is not None]
            if len(temps) == 5 and len(set(temps)) == 1:
                score -= 15
                issues.append("Warning: Temperature sensor reported 5 identical consecutive readings (stuck sensor)")

    # Final Score & Status Calculation
    score = max(0, min(100, score))
    
    if score >= 85:
        status = "GOOD"
    elif score >= 60:
        status = "DEGRADED"
    elif score > 0:
        status = "BAD"
    else:
        status = "OFFLINE"

    confidence = round(score / 100.0, 2)

    return {
        "qualityScore": score,
        "status": status,
        "issues": issues,
        "confidence": confidence
    }
