import os
import hashlib
from PIL import Image, ImageOps

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit


def calculate_image_hash(file_bytes_or_path):
    """Calculate deterministic SHA-256 hash of image content."""
    if isinstance(file_bytes_or_path, bytes):
        return hashlib.sha256(file_bytes_or_path).hexdigest()
    elif isinstance(file_bytes_or_path, str) and os.path.exists(file_bytes_or_path):
        hasher = hashlib.sha256()
        with open(file_bytes_or_path, "rb") as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        return hasher.hexdigest()
    return None


def validate_image_file(file_path_or_bytes, original_filename=None):
    """
    Validate image file type, size, and integrity.
    Returns (is_valid, reason, file_size_bytes).
    """
    if original_filename:
        ext = os.path.splitext(original_filename.lower())[1]
        if ext not in ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}", 0

    if isinstance(file_path_or_bytes, bytes):
        size = len(file_path_or_bytes)
        if size > MAX_FILE_SIZE_BYTES:
            return False, f"File size ({size / 1024 / 1024:.1f} MB) exceeds maximum limit (10 MB)", size
        try:
            from io import BytesIO
            img = Image.open(BytesIO(file_path_or_bytes))
            img.verify()
            return True, "OK", size
        except Exception as e:
            return False, f"Corrupted or unreadable image file: {e}", size

    elif isinstance(file_path_or_bytes, str) and os.path.exists(file_path_or_bytes):
        size = os.path.getsize(file_path_or_bytes)
        if size > MAX_FILE_SIZE_BYTES:
            return False, f"File size ({size / 1024 / 1024:.1f} MB) exceeds maximum limit (10 MB)", size
        try:
            with Image.open(file_path_or_bytes) as img:
                img.verify()
            return True, "OK", size
        except Exception as e:
            return False, f"Corrupted or unreadable image file: {e}", size

    return False, "File does not exist or is invalid", 0


def preprocess_image_for_model(image_path_or_bytes, target_size=(224, 224)):
    """
    Load, correct EXIF orientation, convert to RGB, and resize to target_size.
    Returns (pil_image, numpy_array).
    """
    if isinstance(image_path_or_bytes, bytes):
        from io import BytesIO
        img = Image.open(BytesIO(image_path_or_bytes))
    else:
        img = Image.open(image_path_or_bytes)

    # Correct EXIF orientation if present
    img = ImageOps.exif_transpose(img)

    # Convert to RGB mode
    if img.mode != "RGB":
        img = img.convert("RGB")

    # Resize to target size for ML model input
    resized_img = img.resize(target_size, Image.Resampling.BILINEAR)

    return img, resized_img
