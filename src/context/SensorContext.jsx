import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { calculateHealthMetrics } from "../utils/foodHealthEngine";
import { detectAnomalies } from "../utils/anomalyEngine";
import { BACKEND_BASE_URL } from "../config/appConfig";

const SensorContext = createContext();

const API_ROOT = BACKEND_BASE_URL.replace(/\/api$/, "");

export const SensorProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    temperature: 5.5,
    humidity: 71.0,
    voc: 1.5,
    co2: 600.0,
    ethylene: 0.25,
    weight: 245,

    healthScore: 94,
    shelfLife: 9.4,
    spoilageRisk: 6,
    riskLevel: "GOOD",
    confidence: 96.4,
    status: "SAFE",
    alerts: [],

    history: [],

    batchId: "TF-APL-2026-001",
    fruitType: "Apple",
    nodeId: "TF-NODE-01",

    sensorStatus: {
      dht11: "unknown",
      mq135: "unknown",
    },

    airQualityStatus: "Unknown",
    gasDetected: false,
    cameraStatus: "unknown",
    systemStatus: "offline",

    dataSource: {},
    notes: {},

    lastUpdated: null,
    lastCapture: null,

    backendLive: false,

    inspection: null,
    inspecting: false,
  });

  const inspectBatch = useCallback(async () => {
    try {
      setSensorData((prev) => ({
        ...prev,
        inspecting: true,
      }));

      const response = await fetch(`${API_ROOT}/api/inspect`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.status === "ok") {
        setSensorData((prev) => ({
          ...prev,

          inspection: result,

          confidence: result.confidence,

          status: result.prediction.toLowerCase().includes("rotten")
            ? "UNSAFE"
            : "SAFE",

          inspecting: false,
        }));
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.warn("Sensor inspection endpoint note:", err.message);

      setSensorData((prev) => ({
        ...prev,
        inspecting: false,
      }));
    }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const sensorRes = await fetch(`${API_ROOT}/api/sensors`);
        if (!sensorRes.ok) return;

        const sensorPayload = await sensorRes.json();

        setSensorData((prev) => {
          const formattedTemp = Number(sensorPayload.temperature ?? prev.temperature).toFixed(1);
          const humidity = sensorPayload.humidity ?? prev.humidity;
          const voc = sensorPayload.voc ?? prev.voc;
          const co2 = sensorPayload.co2 ?? prev.co2;
          const formattedEth = Number(sensorPayload.ethylene ?? prev.ethylene).toFixed(2);
          const formattedWeight = Number(sensorPayload.weight ?? prev.weight).toFixed(1);

          if (
            String(prev.temperature) === String(formattedTemp) &&
            String(prev.humidity) === String(humidity) &&
            String(prev.voc) === String(voc) &&
            String(prev.co2) === String(co2) &&
            String(prev.ethylene) === String(formattedEth) &&
            String(prev.weight) === String(formattedWeight) &&
            prev.backendLive === true
          ) {
            return prev;
          }

          const metrics = calculateHealthMetrics({
            temperature: formattedTemp,
            humidity,
            voc,
            co2,
            ethylene: formattedEth,
            weight: formattedWeight,
          });

          const alerts = detectAnomalies({
            temperature: formattedTemp,
            humidity,
            voc,
            co2,
            ethylene: formattedEth,
            weight: formattedWeight,
          });

          return {
            ...prev,

            temperature: formattedTemp,
            humidity,
            voc,
            co2,
            ethylene: formattedEth,
            weight: formattedWeight,

            healthScore: metrics.healthScore,
            shelfLife: metrics.shelfLife,
            spoilageRisk: metrics.spoilageRisk,
            riskLevel: metrics.riskLevel,

            alerts,

            batchId: sensorPayload.batch_id || prev.batchId,
            fruitType: sensorPayload.fruit_type || prev.fruitType,
            nodeId: sensorPayload.node_id || prev.nodeId,

            sensorStatus: sensorPayload.sensor_status || prev.sensorStatus,

            airQualityStatus:
              sensorPayload.air_quality_status || prev.airQualityStatus,

            gasDetected: sensorPayload.gas_detected ?? prev.gasDetected,

            cameraStatus:
              sensorPayload.camera_status || prev.cameraStatus,

            systemStatus: "ONLINE",

            lastUpdated:
              sensorPayload.timestamp || prev.lastUpdated || new Date().toISOString(),

            backendLive: true,
          };
        });
      } catch (err) {
        // Silently preserve current sensor data on error to prevent flickering
      }
    };

    fetchAllData();

    const interval = setInterval(fetchAllData, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateSensorValues = useCallback((newValues) => {
    setSensorData((prev) => {
      const formattedTemp = Number(newValues.temperature ?? prev.temperature).toFixed(1);
      const humidity = Number(newValues.humidity ?? prev.humidity);
      const voc = Number(newValues.voc ?? prev.voc);
      const co2 = Number(newValues.co2 ?? prev.co2);
      const formattedEth = Number(newValues.gas ?? newValues.ethylene ?? prev.ethylene).toFixed(2);
      const formattedWeight = Number(newValues.weight ?? prev.weight).toFixed(1);

      const metrics = calculateHealthMetrics({
        temperature: formattedTemp,
        humidity,
        voc,
        co2,
        ethylene: formattedEth,
        weight: formattedWeight,
      });

      const alerts = detectAnomalies({
        temperature: formattedTemp,
        humidity,
        voc,
        co2,
        ethylene: formattedEth,
        weight: formattedWeight,
      });

      return {
        ...prev,
        temperature: formattedTemp,
        humidity,
        voc,
        co2,
        ethylene: formattedEth,
        weight: formattedWeight,
        healthScore: metrics.healthScore,
        shelfLife: metrics.shelfLife,
        spoilageRisk: metrics.spoilageRisk,
        riskLevel: metrics.riskLevel,
        alerts,
        lastUpdated: new Date().toISOString()
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      sensorData,
      inspectBatch,
      updateSensorValues,
    }),
    [sensorData, inspectBatch, updateSensorValues]
  );

  return (
    <SensorContext.Provider value={value}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensorData = () => useContext(SensorContext);