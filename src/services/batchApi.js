import { BACKEND_BASE_URL } from "../config/appConfig";

const API_BASE = BACKEND_BASE_URL;

export const fetchBatchById = async (batchId) => {
  const res = await fetch(`${API_BASE}/batches/${batchId}`);
  if (!res.ok) throw new Error(`Failed to fetch batch ${batchId}`);
  const data = await res.json();
  return data.data;
};

export const fetchAllBatches = async () => {
  const res = await fetch(`${API_BASE}/batches`);
  if (!res.ok) throw new Error("Failed to fetch batches");
  const data = await res.json();
  return data.data;
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