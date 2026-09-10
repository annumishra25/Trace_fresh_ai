import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.db import init_db, get_db_session
from database.models import (
    BatchModel,
    DeviceNodeModel,
    TelemetryReadingModel,
    RouteRecordModel,
    InspectionRecordModel,
    FusionDecisionModel,
    QRIdentityModel,
    DigitalPassportModel
)

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))


def load_json_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()
            return json.loads(content) if content else []
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []


def run_migration():
    print("Initializing Database tables...")
    init_db()
    session = get_db_session()

    try:
        # 1. Migrate Batches
        batches = load_json_file("batches.json")
        print(f"Migrating {len(batches)} batches...")
        for b in batches:
            batch_id = b.get("batchId")
            if not batch_id: continue
            existing = session.query(BatchModel).filter_by(batch_id=batch_id).first()
            if not existing:
                record = BatchModel(
                    batch_id=batch_id,
                    shipment_id=b.get("traceability", {}).get("shipmentId", "SHIP-APL-110"),
                    display_name=b.get("displayName", f"Batch {batch_id}"),
                    fruit_type=b.get("fruitType", "APPLES"),
                    quantity_kg=b.get("quantityKg", 1000.0),
                    source=b.get("source", "Yakima Valley, WA"),
                    location=b.get("location", "Seattle Hub")
                )
                session.add(record)

        # 2. Migrate Device Nodes
        nodes = load_json_file("nodes.json")
        print(f"Migrating {len(nodes)} device nodes...")
        for n in nodes:
            node_id = n.get("nodeId")
            if not node_id: continue
            existing = session.query(DeviceNodeModel).filter_by(node_id=node_id).first()
            if not existing:
                record = DeviceNodeModel(
                    node_id=node_id,
                    display_name=n.get("displayName", f"Node {node_id}"),
                    status=n.get("status", "ONLINE"),
                    battery_level=n.get("health", {}).get("batteryLevel", 95.0),
                    firmware_version=n.get("firmwareVersion", "v1.2.0")
                )
                session.add(record)

        # 3. Migrate Telemetry Readings
        telemetry = load_json_file("telemetry.json")
        print(f"Migrating {len(telemetry)} telemetry readings...")
        for t in telemetry:
            tel_id = t.get("telemetryId")
            if not tel_id: continue
            existing = session.query(TelemetryReadingModel).filter_by(telemetry_id=tel_id).first()
            if not existing:
                record = TelemetryReadingModel(
                    telemetry_id=tel_id,
                    node_id=t.get("nodeId", "TF-NODE-01"),
                    batch_id=t.get("batchId", "TF-APL-2026-001"),
                    ambient_temp=float(t.get("ambient_temp", 4.0)),
                    relative_humidity=float(t.get("relative_humidity", 88.0)),
                    gas_ppm=float(t.get("gas_ppm", 0.0)),
                    co2_ppm=float(t.get("co2_ppm", 400.0)),
                    battery_v=float(t.get("battery_v", 4.1)),
                    raw_payload_json=json.dumps(t)
                )
                session.add(record)

        # 4. Migrate QR Identities
        qrs = load_json_file("qr_identities.json")
        print(f"Migrating {len(qrs)} QR identities...")
        for q in qrs:
            qr_id = q.get("qrId")
            if not qr_id: continue
            existing = session.query(QRIdentityModel).filter_by(qr_id=qr_id).first()
            if not existing:
                record = QRIdentityModel(
                    qr_id=qr_id,
                    batch_id=q.get("batchId", "TF-APL-2026-001"),
                    public_token=q.get("publicToken", "TR-VER-DEMO"),
                    status=q.get("status", "ACTIVE"),
                    scan_count=q.get("scanCount", 0),
                    deactivation_reason=q.get("deactivationReason")
                )
                session.add(record)

        session.commit()
        print("Data migration completed successfully!")

    except Exception as e:
        session.rollback()
        print(f"Data migration error: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    run_migration()
