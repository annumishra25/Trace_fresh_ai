def generate_fusion_explanation(
    status="NORMAL",
    overall_risk=10.0,
    component_risks=None,
    interactions=None,
    confidence_data=None,
    conflict_data=None,
    produce_type="APPLES",
    sensor_risk=None,
    route_risk=None,
    visual_risk=None,
    final_risk=None,
    confidence=None,
    confidence_penalties=None,
    interaction_effects=None,
    detections=None,
    anomalies=None,
    delay_reason=""
):
    """
    Generates structured, evidence-based human explainability output for Step 7 Fusion Engine.
    Flexible signature accepts both structured dict inputs or flat positional/kwargs.
    """
    # Normalize inputs
    if component_risks:
        s_risk = component_risks.get("sensorRisk", {}).get("score", 10.0)
        r_risk = component_risks.get("routeRisk", {}).get("score", 10.0)
        v_risk = component_risks.get("visualRisk", {}).get("score", 10.0)
    else:
        s_risk = sensor_risk if sensor_risk is not None else 10.0
        r_risk = route_risk if route_risk is not None else 10.0
        v_risk = visual_risk if visual_risk is not None else 10.0

    risk_score = final_risk if final_risk is not None else overall_risk

    primary_drivers = []
    evidence_statements = []

    # 1. Component Evidence & Drivers
    if s_risk >= 50:
        primary_drivers.append(f"High environmental exposure risk ({s_risk}/100)")
        evidence_statements.append(f"Sensor Telemetry: Severe thermal/humidity excursion detected on node sensors (Risk: {s_risk})")
    elif s_risk >= 25:
        evidence_statements.append(f"Sensor Telemetry: Minor temperature/humidity fluctuation recorded (Risk: {s_risk})")
    else:
        evidence_statements.append("Sensor Telemetry: All environmental sensors within optimal storage bounds.")

    if r_risk >= 50:
        primary_drivers.append(f"Critical transit delay/deviation ({r_risk}/100)")
        evidence_statements.append(f"Route Engine: Transit delay/deviation detected ({delay_reason or 'Delayed ETA'}) (Risk: {r_risk})")
    elif r_risk >= 25:
        evidence_statements.append(f"Route Engine: Minor schedule variance ({delay_reason or 'Transit variance'}) (Risk: {r_risk})")
    else:
        evidence_statements.append("Route Engine: Shipment operating on-schedule along planned corridor.")

    if v_risk >= 50:
        det_list = [d.get("label", "Anomaly") for d in detections] if detections else ["Surface defect"]
        primary_drivers.append(f"Visual surface anomaly detected ({v_risk}/100)")
        evidence_statements.append(f"Vision AI: Surface anomaly detected: {', '.join(set(det_list))} (Risk: {v_risk})")
    elif v_risk >= 25:
        evidence_statements.append(f"Vision AI: Minor surface discoloration/variations detected (Risk: {v_risk})")
    else:
        evidence_statements.append("Vision AI: Surface scan confirms clean, healthy produce appearance.")

    # 2. Compound Interactions
    rules = []
    if interactions:
        rules = interactions.get("activeRules", [])
    elif interaction_effects:
        rules = [{"rule": eff, "description": eff} for eff in interaction_effects]

    for rule in rules:
        r_name = rule.get("rule", "Compound Interaction")
        primary_drivers.append(f"Compound interaction: {r_name}")
        evidence_statements.append(f"Multi-Modal Interaction: {rule.get('description', r_name)}")

    # 3. Conflicts
    is_conflict = conflict_data.get("conflictDetected", False) if conflict_data else False
    if is_conflict or status == "SIGNAL_CONFLICT":
        primary_drivers.append("Multi-modal signal conflict detected")
        evidence_statements.append("Signal Resolution: Discrepancy identified between environmental sensors and visual AI inspection.")

    if not primary_drivers:
        primary_drivers.append("All signals optimal - low composite risk")

    # 4. Actionable Recommendation
    if status == "CRITICAL_ACTION_REQUIRED" or risk_score >= 75:
        recommendation = "Isolate shipment immediately. High risk of produce decay — re-route to nearest market within 12 hours or perform manual QA."
    elif status == "WARNING_DISPATCH":
        recommendation = "Prioritize dispatch and distribution within 24-48 hours. Monitor active cold-chain cooling."
    elif status == "SIGNAL_CONFLICT":
        recommendation = "Perform physical visual inspection. Sensor metrics and camera scans report conflicting condition indicators."
    elif status == "ATTENTION_REQUIRED":
        recommendation = "Review storage environment parameters. Keep under regular observation."
    else:
        recommendation = "Shipment verified optimal. Continue standard transit and storage operations."

    summary = f"{status} condition assessment for {produce_type} (Composite Risk: {risk_score}/100)."

    return {
        "overallCondition": status,
        "summaryText": summary,
        "actionableDriver": primary_drivers[0] if primary_drivers else "Normal condition",
        "primaryDrivers": primary_drivers,
        "evidenceStatements": evidence_statements,
        "recommendation": recommendation,
        "recommendedAction": recommendation,
        "primaryContributors": primary_drivers,
        "confidencePenalties": confidence_penalties if confidence_penalties else ["Full signal confidence maintained"]
    }
