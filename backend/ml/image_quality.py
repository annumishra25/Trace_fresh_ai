from PIL import ImageStat, ImageOps


def evaluate_image_quality(pil_image):
    """
    Evaluates image brightness, contrast, resolution, and blur metrics.
    
    Returns:
    {
      "qualityScore": 92,  # 0 to 100
      "status": "GOOD|FAIR|POOR",
      "issues": [],
      "recommendation": "ACCEPTABLE|RETAKE_IMAGE_RECOMMENDED"
    }
    """
    if not pil_image:
        return {
            "qualityScore": 0,
            "status": "POOR",
            "issues": ["Invalid or missing image"],
            "recommendation": "RETAKE_IMAGE_RECOMMENDED"
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
    w, h = grayscale.size
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
