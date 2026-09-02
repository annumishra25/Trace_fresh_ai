from ml.inference import predict_image


def run_prediction(image_path):
    """
    Run AI inference on a captured image.
    """
    result = predict_image(image_path)

    return {
        "status": "ok",
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "class_id": result["class_id"],
        "probabilities": result["probabilities"],
    }