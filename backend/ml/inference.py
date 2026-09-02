import numpy as np
from tensorflow.keras.preprocessing import image

from .model_loader import model

# -----------------------------
# CLASS LABELS
# -----------------------------

CLASS_NAMES = [
    "freshapples",
    "freshbanana",
    "freshoranges",
    "rottenapples",
    "rottenbanana",
    "rottenoranges",
]


# -----------------------------
# PREDICT IMAGE
# -----------------------------

def predict_image(image_path):

    # Load image
    img = image.load_img(
        image_path,
        target_size=(224, 224)
    )

    img_array = image.img_to_array(img)

    img_array = img_array / 255.0

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    prediction = model.predict(
        img_array,
        verbose=0
    )

    predicted_index = int(np.argmax(prediction))

    predicted_class = CLASS_NAMES[predicted_index]

    confidence = float(np.max(prediction) * 100)

    return {

        "prediction": predicted_class,

        "confidence": round(confidence, 2),

        "class_id": predicted_index,

        "probabilities": {
            CLASS_NAMES[i]: round(float(prediction[0][i]) * 100, 2)
            for i in range(len(CLASS_NAMES))
        }

    }