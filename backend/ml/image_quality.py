from PIL import ImageStat, ImageOps


def validate_produce_color_spectrum(pil_image):
    """
    Analyzes color spectrum and saturation to detect if the image contains organic produce features
    (e.g., greens, reds, yellows, oranges, purples, earth tones) vs synthetic/non-food objects.
    """
    if not pil_image:
        return False, "Missing image file"

    rgb_img = pil_image.convert("RGB")
    width, height = rgb_img.size
    
    # Sample pixels across a 30x30 grid
    step_x = max(1, width // 30)
    step_y = max(1, height // 30)
    
    organic_color_pixels = 0
    total_samples = 0
    non_organic_blue_pixels = 0

    for x in range(0, width, step_x):
        for y in range(0, height, step_y):
            r, g, b = rgb_img.getpixel((x, y))
            total_samples += 1

            # Produce color signature checks:
            # Red/Apple/Strawberry: High red relative to blue & green
            is_red = (r > 90 and r > g * 1.15 and r > b * 1.3)
            # Green/Green Apple/Grape/Leaf: High green relative to blue
            is_green = (g > 70 and g > b * 1.1)
            # Yellow/Banana/Lemon: High red & green relative to blue
            is_yellow = (r > 100 and g > 90 and b < min(r, g) * 0.75)
            # Orange/Citrus/Carrot: High red, medium green, low blue
            is_orange = (r > 120 and g > 60 and g < r and b < g * 0.7)
            # Purple/Plum/Grape/Eggplant: High red & blue, lower green
            is_purple = (r > 60 and b > 60 and g < min(r, b) * 0.8)
            # Organic Earth/Brown: Moderate red, lower green, very low blue
            is_brown = (r > 50 and g > 35 and r >= g and b < g * 0.8)

            if is_red or is_green or is_yellow or is_orange or is_purple or is_brown:
                organic_color_pixels += 1

            # Synthetic artificial blue (e.g. blue UI screens, synthetic wallpapers)
            if b > 140 and b > r * 1.4 and b > g * 1.3:
                non_organic_blue_pixels += 1

    organic_ratio = (organic_color_pixels / max(1, total_samples)) * 100.0
    blue_ratio = (non_organic_blue_pixels / max(1, total_samples)) * 100.0

    # Low organic color ratio (< 15%) or overwhelming synthetic blue/grey (> 60%)
    if organic_ratio < 15.0 or blue_ratio > 60.0:
        return False, f"Image lacks organic produce color profile (Organic spectrum: {organic_ratio:.1f}%)"

    return True, "Valid produce color profile"


def evaluate_image_quality(pil_image):
    """
    Evaluates image brightness, contrast, resolution, blur metrics, and produce validity.
    
    Returns:
    {
      "isProduce": True|False,
      "qualityScore": 92,  # 0 to 100
      "status": "GOOD|FAIR|POOR|INVALID_PRODUCE",
      "issues": [],
      "recommendation": "ACCEPTABLE|PLEASE_SELECT_FRUIT_OR_VEGETABLE_IMAGE"
    }
    """
    if not pil_image:
        return {
            "isProduce": False,
            "qualityScore": 0,
            "status": "POOR",
            "issues": ["Invalid or missing image"],
            "recommendation": "PLEASE_SELECT_FRUIT_OR_VEGETABLE_IMAGE"
        }

    # 0. Organic Produce Validation Check
    is_produce, produce_msg = validate_produce_color_spectrum(pil_image)
    if not is_produce:
        return {
            "isProduce": False,
            "qualityScore": 0,
            "status": "INVALID_PRODUCE",
            "issues": [produce_msg, "Uploaded image does not appear to be a fruit or vegetable."],
            "recommendation": "PLEASE_SELECT_FRUIT_OR_VEGETABLE_IMAGE"
        }

    score = 100
    issues = []

    # 1. Resolution Check
    width, height = pil_image.size
    if width < 200 or height < 200:
        score -= 30
        issues.append(f"Low resolution ({width}x{height}px < 200x200px minimum)")

    # 2. Brightness & Overexposure / Underexposure Check
    grayscale = ImageOps.grayscale(pil_image)
    stat = ImageStat.Stat(grayscale)
    mean_brightness = stat.mean[0]
    std_contrast = stat.stddev[0]

    if mean_brightness < 40:
        score -= 25
        issues.append(f"Underexposed / Dark image (Luminance {mean_brightness:.1f} < 40)")
    elif mean_brightness > 220:
        score -= 25
        issues.append(f"Overexposed / Glare detected (Luminance {mean_brightness:.1f} > 220)")

    # 3. Contrast Check
    if std_contrast < 20:
        score -= 20
        issues.append(f"Low image contrast (StdDev {std_contrast:.1f} < 20)")

    # 4. Blur / Sharpness Estimation (Grayscale gradient variance)
    pixels = list(grayscale.getdata())
    # Sample gradient variance across adjacent pixels
    if len(pixels) > 1000:
        step = max(1, len(pixels) // 1000)
        grads = [abs(pixels[i] - pixels[i - 1]) for i in range(1, len(pixels), step)]
        avg_grad = sum(grads) / max(1, len(grads))
        if avg_grad < 3.5:
            score -= 25
            issues.append(f"Blur / Out-of-focus image detected (Gradient sharpness {avg_grad:.1f} < 3.5)")

    score = max(0, min(100, score))

    if score >= 80:
        status = "GOOD"
        recommendation = "ACCEPTABLE"
    elif score >= 50:
        status = "FAIR"
        recommendation = "ACCEPTABLE"
    else:
        status = "POOR"
        recommendation = "RETAKE_IMAGE_RECOMMENDED"

    return {
        "isProduce": True,
        "qualityScore": score,
        "status": status,
        "issues": issues,
        "recommendation": recommendation,
        "metrics": {
            "resolution": f"{width}x{height}",
            "brightness": round(mean_brightness, 1),
            "contrast": round(std_contrast, 1)
        }
    }

