from flask import Flask, jsonify
from flask_cors import CORS
from routes.inspection_routes import inspection_bp
from routes.batch_routes import batch_bp
from routes.sensor_routes import sensor_bp
from routes.prediction_routes import prediction_bp
app = Flask(__name__)
CORS(app)

# Register API blueprints
app.register_blueprint(batch_bp)
app.register_blueprint(sensor_bp)
app.register_blueprint(prediction_bp)
app.register_blueprint(inspection_bp)

@app.route("/")
def home():
    return jsonify({
        "message": "TraceFresh AI Backend is Running",
        "services": [
            "/api/batches",
            "/api/sensors",
            "/api/sensors/latest",
            "/api/predict",
            "/api/inspect"
        ]
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)