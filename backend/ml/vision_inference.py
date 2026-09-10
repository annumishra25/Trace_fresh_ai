from ml.vision_preprocess import preprocess_image_for_model
from ml.image_quality import evaluate_image_quality
from ml.vision_model import KerasFruitModelProvider, SurfaceAnomalyDetector, DemoVisionModelProvider
from services.vision_severity_engine import calculate_visual_severity

keras_provider = KerasFruitModelProvider()
surface_detector = SurfaceAnomalyDetector()
demo_provider = DemoVisionModelProvider()


def run_vision_inference(image_path_or_bytes, demo_scenario=None):
    """
    Unified Vision AI inference pipeline.
    Runs preprocessing, quality assessment, classification, surface anomaly detection,
    and visual severity calculation.
    """
    if demo_scenario:
        demo_res = demo_provider.predict_scenario(demo_scenario)
        meta = demo_provider.get_metadata()
        sev = calculate_visual_severity(demo_res["detections"], demo_res["totalAreaPercent"])
        return {
            "model": meta,
            "classification": demo_res["classification"],
            "imageQuality": {
                "qualityScore": 95,
                "status": "GOOD",
                "issues": [],
                "recommendation": "ACCEPTABLE"
            },
            "detections": demo_res["detections"],
            "totalAreaPercent": demo_res["totalAreaPercent"],
            "severityAssessment": sev,
            "fusionInterface": {
                "visualRisk": sev["visualRiskScore"],
                "visualStatus": sev["overallVisualStatus"],
                "confidence": round(demo_res["classification"]["confidence"] / 100.0, 2),
                "imageQuality": 95,
                "detections": demo_res["detections"],
                "visualEvents": [d["label"] for d in demo_res["detections"]]
            }
        }

    # Load & Preprocess image
    pil_img, numpy_array = preprocess_image_for_model(image_path_or_bytes)

    # 1. Quality Assessment
    quality_report = evaluate_image_quality(pil_img)

    # 2. Produce Classification (Deep Learning / Keras)
    classification = keras_provider.predict(pil_img, numpy_array)

    # 3. Surface Anomaly Detection (Color/Contour/Sheen)
    surface_res = surface_detector.predict(pil_img, numpy_array)
    detections = surface_res.get("detections", [])
    area_pct = surface_res.get("totalAreaPercent", 0.0)

    # 4. Severity Assessment
    severity_eval = calculate_visual_severity(detections, area_pct)
    meta = keras_provider.get_metadata()

    # If classification is "rotten*" but surface detector missed anomalies, inject primary anomaly
    class_label = classification.get("label", "").lower()
    if "rotten" in class_label and len(detections) == 0:
        w, h = pil_img.size
        anomaly_label = "MOLD_LIKE" if "apple" in class_label else "DISCOLORATION" if "banana" in class_label else "ROT_LIKE_DAMAGE"
        detections.append({
            "id": "DET-001",
            "label": anomaly_label,
            "confidence": round(classification["confidence"] / 100.0, 2),
            "severity": "HIGH",
            "bbox": {"x": int(w * 0.3), "y": int(h * 0.3), "width": int(w * 0.4), "height": int(h * 0.4)},
            "areaPercent": 4.5,
            "explanation": f"Model identified {class_label} visual characteristics."
        })
        area_pct = 4.5
        severity_eval = calculate_visual_severity(detections, area_pct)

    return {
        "model": meta,
        "classification": classification,
        "imageQuality": quality_report,
        "detections": detections,
        "totalAreaPercent": area_pct,
        "severityAssessment": severity_eval,
        "fusionInterface": {
            "visualRisk": severity_eval["visualRiskScore"],
            "visualStatus": severity_eval["overallVisualStatus"],
            "confidence": round(classification["confidence"] / 100.0, 2),
            "imageQuality": quality_report["qualityScore"],
            "detections": detections,
            "visualEvents": [d["label"] for d in detections]
        }
    }
