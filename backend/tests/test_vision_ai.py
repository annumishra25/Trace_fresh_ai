import os
import sys
import unittest
from PIL import Image
from io import BytesIO

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.vision_preprocess import calculate_image_hash, validate_image_file, preprocess_image_for_model
from ml.image_quality import evaluate_image_quality
from services.vision_severity_engine import calculate_visual_severity
from ml.vision_model import KerasFruitModelProvider, SurfaceAnomalyDetector, DemoVisionModelProvider
from ml.vision_inference import run_vision_inference
from services.inspection_service import (
    run_inspection,
    get_inspection_by_id,
    get_inspections_by_batch,
    get_inspections_by_node
)

TEST_INSPECTIONS_FILE = os.path.join(os.path.dirname(__file__), "test_inspections_tmp.json")


def create_dummy_image_bytes(width=300, height=300, color="red"):
    img = Image.new("RGB", (width, height), color=color)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


class TestVisionAI(unittest.TestCase):
    def setUp(self):
        if os.path.exists(TEST_INSPECTIONS_FILE):
            os.remove(TEST_INSPECTIONS_FILE)

    def tearDown(self):
        if os.path.exists(TEST_INSPECTIONS_FILE):
            os.remove(TEST_INSPECTIONS_FILE)

    def test_calculate_image_hash(self):
        dummy_bytes = create_dummy_image_bytes()
        h1 = calculate_image_hash(dummy_bytes)
        h2 = calculate_image_hash(dummy_bytes)
        self.assertIsNotNone(h1)
        self.assertEqual(h1, h2)

    def test_validate_image_file(self):
        dummy_bytes = create_dummy_image_bytes()
        valid, msg, size = validate_image_file(dummy_bytes, "sample.jpg")
        self.assertTrue(valid)
        self.assertEqual(msg, "OK")

        # Unsupported extension
        valid, msg, size = validate_image_file(dummy_bytes, "sample.exe")
        self.assertFalse(valid)
        self.assertIn("Unsupported file extension", msg)

    def test_evaluate_image_quality(self):
        img = Image.new("RGB", (400, 400), color="orange")
        q = evaluate_image_quality(img)
        self.assertIn("qualityScore", q)
        self.assertGreaterEqual(q["qualityScore"], 50)
        self.assertIn(q["status"], ["GOOD", "FAIR"])

    def test_calculate_visual_severity(self):
        detections = [{
            "label": "MOLD_LIKE",
            "confidence": 0.92,
            "areaPercent": 5.0
        }]
        sev = calculate_visual_severity(detections, total_area_percent=5.0)
        self.assertEqual(sev["severity"], "CRITICAL")
        self.assertEqual(sev["overallVisualStatus"], "WARNING")
        self.assertGreater(sev["visualRiskScore"], 40)

    def test_vision_model_providers(self):
        keras_prov = KerasFruitModelProvider()
        meta = keras_prov.get_metadata()
        self.assertEqual(meta["modelName"], "fruit_model_v4")

        demo_prov = DemoVisionModelProvider()
        demo_res = demo_prov.predict_scenario("MOLD")
        self.assertEqual(demo_res["classification"]["label"], "rottenapples")
        self.assertEqual(len(demo_res["detections"]), 1)

    def test_run_vision_inference(self):
        dummy_bytes = create_dummy_image_bytes()
        res = run_vision_inference(dummy_bytes)
        self.assertIn("classification", res)
        self.assertIn("imageQuality", res)
        self.assertIn("fusionInterface", res)
        self.assertIn("visualRisk", res["fusionInterface"])

    def test_inspection_service_demo(self):
        rec = run_inspection(batch_id="TF-APL-2026-001", node_id="TF-NODE-01", source="DEMO", demo_scenario="HEALTHY")
        self.assertIsNotNone(rec)
        self.assertIn("inspectionId", rec)
        self.assertEqual(rec["batchId"], "TF-APL-2026-001")
        self.assertEqual(rec["nodeId"], "TF-NODE-01")

        by_batch = get_inspections_by_batch("TF-APL-2026-001")
        self.assertGreaterEqual(len(by_batch), 1)


if __name__ == "__main__":
    unittest.main()
