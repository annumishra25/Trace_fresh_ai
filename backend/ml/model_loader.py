import tensorflow as tf
import os

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "fruit_model_v4.keras"
)

model = tf.keras.models.load_model(MODEL_PATH)