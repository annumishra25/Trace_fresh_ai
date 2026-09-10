from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from database.db import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="OPERATOR")  # ADMIN, OPERATOR, VIEWER
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class ShipmentModel(Base):
    __tablename__ = "shipments"

    shipment_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    origin = Column(String(128), nullable=True)
    destination = Column(String(128), nullable=True)
    status = Column(String(32), default="IN_TRANSIT")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "shipmentId": self.shipment_id,
            "name": self.name,
            "origin": self.origin,
            "destination": self.destination,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class BatchModel(Base):
    __tablename__ = "batches"

    batch_id = Column(String(64), primary_key=True)
    shipment_id = Column(String(64), ForeignKey("shipments.shipment_id"), nullable=True)
    display_name = Column(String(128), nullable=False)
    fruit_type = Column(String(64), nullable=False)
    quantity_kg = Column(Float, default=1000.0)
    source = Column(String(128), nullable=True)
    location = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "batchId": self.batch_id,
            "shipmentId": self.shipment_id,
            "displayName": self.display_name,
            "fruitType": self.fruit_type,
            "quantityKg": self.quantity_kg,
            "source": self.source,
            "location": self.location,
            "createdAt": self.created_at.isoformat() if self.created_at else None
        }


class DeviceNodeModel(Base):
    __tablename__ = "device_nodes"

    node_id = Column(String(64), primary_key=True)
    display_name = Column(String(128), nullable=False)
    status = Column(String(32), default="ONLINE")
    battery_level = Column(Float, default=95.0)
    firmware_version = Column(String(32), default="v1.2.0")
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "nodeId": self.node_id,
            "displayName": self.display_name,
            "status": self.status,
            "batteryLevel": self.battery_level,
            "firmwareVersion": self.firmware_version,
            "lastSeen": self.last_seen.isoformat() if self.last_seen else None
        }


class TelemetryReadingModel(Base):
    __tablename__ = "telemetry_readings"

    telemetry_id = Column(String(64), primary_key=True)
    node_id = Column(String(64), ForeignKey("device_nodes.node_id"), nullable=False, index=True)
    batch_id = Column(String(64), nullable=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    ambient_temp = Column(Float, nullable=False)
    relative_humidity = Column(Float, nullable=False)
    gas_ppm = Column(Float, default=0.0)
    co2_ppm = Column(Float, default=400.0)
    battery_v = Column(Float, default=4.1)
    raw_payload_json = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "telemetryId": self.telemetry_id,
            "nodeId": self.node_id,
            "batchId": self.batch_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "ambientTemp": self.ambient_temp,
            "relativeHumidity": self.relative_humidity,
            "gasPpm": self.gas_ppm,
            "co2Ppm": self.co2_ppm,
            "batteryV": self.battery_v
        }


class RouteRecordModel(Base):
    __tablename__ = "routes"

    route_id = Column(String(64), primary_key=True)
    shipment_id = Column(String(64), nullable=True)
    batch_id = Column(String(64), nullable=True)
    planned_distance_km = Column(Float, default=185.0)
    actual_distance_km = Column(Float, default=185.0)
    route_condition = Column(String(32), default="ON_ROUTE")
    delay_minutes = Column(Integer, default=0)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    waypoints_json = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "routeId": self.route_id,
            "shipmentId": self.shipment_id,
            "batchId": self.batch_id,
            "plannedDistanceKm": self.planned_distance_km,
            "actualDistanceKm": self.actual_distance_km,
            "routeCondition": self.route_condition,
            "delayMinutes": self.delay_minutes,
            "currentLocation": {"lat": self.current_lat, "lng": self.current_lng} if self.current_lat else None
        }


class InspectionRecordModel(Base):
    __tablename__ = "inspections"

    inspection_id = Column(String(64), primary_key=True)
    batch_id = Column(String(64), nullable=False, index=True)
    node_id = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    visual_risk_score = Column(Float, default=10.0)
    visual_status = Column(String(32), default="VERIFIED_FRESH")
    image_quality_score = Column(Float, default=90.0)
    image_hash = Column(String(64), nullable=True)
    detections_json = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "inspectionId": self.inspection_id,
            "batchId": self.batch_id,
            "nodeId": self.node_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "visualRiskScore": self.visual_risk_score,
            "visualStatus": self.visual_status,
            "imageQualityScore": self.image_quality_score
        }


class FusionDecisionModel(Base):
    __tablename__ = "fusion_decisions"

    decision_id = Column(String(64), primary_key=True)
    batch_id = Column(String(64), nullable=False, index=True)
    node_id = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fusion_status = Column(String(32), default="NORMAL")
    overall_risk_score = Column(Float, default=10.0)
    freshness_index = Column(Integer, default=90)
    confidence = Column(Float, default=0.90)
    component_risks_json = Column(Text, nullable=True)
    explanation_json = Column(Text, nullable=True)

    def to_dict(self):
        return {
            "decisionId": self.decision_id,
            "batchId": self.batch_id,
            "nodeId": self.node_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "fusionStatus": self.fusion_status,
            "overallRiskScore": self.overall_risk_score,
            "freshnessIndex": self.freshness_index,
            "confidence": self.confidence
        }


class QRIdentityModel(Base):
    __tablename__ = "qr_identities"

    qr_id = Column(String(64), primary_key=True)
    batch_id = Column(String(64), nullable=False, index=True)
    public_token = Column(String(64), unique=True, nullable=False, index=True)
    status = Column(String(32), default="ACTIVE")  # ACTIVE, INACTIVE, REVOKED, EXPIRED, REPLACED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_scanned_at = Column(DateTime, nullable=True)
    scan_count = Column(Integer, default=0)
    deactivation_reason = Column(String(255), nullable=True)

    def to_dict(self):
        return {
            "qrId": self.qr_id,
            "batchId": self.batch_id,
            "publicToken": self.public_token,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "lastScannedAt": self.last_scanned_at.isoformat() if self.last_scanned_at else None,
            "scanCount": self.scan_count,
            "deactivationReason": self.deactivation_reason
        }


class DigitalPassportModel(Base):
    __tablename__ = "digital_passports"

    passport_id = Column(String(64), primary_key=True)
    batch_id = Column(String(64), nullable=False, index=True)
    public_token = Column(String(64), nullable=False, index=True)
    passport_version = Column(String(16), default="1.0")
    passport_hash = Column(String(128), nullable=False)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    payload_json = Column(Text, nullable=False)

    def to_dict(self):
        return {
            "passportId": self.passport_id,
            "batchId": self.batch_id,
            "publicToken": self.public_token,
            "passportVersion": self.passport_version,
            "passportHash": self.passport_hash,
            "issuedAt": self.issued_at.isoformat() if self.issued_at else None,
            "lastUpdated": self.last_updated.isoformat() if self.last_updated else None
        }
