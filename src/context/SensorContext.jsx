import { createContext, useContext, useEffect, useState } from "react";
import { calculateHealthMetrics } from "../utils/foodHealthEngine";
import { detectAnomalies } from "../utils/anomalyEngine";

const SensorContext = createContext();

const PI_BASE_URL = "http://10.87.65.109:5000";
const AI_BACKEND_URL = "http://127.0.0.1:5000";

export const SensorProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState({
    temperature: 25.4,
    humidity: 64,
    voc: 120,
    co2: 450,
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

    batchId: "UNKNOWN",
    fruitType: "Unknown",
    nodeId: "Unknown",

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

    // NEW
    inspection: null,
    inspecting: false,
  });

  const inspectBatch = async () => {
    try {
      setSensorData((prev) => ({
        ...prev,
        inspecting: true,
      }));

      const response = await fetch(`${AI_BACKEND_URL}/api/inspect`, {
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
      console.error(err);

      setSensorData((prev) => ({
        ...prev,
        inspecting: false,
      }));
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [sensorRes, historyRes] = await Promise.all([
          fetch(`${PI_BASE_URL}/api/sensors`),
          fetch(`${PI_BASE_URL}/api/history`),
        ]);

        const sensorPayload = await sensorRes.json();
        const historyPayload = await historyRes.json();

        setSensorData((prev) => {
          const temperature =
            sensorPayload.temperature ?? prev.temperature;

          const humidity =
            sensorPayload.humidity ?? prev.humidity;

          const voc =
            sensorPayload.voc ?? prev.voc;

          const co2 =
            sensorPayload.co2 ?? prev.co2;

          const ethylene =
            sensorPayload.ethylene ?? prev.ethylene;

          const weight =
            sensorPayload.weight ?? prev.weight;

          const metrics = calculateHealthMetrics({
            temperature,
            humidity,
            voc,
            co2,
            ethylene,
            weight,
          });

          const alerts = detectAnomalies({
            temperature,
            humidity,
            voc,
            co2,
            ethylene,
            weight,
          });

          const backendHistory = Array.isArray(historyPayload.history)
            ? historyPayload.history.map((item) => ({
                time: item.timestamp
                  ? new Date(item.timestamp).toLocaleTimeString()
                  : "--",

                temperature: item.temperature,
                humidity: item.humidity,
                voc: item.voc,
                co2: item.co2,
                ethylene: item.ethylene,
                weight: item.weight,
              }))
            : [];

          return {
            ...prev,

            temperature: Number(temperature).toFixed(1),
            humidity,
            voc,
            co2,
            ethylene: Number(ethylene).toFixed(2),
            weight: Number(weight).toFixed(1),

            healthScore: metrics.healthScore,
            shelfLife: metrics.shelfLife,
            spoilageRisk: metrics.spoilageRisk,
            riskLevel: metrics.riskLevel,

            alerts,

            history: backendHistory,

            batchId: sensorPayload.batch_id || "UNKNOWN",
            fruitType: sensorPayload.fruit_type || "Unknown",
            nodeId: sensorPayload.node_id || "Unknown",

            sensorStatus: sensorPayload.sensor_status || {
              dht11: "unknown",
              mq135: "unknown",
            },

            airQualityStatus:
              sensorPayload.air_quality_status || "Unknown",

            gasDetected: sensorPayload.gas_detected ?? false,

            cameraStatus:
              sensorPayload.camera_status || "unknown",

            systemStatus:
              sensorPayload.system_status || "offline",

            dataSource:
              sensorPayload.data_source || {},

            notes:
              sensorPayload.notes || {},

            lastUpdated:
              sensorPayload.timestamp || null,

            lastCapture:
              sensorPayload.last_capture || null,

            backendLive: true,
          };
        });
      } catch (err) {
        console.error(err);

        setSensorData((prev) => ({
          ...prev,
          backendLive: false,
          systemStatus: "offline",
        }));
      }
    };

    fetchAllData();

    const interval = setInterval(fetchAllData, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SensorContext.Provider
      value={{
        sensorData,
        inspectBatch,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensorData = () => useContext(SensorContext);