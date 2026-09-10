def calculate_visual_severity(detections, total_area_percent=0.0):
    """
    Computes overall visual inspection severity level based on detection types,
    confidence, affected surface area, and anomaly count.
    
    Returns:
    {
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "overallVisualStatus": "OPTIMAL|MONITOR|ATTENTION_REQUIRED|CRITICAL_DEFECT",
      "visualRiskScore": 45,  # 0 to 100
      "summary": "..."
    }
    """
    if not detections or len(detections) == 0:
        return {
            "severity": "LOW",
            "overallVisualStatus": "VERIFIED_FRESH",
            "visualRiskScore": 5,
            "summary": "No visible surface anomalies detected. Produce surface appears healthy."
        }

    risk_score = 0
    has_critical_type = False
    has_high_type = False

    for d in detections:
        label = d.get("label", "UNKNOWN")
        conf = d.get("confidence", 0.8)
        area = d.get("areaPercent", 1.0)

        # Base risk contribution by category
        if label in ["MOLD_LIKE", "ROT_LIKE_DAMAGE"]:
            has_critical_type = True
            risk_score += int(35 * conf + (area * 3.0))
        elif label in ["BRUISING", "DISCOLORATION", "CRACK", "CUT"]:
            has_high_type = True
            risk_score += int(25 * conf + (area * 2.0))
        elif label in ["WAX_LIKE_APPEARANCE", "SURFACE_SPOT", "TEXTURE_ANOMALY"]:
            risk_score += int(15 * conf + (area * 1.5))
        else:
            risk_score += int(10 * conf)

    risk_score = max(0, min(100, risk_score))

    if risk_score >= 65 or (has_critical_type and total_area_percent > 3.0):
        severity = "CRITICAL"
        status = "WARNING"
        summary = f"High visual risk: {len(detections)} surface anomaly region(s) detected affecting {total_area_percent:.1f}% of surface area."
    elif risk_score >= 35 or has_high_type:
        severity = "HIGH"
        status = "ATTENTION_REQUIRED"
        summary = f"Moderate visual risk: {len(detections)} surface anomaly region(s) detected. Close monitoring recommended."
    elif risk_score >= 15:
        severity = "MEDIUM"
        status = "MONITOR"
        summary = f"Minor surface variations detected affecting {total_area_percent:.1f}% of produce surface."
    else:
        severity = "LOW"
        status = "VERIFIED_FRESH"
        summary = "Produce surface meets visual baseline standards with minimal minor variations."

    return {
        "severity": severity,
        "overallVisualStatus": status,
        "visualRiskScore": risk_score,
        "summary": summary
    }
