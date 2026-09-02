import requests

PI_BACKEND_URL = "http://NEW_IP:5000/api/sensors"

def get_latest_sensor_packet():
    print("Calling Raspberry Pi...")

    response = requests.get(PI_BACKEND_URL, timeout=10)

    print("Status:", response.status_code)
    print("JSON:", response.json())

    return response.json()