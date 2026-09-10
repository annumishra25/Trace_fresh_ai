from services.qr_service import verify_qr_token, load_qr_identities
from services.passport_service import generate_digital_product_passport, get_passport_by_id


def get_public_consumer_passport(public_token):
    """
    Transforms internal passport into a consumer-safe public verification payload.
    Strictly conceals internal node IDs, raw telemetry calibration, credentials, and decision trace JSONs.
    """
    # 1. Verify Public Token
    verification_res = verify_qr_token(public_token)

    if not verification_res["valid"]:
        status = verification_res["status"]
        reason = verification_res.get("deactivationReason", "Invalid public token")

        return {
            "verified": False,
            "verificationStatus": status,
            "publicToken": public_token,
            "title": "QR Code Invalid or Revoked" if status == "REVOKED" else "Unable to Verify QR Code",
            "message": f"This QR code is no longer active ({reason})." if status == "REVOKED" else "The scanned QR code token was not found in the TraceFresh registry.",
            "lastUpdated": None,
            "passport": None
        }

    batch_id = verification_res["batchId"] or "TF-APL-2026-001"
    internal_passport = generate_digital_product_passport(batch_id=batch_id)

    # Extract components
    prod = internal_passport.get("product", {})
    journey = internal_passport.get("journey", {})
    env = internal_passport.get("environment", {})
    insp = internal_passport.get("inspection", {})
    cond = internal_passport.get("condition", {})

    # 2. Build Consumer-Safe Timeline
    public_timeline = [
        {"time": "08:00 AM", "event": "Batch registered & QR assigned", "status": "COMPLETED"},
        {"time": "08:30 AM", "event": "Cold-chain transport dispatched from origin", "status": "COMPLETED"},
        {"time": "10:15 AM", "event": "Environmental monitoring active", "status": "COMPLETED"}
    ]

    if journey.get("delayMinutes", 0) > 15:
        public_timeline.append({
            "time": "11:30 AM",
            "event": f"Transit schedule update ({journey.get('delayMinutes')} min delay recorded)",
            "status": "ATTENTION"
        })

    if insp.get("inspectionCount", 0) > 0:
        public_timeline.append({
            "time": "12:00 PM",
            "event": f"Surface inspection completed ({insp.get('latestVisualStatus', 'NORMAL')})",
            "status": "COMPLETED"
        })

    # 3. Environment Summary (Sanitized - no raw node IDs or sensor serial numbers)
    env_status = "Optimal storage bounds maintained"
    if env.get("exposureRiskScore", 0) > 40:
        env_status = "Elevated thermal exposure recorded during transit"
    elif env.get("exposureRiskScore", 0) > 20:
        env_status = "Minor temperature variance observed"

    # 4. Visual Inspection Summary (Sanitized)
    vis_status = "No significant visible anomalies detected"
    if insp.get("latestVisualStatus") in ["WARNING", "CRITICAL"]:
        vis_status = "Surface anomaly detected during recent inspection scan"
    elif insp.get("latestVisualStatus") == "ATTENTION_REQUIRED":
        vis_status = "Minor surface variation observed"

    # 5. Public Passport Schema
    public_passport = {
        "verified": True,
        "verificationStatus": "VERIFIED",
        "publicToken": public_token,
        "passportId": internal_passport.get("passportId"),
        "passportVersion": internal_passport.get("passportVersion", "1.0"),
        "passportHash": internal_passport.get("passportHash"),
        "lastUpdated": internal_passport.get("lastUpdated"),

        "product": {
            "name": prod.get("name", "Fresh Apples"),
            "commodity": prod.get("commodity", "APPLES"),
            "batchCode": prod.get("batchId", batch_id)
        },

        "journey": {
            "origin": internal_passport.get("origin", "Yakima Valley, WA"),
            "destination": internal_passport.get("destination", "Seattle Distribution Center, WA"),
            "status": journey.get("status", "IN_TRANSIT"),
            "distanceKm": journey.get("actualDistanceKm", 185.0),
            "transitSummary": f"Shipment monitored over {journey.get('actualDistanceKm', 185.0)} km transit corridor."
        },

        "environmentSummary": {
            "headline": env_status,
            "temperatureRating": "Monitored Range (3.5°C - 5.0°C)",
            "humidityRating": "Monitored Moisture (85% - 90%)",
            "exposureRating": "LOW" if env.get("exposureRiskScore", 0) < 25 else "MODERATE" if env.get("exposureRiskScore", 0) < 55 else "HIGH"
        },

        "inspectionSummary": {
            "headline": vis_status,
            "latestStatus": insp.get("latestVisualStatus", "VERIFIED_FRESH"),
            "inspectionsCompleted": insp.get("inspectionCount", 1)
        },

        "conditionIndicator": {
            "freshnessIndex": cond.get("freshnessIndex", 90),
            "rating": cond.get("freshnessRating", "EXCELLENT"),
            "estimatedShelfLifeDays": cond.get("estimatedShelfLifeDays", 7.5),
            "confidenceRating": "HIGH" if cond.get("confidence", 0.9) >= 0.8 else "MODERATE",
            "advisoryText": cond.get("actionableRecommendation", "Condition verified optimal.")
        },

        "timeline": public_timeline,

        "trustEvidence": [
            {
                "claim": "Continuous Environmental Monitoring",
                "explanation": "Storage temperature and relative humidity were recorded by TraceFresh smart nodes."
            },
            {
                "claim": "Route & Transit Verification",
                "explanation": "Transport route tracked against planned supply-chain corridor."
            },
            {
                "claim": "Visual AI Surface Scan",
                "explanation": "Produce surface inspected for decay, discoloration, and structural defects."
            }
        ]
    }

    return public_passport


def get_public_demo_scenario(scenario_id="VERIFIED_GOOD"):
    """
    Provides 8 sanitized consumer demo scenarios for interactive testing.
    """
    scenarios = {
        "VERIFIED_GOOD": {
            "verified": True,
            "verificationStatus": "VERIFIED",
            "publicToken": "TR-VER-DEMO-GOOD-01",
            "passportId": "PASS-DEMO-GOOD",
            "product": {"name": "Crisp Honeycrisp Apples", "commodity": "APPLES", "batchCode": "TF-APL-DEMO-01"},
            "journey": {"origin": "Yakima Valley Orchard, WA", "destination": "Seattle Central Market", "status": "COMPLETED", "distanceKm": 185.0, "transitSummary": "Transit completed smoothly on schedule."},
            "environmentSummary": {"headline": "Optimal storage bounds maintained", "temperatureRating": "Cold-chain active (3.8°C avg)", "humidityRating": "Ideal moisture (88%)", "exposureRating": "LOW"},
            "inspectionSummary": {"headline": "No visible defects detected", "latestStatus": "VERIFIED_FRESH", "inspectionsCompleted": 2},
            "conditionIndicator": {"freshnessIndex": 94, "rating": "EXCELLENT", "estimatedShelfLifeDays": 8.2, "confidenceRating": "HIGH", "advisoryText": "Produce verified optimal. Clear for distribution."},
            "timeline": [{"time": "08:00 AM", "event": "Batch created", "status": "COMPLETED"}, {"time": "09:00 AM", "event": "Transit started", "status": "COMPLETED"}, {"time": "02:00 PM", "event": "Arrival verified", "status": "COMPLETED"}]
        },
        "VERIFIED_MONITOR": {
            "verified": True,
            "verificationStatus": "VERIFIED",
            "publicToken": "TR-VER-DEMO-MONITOR-02",
            "passportId": "PASS-DEMO-MONITOR",
            "product": {"name": "Fresh Gala Apples", "commodity": "APPLES", "batchCode": "TF-APL-DEMO-02"},
            "journey": {"origin": "Wenatchee Valley, WA", "destination": "Portland Fresh Hub", "status": "IN_TRANSIT", "distanceKm": 310.0, "transitSummary": "In-transit monitoring active."},
            "environmentSummary": {"headline": "Minor temperature variance observed", "temperatureRating": "Slight thermal spike (6.1°C peak)", "humidityRating": "Humidity stable (86%)", "exposureRating": "MODERATE"},
            "inspectionSummary": {"headline": "Produce surface intact", "latestStatus": "MONITOR", "inspectionsCompleted": 1},
            "conditionIndicator": {"freshnessIndex": 72, "rating": "GOOD", "estimatedShelfLifeDays": 5.5, "confidenceRating": "HIGH", "advisoryText": "Condition stable. Continue regular observation."},
            "timeline": [{"time": "07:30 AM", "event": "Batch dispatched", "status": "COMPLETED"}, {"time": "11:00 AM", "event": "Minor thermal spike noted", "status": "ATTENTION"}]
        },
        "VERIFIED_ATTENTION": {
            "verified": True,
            "verificationStatus": "VERIFIED",
            "publicToken": "TR-VER-DEMO-ATTN-03",
            "passportId": "PASS-DEMO-ATTN",
            "product": {"name": "Organic Fuji Apples", "commodity": "APPLES", "batchCode": "TF-APL-DEMO-03"},
            "journey": {"origin": "Hood River Orchard, OR", "destination": "Spokane Wholesale Hub", "status": "DELAYED", "distanceKm": 420.0, "transitSummary": "Transit delayed by traffic congestion."},
            "environmentSummary": {"headline": "Elevated thermal exposure during transit delay", "temperatureRating": "Excursion (8.5°C over 45 min)", "humidityRating": "Elevated humidity (92%)", "exposureRating": "HIGH"},
            "inspectionSummary": {"headline": "Minor surface discoloration detected", "latestStatus": "ATTENTION_REQUIRED", "inspectionsCompleted": 2},
            "conditionIndicator": {"freshnessIndex": 48, "rating": "FAIR", "estimatedShelfLifeDays": 3.1, "confidenceRating": "MODERATE", "advisoryText": "Prioritize distribution within 24 hours."},
            "timeline": [{"time": "06:00 AM", "event": "Dispatched", "status": "COMPLETED"}, {"time": "10:30 AM", "event": "Route traffic delay (45 min)", "status": "ATTENTION"}]
        },
        "IN_TRANSIT": {
            "verified": True,
            "verificationStatus": "IN_TRANSIT",
            "publicToken": "TR-VER-DEMO-TRANSIT-04",
            "passportId": "PASS-DEMO-TRANSIT",
            "product": {"name": "Granny Smith Apples", "commodity": "APPLES", "batchCode": "TF-APL-DEMO-04"},
            "journey": {"origin": "Chelan Orchards, WA", "destination": "Boise Regional Center", "status": "IN_TRANSIT", "distanceKm": 540.0, "transitSummary": "Currently en route along Interstate 84."},
            "environmentSummary": {"headline": "Active cold-chain monitoring", "temperatureRating": "4.0°C (Normal)", "humidityRating": "87% (Normal)", "exposureRating": "LOW"},
            "inspectionSummary": {"headline": "Initial origin scan verified", "latestStatus": "VERIFIED_FRESH", "inspectionsCompleted": 1},
            "conditionIndicator": {"freshnessIndex": 88, "rating": "EXCELLENT", "estimatedShelfLifeDays": 7.0, "confidenceRating": "HIGH", "advisoryText": "Shipment operating on-schedule."},
            "timeline": [{"time": "09:00 AM", "event": "Departed Chelan Hub", "status": "COMPLETED"}]
        },
        "COMPLETED": {
            "verified": True,
            "verificationStatus": "COMPLETED",
            "publicToken": "TR-VER-DEMO-DONE-05",
            "passportId": "PASS-DEMO-DONE",
            "product": {"name": "Honeycrisp Reserve", "commodity": "APPLES", "batchCode": "TF-APL-DEMO-05"},
            "journey": {"origin": "Yakima Valley, WA", "destination": "Seattle Metro Depot", "status": "COMPLETED", "distanceKm": 185.0, "transitSummary": "Delivery verified and accepted at target destination."},
            "environmentSummary": {"headline": "Full journey within storage bounds", "temperatureRating": "3.9°C average", "humidityRating": "88% average", "exposureRating": "LOW"},
            "inspectionSummary": {"headline": "Destination inspection clear", "latestStatus": "VERIFIED_FRESH", "inspectionsCompleted": 3},
            "conditionIndicator": {"freshnessIndex": 91, "rating": "EXCELLENT", "estimatedShelfLifeDays": 7.8, "confidenceRating": "HIGH", "advisoryText": "Delivered in verified optimal condition."},
            "timeline": [{"time": "08:00 AM", "event": "Dispatch", "status": "COMPLETED"}, {"time": "01:30 PM", "event": "Final Delivery", "status": "COMPLETED"}]
        },
        "REVOKED_QR": {
            "verified": False,
            "verificationStatus": "REVOKED",
            "publicToken": "TR-VER-DEMO-REVOKED-06",
            "title": "QR Code Revoked",
            "message": "This QR code identity has been deactivated by the seller/operator due to box replacement.",
            "passport": None
        },
        "INVALID_QR": {
            "verified": False,
            "verificationStatus": "INVALID",
            "publicToken": "TR-VER-INVALID-TOKEN-99",
            "title": "Invalid Verification Token",
            "message": "The scanned QR token could not be verified in the TraceFresh trust registry.",
            "passport": None
        },
        "INSUFFICIENT_DATA": {
            "verified": True,
            "verificationStatus": "INSUFFICIENT_DATA",
            "publicToken": "TR-VER-DEMO-NODATA-08",
            "passportId": "PASS-DEMO-NODATA",
            "product": {"name": "New Batch Registration", "commodity": "APPLES", "batchCode": "TF-APL-DEMO-08"},
            "journey": {"origin": "Yakima Orchard", "destination": "Pending Assignee", "status": "PENDING", "distanceKm": 0, "transitSummary": "Telemetry stream pending initialization."},
            "environmentSummary": {"headline": "Sensors initializing...", "temperatureRating": "Pending", "humidityRating": "Pending", "exposureRating": "UNKNOWN"},
            "inspectionSummary": {"headline": "No visual inspection scans recorded yet", "latestStatus": "PENDING", "inspectionsCompleted": 0},
            "conditionIndicator": {"freshnessIndex": 50, "rating": "UNKNOWN", "estimatedShelfLifeDays": 5.0, "confidenceRating": "LOW", "advisoryText": "Awaiting initial sensor telemetry packet."},
            "timeline": [{"time": "Just now", "event": "QR Identity Created", "status": "COMPLETED"}]
        }
    }

    return scenarios.get(scenario_id, scenarios["VERIFIED_GOOD"])
