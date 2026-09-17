import { BACKEND_BASE_URL } from "../config/appConfig";
import { mockBatches, getBatchById } from "../data/mockBatches";

const API_BASE = BACKEND_BASE_URL;

export const fetchBatchById = async (batchId) => {
  const localBatch = getBatchById(batchId);
  try {
    const res = await fetch(`${API_BASE}/batches/${batchId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        return {
          ...data.data,
          latestSensors: localBatch?.latestSensors
            ? { ...data.data.latestSensors, ...localBatch.latestSensors }
            : data.data.latestSensors
        };
      }
    }
  } catch (err) {
    console.warn("Backend batch fetch failed, loading local Lot Passport store:", err.message);
  }
  return localBatch || mockBatches[0];
};

export const fetchAllBatches = async () => {
  try {
    const res = await fetch(`${API_BASE}/batches`);
    if (res.ok) {
      const data = await res.json();
      if (data.data && data.data.length > 0) return data.data;
    }
  } catch (err) {
    console.warn("Backend batches fetch failed, loading local Lot Passport store:", err.message);
  }
  return mockBatches;
};

export const createBatch = async (payload) => {
  const res = await fetch(`${API_BASE}/batches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to create batch");
  }

  return data.data;
};

export const updateBatchScan = async (batchId, payload) => {
  const res = await fetch(`${API_BASE}/batches/${batchId}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to update batch scan");
  }

  return data.data;
};

export const ingestBatchScan = async (batchId, payload) => {
  const res = await fetch(`${API_BASE}/batches/${batchId}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to ingest batch scan");
  }

  return data.data;
};