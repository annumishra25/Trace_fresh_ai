from math import floor


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def normalize_visual_class(visual_class: str) -> str:
    return (visual_class or "").strip().lower()


def assess_batch_quality(payload):
    fruit_type = (payload.get("fruitType") or "").strip().lower()
    visual_class = normalize_visual_class(payload.get("visualClass"))
    confidence = float(payload.get("confidence", 0.85))

    temperature = float(payload.get("temperature", 25))
    humidity = float(payload.get("humidity", 60))
    mq135 = float(payload.get("mq135", 180))

    # -----------------------------
    # 1) Base freshness score
    # -----------------------------
    freshness_score = 95

    # Visual quality contribution
    expected_visual = f"fresh{fruit_type}" if fruit_type else ""
    if visual_class and expected_visual and visual_class == expected_visual:
        freshness_score += 0
    elif visual_class and "fresh" in visual_class:
        freshness_score -= 6
    else:
        freshness_score -= 18

    # Confidence adjustment
    freshness_score += (confidence - 0.85) * 20

    # Temperature penalty
    if temperature > 32:
        freshness_score -= 18
    elif temperature > 28:
        freshness_score -= 10
    elif temperature > 25:
        freshness_score -= 4
    elif temperature < 10:
        freshness_score -= 8

    # Humidity penalty
    if humidity > 85:
        freshness_score -= 12
    elif humidity > 75:
        freshness_score -= 7
    elif humidity < 35:
        freshness_score -= 6

    # MQ135 / spoilage gas penalty
    if mq135 > 500:
        freshness_score -= 18
    elif mq135 > 350:
        freshness_score -= 10
    elif mq135 > 250:
        freshness_score -= 5

    freshness_score = clamp(round(freshness_score, 1), 35, 99)

    # -----------------------------
    # 2) Spoilage risk
    # -----------------------------
    spoilage_risk = 100 - freshness_score

    # small adjustments for elevated stress
    if temperature > 30:
        spoilage_risk += 4
    if humidity > 75:
        spoilage_risk += 3
    if mq135 > 350:
        spoilage_risk += 5

    spoilage_risk = clamp(round(spoilage_risk, 1), 1, 95)

    # -----------------------------
    # 3) Shelf life estimate
    # -----------------------------
    shelf_life_days = round((freshness_score / 100) * 10, 1)
    if fruit_type == "banana":
        shelf_life_days = round(shelf_life_days * 0.7, 1)
    elif fruit_type == "orange":
        shelf_life_days = round(shelf_life_days * 0.9, 1)

    shelf_life_days = clamp(shelf_life_days, 1, 12)

    # -----------------------------
    # 4) Risk / status classification
    # -----------------------------
    suspicious_flag = False

    if freshness_score >= 85 and spoilage_risk <= 15:
        risk_level = "GOOD"
        status = "VERIFIED FRESH"
    elif freshness_score >= 65 and spoilage_risk <= 35:
        risk_level = "MONITOR"
        status = "MONITOR"
        suspicious_flag = True
    else:
        risk_level = "HIGH RISK"
        status = "WARNING"
        suspicious_flag = True

    # -----------------------------
    # 5) Storage condition summary
    # -----------------------------
    if temperature <= 26 and humidity <= 70 and mq135 <= 220:
        storage_condition = "Optimal"
    elif temperature <= 30 and humidity <= 78 and mq135 <= 350:
        storage_condition = "Good"
    elif temperature <= 34 and humidity <= 85 and mq135 <= 500:
        storage_condition = "Suboptimal"
    else:
        storage_condition = "High Risk"

    # -----------------------------
    # 6) Reason generation
    # -----------------------------
    reasons = []

    if visual_class == expected_visual:
        reasons.append(f"Visual profile is consistent with a fresh {fruit_type} batch")
    elif visual_class:
        reasons.append(f"Visual class '{visual_class}' does not perfectly match the expected fresh {fruit_type} profile")

    if temperature <= 26:
        reasons.append("Temperature remains within an acceptable storage band")
    elif temperature <= 30:
        reasons.append("Temperature is slightly elevated and may reduce shelf life if prolonged")
    else:
        reasons.append("Temperature is high enough to accelerate deterioration risk")

    if humidity <= 70:
        reasons.append("Humidity is currently within a stable storage range")
    elif humidity <= 80:
        reasons.append("Humidity is moderately elevated and should be monitored")
    else:
        reasons.append("Humidity is high and may accelerate spoilage or ripening")

    if mq135 <= 220:
        reasons.append("Current gas reading does not indicate a strong spoilage signal")
    elif mq135 <= 350:
        reasons.append("Gas reading is elevated and suggests early quality degradation risk")
    else:
        reasons.append("Gas reading is significantly elevated and may indicate active spoilage / ripening stress")

    # -----------------------------
    # 7) Advisory text
    # -----------------------------
    if status == "VERIFIED FRESH":
        quality_advisory = (
            "No major suspicious quality pattern detected. Visual assessment and storage conditions "
            "indicate that this batch is currently in a healthy freshness range."
        )
    elif status == "MONITOR":
        quality_advisory = (
            "Potential storage stress or accelerated ripening pattern detected. This batch should be "
            "monitored and re-checked soon to prevent avoidable quality loss."
        )
    else:
        quality_advisory = (
            "Elevated spoilage / deterioration risk detected. This batch requires immediate inspection "
            "and operational attention before further distribution."
        )

    return {
        "latestAssessment": {
            "visualClass": visual_class or expected_visual,
            "confidence": round(confidence, 2),
            "freshnessScore": freshness_score,
            "shelfLifeDays": shelf_life_days,
            "spoilageRisk": spoilage_risk,
            "riskLevel": risk_level,
            "status": status,
            "qualityAdvisory": quality_advisory,
            "suspiciousQualityFlag": suspicious_flag,
            "reasons": reasons
        },
        "latestSensors": {
            "temperature": temperature,
            "humidity": humidity,
            "mq135": mq135,
            "storageCondition": storage_condition
        }
    }