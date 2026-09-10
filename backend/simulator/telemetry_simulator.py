import time
import json
import random
import argparse
import requests
from datetime import datetime, timezone
import threading

NODE_CONFIGS = {
    "TF-NODE-01": {
        "batchId": "TF-APL-2026-001",
        "shipmentId": "SHIP-APL-110",
        "firmwareVersion": "0.1.0",
        "gps_start": (13.0827, 80.2707),
        "gps_delta": (0.0005, 0.0008),
        "base_temp": 5.5,
        "base_hum": 71.0,
        "base_co2": 600.0,
        "base_voc": 1.5,
        "base_gas": 0.42,
        "battery": 85.0
    },
    "TF-NODE-02": {
        "batchId": "TF-BAN-2026-002",
        "shipmentId": "SHIP-BAN-102",
        "firmwareVersion": "0.1.0",
        "gps_start": (12.9716, 77.5946),
        "gps_delta": (-0.0004, -0.0006),
        "base_temp": 4.8,
        "base_hum": 88.0,
        "base_co2": 520.0,
        "base_voc": 1.1,
        "base_gas": 0.35,
        "battery": 92.0
    }
}

class TelemetrySimulator:
    def __init__(self, node_id, event="normal", url="http://127.0.0.1:5000/api/telemetry"):
        self.node_id = node_id
        self.config = NODE_CONFIGS.get(node_id, NODE_CONFIGS["TF-NODE-01"])
        self.event = event
        self.url = url

        self.temp = self.config["base_temp"]
        self.hum = self.config["base_hum"]
        self.co2 = self.config["base_co2"]
        self.voc = self.config["base_voc"]
        self.gas = self.config["base_gas"]
        self.battery = self.config["battery"]

        self.lat, self.lon = self.config["gps_start"]
        self.delta_lat, self.delta_lon = self.config["gps_delta"]
        self.step_count = 0

    def step(self):
        self.step_count += 1

        # Smooth drift / random walk for normal operation
        self.temp += random.uniform(-0.1, 0.1)
        self.hum += random.uniform(-0.3, 0.3)
        self.co2 += random.uniform(-4.0, 4.0)
        self.voc += random.uniform(-0.03, 0.03)
        self.gas += random.uniform(-0.01, 0.01)
        self.battery = max(1.0, self.battery - random.uniform(0.01, 0.05))

        speed = 35.0 + random.uniform(-5.0, 5.0)

        # Apply Event modifiers
        if self.event == "temperature_rise":
            self.temp += 0.4
        elif self.event == "humidity_rise":
            self.hum += 1.2
        elif self.event == "gas_rise":
            self.gas += 0.15
        elif self.event == "co2_rise":
            self.co2 += 35.0
        elif self.event == "gps_delay":
            speed = 0.0
        elif self.event == "battery_drop":
            self.battery = max(1.0, self.battery - 3.5)

        # Clamp sensible minimums
        self.hum = max(0.0, min(100.0, self.hum))
        self.co2 = max(300.0, self.co2)
        self.voc = max(0.0, self.voc)
        self.gas = max(0.0, self.gas)

        # GPS step
        if speed > 0:
            self.lat += self.delta_lat + random.uniform(-0.0001, 0.0001)
            self.lon += self.delta_lon + random.uniform(-0.0001, 0.0001)

        payload = {
            "nodeId": self.node_id,
            "batchId": self.config["batchId"],
            "shipmentId": self.config["shipmentId"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sensors": {
                "temperature": {
                    "value": round(self.temp, 1),
                    "unit": "C",
                    "status": "OK"
                },
                "humidity": {
                    "value": round(self.hum, 1),
                    "unit": "%",
                    "status": "OK"
                },
                "co2": {
                    "value": round(self.co2, 1),
                    "unit": "ppm",
                    "status": "OK"
                },
                "voc": {
                    "value": round(self.voc, 2),
                    "unit": "ppm",
                    "status": "OK"
                },
                "gas": {
                    "value": round(self.gas, 2),
                    "unit": "ppm",
                    "status": "OK"
                }
            },
            "gps": {
                "latitude": round(self.lat, 4),
                "longitude": round(self.lon, 4),
                "speedKmh": round(speed, 1),
                "accuracyM": 4.2,
                "status": "LOCKED"
            },
            "device": {
                "batteryPercent": int(self.battery),
                "signalStrengthDbm": -62 + random.randint(-4, 4),
                "firmwareVersion": self.config["firmwareVersion"]
            },
            "source": "simulator"
        }
        return payload

    def send_telemetry(self):
        payload = self.step()
        try:
            res = requests.post(self.url, json=payload, timeout=5)
            if res.status_code == 201:
                data = res.json()
                print(f"[{datetime.now().strftime('%H:%M:%S')}] [{self.node_id}] Sent Telemetry -> ID: {data.get('telemetryId')} | Temp: {payload['sensors']['temperature']['value']}°C | Hum: {payload['sensors']['humidity']['value']}% | Status: OK")
            else:
                print(f"[{self.node_id}] Server Error ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"[{self.node_id}] Failed to send telemetry: {e}")

def run_node_loop(node_id, interval, event, url, stop_event=None, count=None):
    sim = TelemetrySimulator(node_id=node_id, event=event, url=url)
    sent = 0
    while True:
        sim.send_telemetry()
        sent += 1
        if count and sent >= count:
            break
        if stop_event and stop_event.is_set():
            break
        time.sleep(interval)

def main():
    parser = argparse.ArgumentParser(description="TraceFresh Telemetry Simulator")
    parser.add_argument("--node", type=str, default="TF-NODE-01", help="Node ID (TF-NODE-01, TF-NODE-02)")
    parser.add_argument("--interval", type=float, default=2.0, help="Transmission interval in seconds")
    parser.add_argument("--event", type=str, default="normal", help="Simulation event scenario (normal, temperature_rise, humidity_rise, gas_rise, co2_rise, gps_delay, battery_drop)")
    parser.add_argument("--all", action="store_true", help="Simulate all registered nodes simultaneously")
    parser.add_argument("--url", type=str, default="http://127.0.0.1:5000/api/telemetry", help="Backend telemetry ingestion URL")
    parser.add_argument("--once", action="store_true", help="Send a single telemetry packet and exit")
    parser.add_argument("--count", type=int, default=None, help="Number of telemetry packets to send before exiting")

    args = parser.parse_args()

    if args.once:
        args.count = 1

    if args.all:
        print(f"[*] Starting Telemetry Simulator for ALL nodes ({', '.join(NODE_CONFIGS.keys())}) at {args.interval}s interval...")
        threads = []
        for n_id in NODE_CONFIGS.keys():
            t = threading.Thread(target=run_node_loop, args=(n_id, args.interval, args.event, args.url, None, args.count))
            t.daemon = True
            t.start()
            threads.append(t)
        
        for t in threads:
            t.join(timeout=1.0 if args.count else None)
        if not args.count:
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nStopped simulator.")
    else:
        print(f"[*] Starting Telemetry Simulator for {args.node} at {args.interval}s interval (Event: {args.event})...")
        try:
            run_node_loop(args.node, args.interval, args.event, args.url, count=args.count)
        except KeyboardInterrupt:
            print("\nStopped simulator.")

if __name__ == "__main__":
    main()
