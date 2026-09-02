import { createContext, useContext, useMemo, useState } from "react";

const MonitoringBatchContext = createContext(null);

export function MonitoringBatchProvider({ children }) {
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [liveSensors, setLiveSensors] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const activeBatch = scanResult || selectedBatch;

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
    [selectedBatch, liveSensors, scanResult, activeBatch]
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