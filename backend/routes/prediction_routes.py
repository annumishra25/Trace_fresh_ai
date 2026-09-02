from flask import Blueprint, request, jsonify
from services.prediction_service import run_prediction

prediction_bp = Blueprint("prediction", __name__)


@prediction_bp.route("/api/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No JSON received"
        }), 400

    image_path = data.get("image_path")

    if not image_path:
        return jsonify({
            "status": "error",
            "message": "image_path missing"
        }), 400

    result = run_prediction(image_path)

    return jsonify(result)