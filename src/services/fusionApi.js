const API_BASE_URL = "http://127.0.0.1:5000/api";

export const getBatchFusion = async (batchId = "TF-APL-2026-001", nodeId = null, demoScenario = null) => {
  try {
    let url = `${API_BASE_URL}/fusion/batch/${batchId}`;
    const params = new URLSearchParams();
    if (nodeId) params.append("nodeId", nodeId);
    if (demoScenario) params.append("demoScenario", demoScenario);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch fusion decision for ${batchId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching fusion for batch ${batchId}:`, err);
    return null;
  }
};

export const evaluateBatchFusion = getBatchFusion;

export const runDemoFusionScenario = async (scenario = "ALL_GREEN", batchId = "TF-APL-2026-001", nodeId = "TF-NODE-01") => {
  try {
    const res = await fetch(`${API_BASE_URL}/fusion/demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ scenario, batchId, nodeId })
    });
    if (!res.ok) throw new Error("Demo fusion evaluation failed");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Error triggering demo fusion scenario:", err);
    return null;
  }
};

export const runFusionDemoScenario = runDemoFusionScenario;

export const getFusionExplanation = async (batchId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/fusion/batch/${batchId}/explanation`);
    if (!res.ok) throw new Error(`Failed to fetch fusion explanation for ${batchId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching fusion explanation for ${batchId}:`, err);
    return null;
  }
};

export const getDecisionTrace = async (batchId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/fusion/batch/${batchId}/decision-trace`);
    if (!res.ok) throw new Error(`Failed to fetch decision trace for ${batchId}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`Error fetching decision trace for ${batchId}:`, err);
    return [];
  }
};

export const getFusionDecisionTrace = getDecisionTrace;

export const getFusionTimeline = async (batchId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/fusion/batch/${batchId}/timeline`);
    if (!res.ok) throw new Error(`Failed to fetch fusion timeline for ${batchId}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`Error fetching fusion timeline for ${batchId}:`, err);
    return [];
  }
};

export const getPassportSummary = async (batchId = "TF-APL-2026-001") => {
  try {
    const res = await fetch(`${API_BASE_URL}/fusion/batch/${batchId}`);
    if (!res.ok) throw new Error(`Failed to fetch passport summary for ${batchId}`);
    const json = await res.json();
    return json.data?.passportSummary || null;
  } catch (err) {
    console.error(`Error fetching passport summary for ${batchId}:`, err);
    return null;
  }
};
