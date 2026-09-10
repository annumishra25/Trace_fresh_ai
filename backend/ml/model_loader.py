import os

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "fruit_model_v4.keras"
)

try:
    import tensorflow as tf
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
    else:
        model = None
except Exception as e:
    print(f"TensorFlow or model loading optional notice: {e}")
    model = None