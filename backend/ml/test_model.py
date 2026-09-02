from .inference import predict_image

image_path = "ml/sample_images/test.jpg"

result = predict_image(image_path)

print(result)