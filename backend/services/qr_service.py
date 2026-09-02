def build_passport_url(batch_id, frontend_base_url="http://localhost:5173"):
    return f"{frontend_base_url}/passport/{batch_id}"