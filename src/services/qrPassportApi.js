const API_BASE_URL = "http://127.0.0.1:5000/api";

export const createQrIdentity = async (batchId, containerId = null, forceNew = false) => {
  try {
    const res = await fetch(`${API_BASE_URL}/qr/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId, containerId, forceNew })
    });
    if (!res.ok) throw new Error("Failed to create QR identity");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Error creating QR identity:", err);
    return null;
  }
};

export const getQrByBatch = async (batchId = "TF-APL-2026-001") => {
  try {
    const res = await fetch(`${API_BASE_URL}/qr/batch/${batchId}`);
    if (!res.ok) throw new Error(`Failed to fetch QR identity for batch ${batchId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching QR for ${batchId}:`, err);
    return null;
  }
};

export const deactivateQr = async (qrId, reason = "Operator Manual Deactivation") => {
  try {
    const res = await fetch(`${API_BASE_URL}/qr/${qrId}/deactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error(`Failed to deactivate QR ${qrId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error deactivating QR ${qrId}:`, err);
    return null;
  }
};

export const getPublicVerification = async (publicToken) => {
  try {
    const res = await fetch(`${API_BASE_URL}/public/verify/${publicToken}`);
    if (!res.ok) throw new Error(`Failed public verification for token ${publicToken}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error verifying public token ${publicToken}:`, err);
    return null;
  }
};

export const getPublicDemoScenario = async (scenarioId = "VERIFIED_GOOD") => {
  try {
    const res = await fetch(`${API_BASE_URL}/public/demo/${scenarioId}`);
    if (!res.ok) throw new Error(`Failed to fetch public demo scenario ${scenarioId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching demo scenario ${scenarioId}:`, err);
    return null;
  }
};
