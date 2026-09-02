export const ingestBatchScan = async (batchId, payload) => {
  const res = await fetch(`${API_BASE}/batches/${batchId}/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to ingest batch scan");
  }

  return data.data;
};