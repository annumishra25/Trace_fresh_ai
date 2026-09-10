import { BACKEND_BASE_URL } from "../config/appConfig";

const API_BASE = BACKEND_BASE_URL.replace(/\/api$/, "");

export async function getNodes() {
  const res = await fetch(`${API_BASE}/api/nodes`);
  if (!res.ok) throw new Error("Failed to fetch nodes");
  return res.json();
}

export async function getNode(nodeId) {
  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}`);
  if (!res.ok) throw new Error(`Failed to fetch node ${nodeId}`);
  return res.json();
}

export async function getNodeSensors(nodeId) {
  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}/sensors`);
  if (!res.ok) throw new Error(`Failed to fetch sensors for ${nodeId}`);
  return res.json();
}

export async function compareNodes(node1 = "TF-NODE-01", node2 = "TF-NODE-02") {
  const res = await fetch(`${API_BASE}/api/nodes/compare?node1=${node1}&node2=${node2}`);
  if (!res.ok) throw new Error("Failed to compare nodes");
  return res.json();
}

export async function getLatestTelemetry() {
  const res = await fetch(`${API_BASE}/api/telemetry/latest`);
  if (!res.ok) throw new Error("Failed to fetch latest telemetry");
  return res.json();
}

export async function getLatestNodeTelemetry(nodeId) {
  const res = await fetch(`${API_BASE}/api/telemetry/latest/${nodeId}`);
  if (!res.ok) throw new Error(`Failed to fetch latest telemetry for ${nodeId}`);
  return res.json();
}

export async function getNodeTelemetry(nodeId, { limit = 100, from = null, to = null } = {}) {
  const query = new URLSearchParams();
  if (limit) query.append("limit", limit);
  if (from) query.append("from", from);
  if (to) query.append("to", to);

  const res = await fetch(`${API_BASE}/api/nodes/${nodeId}/telemetry?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch telemetry history for ${nodeId}`);
  return res.json();
}

export async function getBatchTelemetry(batchId, { limit = 100, from = null, to = null } = {}) {
  const query = new URLSearchParams();
  if (limit) query.append("limit", limit);
  if (from) query.append("from", from);
  if (to) query.append("to", to);

  const res = await fetch(`${API_BASE}/api/batches/${batchId}/telemetry?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch telemetry history for batch ${batchId}`);
  return res.json();
}

export async function sendTelemetry(payload) {
  const res = await fetch(`${API_BASE}/api/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to ingest telemetry");
  }
  return data;
}
