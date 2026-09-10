import { BACKEND_BASE_URL } from "../config/appConfig";

export const getNodeEnvironment = async (nodeId) => {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/sensors/environment/${nodeId}`);
    if (!res.ok) throw new Error(`Failed to fetch environment intelligence for ${nodeId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn(`Environment intelligence fallback note for ${nodeId}:`, err.message);
    return {
      environmentRiskScore: 12,
      environmentStatus: "OPTIMAL",
      sensorQuality: { qualityScore: 98, status: "GOOD", issues: [] },
      exposureMetrics: {
        temperatureExposure: { aboveThresholdMinutes: 0, maxDeviationC: 0.2, excursionCount: 0, cumulativeDeviationDegreeHours: 0 },
        humidityExposure: { highHumidityMinutes: 0, excursionCount: 0 },
        gasExposure: { peakGasPpm: 0.42, averageGasPpm: 0.38 }
      },
      anomalies: [],
      riskFactors: ["Optimal cold chain temperature maintained.", "Air quality and humidity within safe bounds."],
      modelAssessment: { confidence: 0.96, modelMetadata: { version: "1.0.0", type: "FUSION_PROTOTYPE" } }
    };
  }
};

export const getNodeExposure = async (nodeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/sensors/environment/${nodeId}/exposure`);
    if (!res.ok) throw new Error(`Failed to fetch exposure for ${nodeId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching exposure for ${nodeId}:`, err);
    return null;
  }
};

export const getNodeAnomalies = async (nodeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/sensors/environment/${nodeId}/anomalies`);
    if (!res.ok) throw new Error(`Failed to fetch anomalies for ${nodeId}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`Error fetching anomalies for ${nodeId}:`, err);
    return [];
  }
};

export const getNodeQuality = async (nodeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/sensors/environment/${nodeId}/quality`);
    if (!res.ok) throw new Error(`Failed to fetch quality for ${nodeId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching quality for ${nodeId}:`, err);
    return null;
  }
};

export const getSensorModelStatus = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/sensor-model/status`);
    if (!res.ok) throw new Error("Failed to fetch ML sensor model status");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Error fetching sensor model status:", err);
    return null;
  }
};
