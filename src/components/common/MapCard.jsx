import React from "react";
import DataCard from "./DataCard";
import SupplyChainMap from "../SupplyChainMap/SupplyChainMap";

export function MapCard({ title = "Geospatial Cold-Chain Tracking", subtitle = "Real-time telemetry and transit route monitoring", className = "" }) {
  return (
    <DataCard title={title} subtitle={subtitle} noPadding className={className}>
      <div className="h-[380px] w-full relative overflow-hidden rounded-b-2xl">
        <SupplyChainMap />
      </div>
    </DataCard>
  );
}

export default MapCard;
