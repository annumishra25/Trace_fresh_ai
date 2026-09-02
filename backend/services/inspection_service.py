import os
import tempfile
import requests

from services.prediction_service import run_prediction
from services.batch_service import update_batch_scan

PI_CAPTURE_API = "http://10.87.65.109:5000/api/capture"


def run_inspection():

    print("\n========== INSPECTION START ==========")

    # -------------------------------------------------
    # STEP 1 : Capture image from Raspberry Pi
    # -------------------------------------------------

    print("Capturing image from Raspberry Pi...")

    capture_response = requests.get(
        PI_CAPTURE_API,
        timeout=30
    )

    capture_response.raise_for_status()

    capture = capture_response.json()

    print("Capture Response:", capture)

    if capture.get("status") != "ok":
        return capture

    image_url = capture["image_url"]

    # -------------------------------------------------
    # STEP 2 : Download captured image
    # -------------------------------------------------

    print("Downloading:", image_url)

    image_response = requests.get(
        image_url,
        timeout=30
    )

    image_response.raise_for_status()

    image_bytes = image_response.content

    print("Downloaded", len(image_bytes), "bytes")

    # -------------------------------------------------
    # STEP 3 : Save temporary image
    # -------------------------------------------------

    temp_file = tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".jpg"
    )

    temp_file.write(image_bytes)
    temp_file.close()

    print("Temporary file:", temp_file.name)

    # -------------------------------------------------
    # STEP 4 : TensorFlow Prediction
    # -------------------------------------------------

    print("Running TensorFlow prediction...")

    prediction = run_prediction(temp_file.name)

    print("Prediction:", prediction)

    os.remove(temp_file.name)

    # -------------------------------------------------
    # STEP 5 : Update Batch Database
    # -------------------------------------------------

    assessment = {

        "visualClass": prediction["prediction"],

        "confidence": round(prediction["confidence"] / 100, 4),

        "freshnessScore": round(prediction["confidence"], 2),

        "shelfLifeDays": 8,

        "spoilageRisk": round(
            100 - prediction["confidence"],
            2
        ),

        "riskLevel":
            "GOOD"
            if "fresh" in prediction["prediction"]
            else "HIGH RISK",

        "status":
            "VERIFIED FRESH"
            if "fresh" in prediction["prediction"]
            else "WARNING",

        "qualityAdvisory":
            "Inspection completed using TraceFresh AI.",

        "suspiciousQualityFlag":
            "rotten" in prediction["prediction"],

        "reasons": [
            f"AI classified the fruit as {prediction['prediction']}."
        ]
    }

    sensors = {

        "temperature": capture.get("temperature"),

        "humidity": capture.get("humidity"),

        "mq135": capture.get("voc"),

        "storageCondition": capture.get(
            "air_quality_status",
            "Unknown"
        )

    }

    update_result, status = update_batch_scan(

        capture["batch_id"],

        {

            "latestAssessment": assessment,

            "latestSensors": sensors,

            "node": capture["node_id"]

        }

    )

    print("Batch Updated:", status)

    # -------------------------------------------------
    # DONE
    # -------------------------------------------------

    print("========== DONE ==========\n")

    return {

        "status": "ok",

        "capture": capture,

        "prediction": prediction["prediction"],

        "confidence": prediction["confidence"],

        "class_id": prediction["class_id"],

        "probabilities": prediction["probabilities"],

        "batch": update_result

    }