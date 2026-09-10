import { createContext, useContext, useMemo, useState, useCallback } from "react";

const DEFAULT_BATCH = {
  batchId: "TF-APL-2026-001",
  displayName: "Fuji Apples Batch 001",
  fruitType: "apple",
  location: "Container A - Node 01",
  latestAssessment: {
    freshnessScore: 94,
    shelfLifeDays: 9,
    spoilageRisk: 6,
    riskLevel: "LOW",
    status: "PASS",
    storageCondition: "OPTIMAL"
  }
};

const MonitoringBatchContext = createContext(null);

export function MonitoringBatchProvider({ children }) {
  const [selectedBatch, setSelectedBatchState] = useState(DEFAULT_BATCH);
  const [liveSensors, setLiveSensorsState] = useState(null);
  const [scanResult, setScanResultState] = useState(null);

  const setSelectedBatch = useCallback((batch) => {
    if (batch) setSelectedBatchState(batch);
  }, []);

  const setLiveSensors = useCallback((sensors) => {
    setLiveSensorsState(sensors);
  }, []);

  const setScanResult = useCallback((result) => {
    setScanResultState(result);
  }, []);

  const activeBatch = useMemo(() => scanResult || selectedBatch, [scanResult, selectedBatch]);

  const value = useMemo(
    () => ({
      selectedBatch,
      setSelectedBatch,
      liveSensors,
      setLiveSensors,
      scanResult,
      setScanResult,
      activeBatch,
    }),
    [selectedBatch, setSelectedBatch, liveSensors, setLiveSensors, scanResult, setScanResult, activeBatch]
  );

  return (
    <MonitoringBatchContext.Provider value={value}>
      {children}
    </MonitoringBatchContext.Provider>
  );
}

export function useMonitoringBatch() {
  const ctx = useContext(MonitoringBatchContext);
  if (!ctx) {
    throw new Error(
      "useMonitoringBatch must be used inside MonitoringBatchProvider"
    );
  }
  return ctx;
}