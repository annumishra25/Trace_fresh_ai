import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getNodes,
  getLatestTelemetry,
  getNodeTelemetry as fetchNodeTelemetry,
  getBatchTelemetry as fetchBatchTelemetry,
  sendTelemetry
} from "../services/telemetryApi";

const TelemetryContext = createContext();

const DEFAULT_TELEMETRY = {
  "TF-NODE-01": {
    telemetryId: "TEL-INIT-NODE1",
    nodeId: "TF-NODE-01",
    batchId: "TF-APL-2026-001",
    shipmentId: "SHIP-APL-110",
    timestamp: new Date().toISOString(),
    sensors: {
      temperature: { value: 5.5, unit: "°C", status: "OK" },
      humidity: { value: 71.0, unit: "%", status: "OK" },
      co2: { value: 600.0, unit: "ppm", status: "OK" },
      voc: { value: 1.5, unit: "ppm", status: "OK" },
      gas: { value: 0.42, unit: "ppm", status: "OK" }
    },
    gps: { latitude: 13.0827, longitude: 80.2707, speedKmh: 35.0, status: "LOCKED" },
    device: { batteryPercent: 85, signalStrengthDbm: -62, firmwareVersion: "0.1.0" },
    source: "simulator"
  },
  "TF-NODE-02": {
    telemetryId: "TEL-INIT-NODE2",
    nodeId: "TF-NODE-02",
    batchId: "TF-BAN-2026-002",
    shipmentId: "SHIP-BAN-102",
    timestamp: new Date().toISOString(),
    sensors: {
      temperature: { value: 4.8, unit: "°C", status: "OK" },
      humidity: { value: 88.0, unit: "%", status: "OK" },
      co2: { value: 520.0, unit: "ppm", status: "OK" },
      voc: { value: 1.1, unit: "ppm", status: "OK" },
      gas: { value: 0.35, unit: "ppm", status: "OK" }
    },
    gps: { latitude: 12.9716, longitude: 77.5946, speedKmh: 42.0, status: "LOCKED" },
    device: { batteryPercent: 92, signalStrengthDbm: -58, firmwareVersion: "0.1.0" },
    source: "simulator"
  }
};

export const TelemetryProvider = ({ children }) => {
  const [nodes, setNodes] = useState([
    {
      nodeId: "TF-NODE-01",
      name: "TraceFresh Smart Node 01",
      status: "ONLINE",
      assignedBatchId: "TF-APL-2026-001",
      assignedShipmentId: "SHIP-APL-110",
      batteryPercent: 85,
      signalStrengthDbm: -62,
      gpsStatus: "LOCKED",
      firmwareVersion: "0.1.0",
      source: "simulator"
    },
    {
      nodeId: "TF-NODE-02",
      name: "TraceFresh Smart Node 02",
      status: "ONLINE",
      assignedBatchId: "TF-BAN-2026-002",
      assignedShipmentId: "SHIP-BAN-102",
      batteryPercent: 92,
      signalStrengthDbm: -58,
      gpsStatus: "LOCKED",
      firmwareVersion: "0.1.0",
      source: "simulator"
    }
  ]);

  const [selectedNodeId, setSelectedNodeId] = useState("TF-NODE-01");
  const [latestTelemetryMap, setLatestTelemetryMap] = useState(DEFAULT_TELEMETRY);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("ONLINE");
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  const [pollingIntervalMs, setPollingIntervalMs] = useState(5000);

  const fetchTelemetryData = useCallback(async () => {
    try {
      const [nodesRes, latestRes] = await Promise.all([
        getNodes(),
        getLatestTelemetry()
      ]);

      if (nodesRes && nodesRes.data && nodesRes.data.length > 0) {
        setNodes((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(nodesRes.data)) return prev;
          return nodesRes.data;
        });
      }

      if (latestRes && latestRes.data && Object.keys(latestRes.data).length > 0) {
        let updated = false;
        setLatestTelemetryMap((prev) => {
          const merged = { ...prev, ...latestRes.data };
          if (JSON.stringify(prev) === JSON.stringify(merged)) return prev;
          updated = true;
          return merged;
        });
        if (updated) {
          setLastUpdated(new Date().toISOString());
        }
      }
      setConnectionStatus("ONLINE");
    } catch (err) {
      // Silently maintain existing telemetry map on connection note without forcing state update
    }
  }, []);

  useEffect(() => {
    if (!isLiveMode) return;

    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [isLiveMode, pollingIntervalMs, fetchTelemetryData]);

  const toggleMode = useCallback(() => {
    setIsLiveMode((prev) => !prev);
  }, []);

  const sendCustomTelemetry = useCallback(async (nodeId, sensorValues, source = "hardware") => {
    const payload = {
      nodeId: nodeId || selectedNodeId,
      batchId: nodeId === "TF-NODE-02" ? "TF-BAN-2026-002" : "TF-APL-2026-001",
      shipmentId: nodeId === "TF-NODE-02" ? "SHIP-BAN-102" : "SHIP-APL-110",
      timestamp: new Date().toISOString(),
      sensors: {
        temperature: {
          value: Number(sensorValues.temperature),
          unit: "°C",
          status: "OK"
        },
        humidity: {
          value: Number(sensorValues.humidity),
          unit: "%",
          status: "OK"
        },
        co2: {
          value: Number(sensorValues.co2),
          unit: "ppm",
          status: "OK"
        },
        voc: {
          value: Number(sensorValues.voc),
          unit: "ppm",
          status: "OK"
        },
        gas: {
          value: Number(sensorValues.gas),
          unit: "ppm",
          status: "OK"
        }
      },
      gps: {
        latitude: nodeId === "TF-NODE-02" ? 12.9716 : 13.0827,
        longitude: nodeId === "TF-NODE-02" ? 77.5946 : 80.2707,
        speedKmh: 38.0,
        status: "LOCKED"
      },
      device: {
        batteryPercent: Number(sensorValues.battery ?? 90),
        signalStrengthDbm: -60,
        firmwareVersion: "1.0.0-HW"
      },
      source
    };

    setLatestTelemetryMap((prev) => ({
      ...prev,
      [nodeId]: payload
    }));

    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.nodeId === nodeId
          ? {
              ...n,
              status: "ONLINE",
              source,
              lastSeen: payload.timestamp,
              batteryPercent: payload.device.batteryPercent,
              latestTelemetry: payload
            }
          : n
      )
    );

    setLastUpdated(new Date().toISOString());

    try {
      await sendTelemetry(payload);
    } catch (err) {
      console.warn("Telemetry ingest note:", err.message);
    }

    return payload;
  }, [selectedNodeId]);

  const activeNode = useMemo(() => {
    return nodes.find((n) => n.nodeId === selectedNodeId) || nodes[0] || {};
  }, [nodes, selectedNodeId]);

  const activeTelemetry = useMemo(() => {
    return latestTelemetryMap[selectedNodeId] || activeNode.latestTelemetry || DEFAULT_TELEMETRY[selectedNodeId] || null;
  }, [latestTelemetryMap, selectedNodeId, activeNode]);

  const getNodeTelemetryHistory = useCallback(async (nodeId, limit = 100) => {
    try {
      const res = await fetchNodeTelemetry(nodeId, { limit });
      if (res.data && res.data.length > 0) return res.data;
    } catch (err) {
      // Fallback
    }
    return activeTelemetry ? [activeTelemetry] : [];
  }, [activeTelemetry]);

  const getBatchTelemetryHistory = useCallback(async (batchId, limit = 100) => {
    try {
      const res = await fetchBatchTelemetry(batchId, { limit });
      if (res.data && res.data.length > 0) return res.data;
    } catch (err) {
      // Fallback
    }
    return activeTelemetry ? [activeTelemetry] : [];
  }, [activeTelemetry]);

  const contextValue = useMemo(() => ({
    nodes,
    selectedNodeId,
    setSelectedNodeId,
    activeNode,
    activeTelemetry,
    latestTelemetryMap,
    connectionStatus,
    lastUpdated,
    isLiveMode,
    toggleMode,
    pollingIntervalMs,
    setPollingIntervalMs,
    refreshTelemetry: fetchTelemetryData,
    sendCustomTelemetry,
    getNodeTelemetryHistory,
    getBatchTelemetryHistory
  }), [
    nodes,
    selectedNodeId,
    activeNode,
    activeTelemetry,
    latestTelemetryMap,
    connectionStatus,
    lastUpdated,
    isLiveMode,
    toggleMode,
    pollingIntervalMs,
    fetchTelemetryData,
    sendCustomTelemetry,
    getNodeTelemetryHistory,
    getBatchTelemetryHistory
  ]);

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);

