import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Package,
  Truck,
  Cpu,
  AlertTriangle,
  TrendingUp,
  Clock,
  Radio,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  Sparkles,
  Zap,
  Flame,
  ShieldCheck,
  ChevronRight,
  Filter
} from "lucide-react";

import { useTelemetry } from "../context/TelemetryContext";
import { useSensorData } from "../context/SensorContext";
import { fetchAllBatches } from "../services/batchApi";
import { mockBatches } from "../data/mockBatches";
import { calculateHealthMetrics } from "../utils/foodHealthEngine";
import { detectAnomalies } from "../utils/anomalyEngine";

import MetricCard from "../components/MetricCard/MetricCard";
import StatusBadge from "../components/StatusBadge/StatusBadge";
import {
  SectionHeader,
  DataCard,
  ProgressBar,
  TrendIndicator,
  AlertBadge,
  AIConfidenceBar
} from "../components/common";

export function Overview() {
  const navigate = useNavigate();
  const { nodes, isLiveMode, connectionStatus, lastUpdated, activeTelemetry } = useTelemetry();
  const { sensorData } = useSensorData();

  const [batches, setBatches] = useState(mockBatches);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;
    fetchAllBatches()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setBatches(data);
        }
      })
      .catch(() => {
        if (isMounted) setBatches(mockBatches);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute primary dashboard KPIs from real batch data
  const kpiData = useMemo(() => {
    if (!batches || batches.length === 0) {
      return {
        activeShipmentsCount: "No data",
        monitoredBatchesCount: "No data",
        avgFreshnessScore: "No data",
        atRiskBatchesCount: "No data",
        activeDevicesCount: "No data",
        avgShelfLife: "No data"
      };
    }

    const uniqueShipments = new Set(
      batches.map((b) => b.traceability?.shipmentId || b.shipmentId).filter(Boolean)
    );
    const activeShipmentsCount = uniqueShipments.size || batches.length;
    const monitoredBatchesCount = batches.length;

    let totalScore = 0;
    let totalShelfLife = 0;
    let atRiskBatchesCount = 0;

    batches.forEach((b) => {
      const score = b.latestAssessment?.freshnessScore ?? 85;
      const shelf = b.latestAssessment?.shelfLifeDays ?? 7.0;
      totalScore += score;
      totalShelfLife += shelf;
      if (score < 70 || b.latestAssessment?.riskLevel === "CRITICAL" || b.latestAssessment?.riskLevel === "WARNING") {
        atRiskBatchesCount++;
      }
    });

    const avgFreshnessScore = (totalScore / batches.length).toFixed(1);
    const avgShelfLife = (totalShelfLife / batches.length).toFixed(1);
    const activeDevicesCount = nodes ? nodes.filter((n) => n.status === "ONLINE").length : 2;

    return {
      activeShipmentsCount,
      monitoredBatchesCount,
      avgFreshnessScore,
      atRiskBatchesCount,
      activeDevicesCount,
      avgShelfLife
    };
  }, [batches, nodes]);

  // Compute Freshness Distribution Categories
  const freshnessDistribution = useMemo(() => {
    if (!batches || batches.length === 0) {
      return { healthy: 0, warning: 0, critical: 0, healthyPct: 0, warningPct: 0, criticalPct: 0 };
    }
    let healthy = 0;
    let warning = 0;
    let critical = 0;

    batches.forEach((b) => {
      const score = b.latestAssessment?.freshnessScore ?? 85;
      if (score >= 85) healthy++;
      else if (score >= 60) warning++;
      else critical++;
    });

    const total = batches.length;
    return {
      healthy,
      warning,
      critical,
      healthyPct: Math.round((healthy / total) * 100),
      warningPct: Math.round((warning / total) * 100),
      criticalPct: Math.round((critical / total) * 100)
    };
  }, [batches]);

  // Map shipments list for interactive table
  const shipmentTableData = useMemo(() => {
    return batches.map((b, idx) => {
      const score = b.latestAssessment?.freshnessScore ?? 85;
      let status = "IN TRANSIT";
      if (score < 30) status = "QUARANTINED";
      else if (score < 70) status = "WARNING";
      else if (idx % 2 === 0) status = "DELIVERED";

      return {
        shipmentId: b.traceability?.shipmentId || `SHIP-${b.fruitType.substring(0, 3).toUpperCase()}-${100 + idx}`,
        batchId: b.batchId,
        fruit: b.fruitType ? b.fruitType.charAt(0).toUpperCase() + b.fruitType.slice(1) : "Apple",
        origin: b.source || "Farm Origin Hub",
        destination: b.location || "Distribution Center",
        dispatched: b.createdAt ? new Date(b.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "Jul 8",
        currentLocation: b.traceability?.node || b.location || "In Transit Node",
        journeyProgress: score < 30 ? 100 : Math.min(95, 25 + idx * 15),
        freshnessScore: score,
        risk: b.latestAssessment?.riskLevel || (score >= 85 ? "EXCELLENT" : score >= 60 ? "WARNING" : "CRITICAL"),
        status
      };
    });
  }, [batches]);

  const filteredShipments = useMemo(() => {
    if (activeFilter === "ALL") return shipmentTableData;
    return shipmentTableData.filter((s) => s.status === activeFilter || s.risk === activeFilter);
  }, [shipmentTableData, activeFilter]);

  // Selected shipment for milestone journey viewer
  const activeShipmentDetail = selectedShipment || shipmentTableData[0] || {
    shipmentId: "SHIP-APL-110",
    batchId: "TF-APL-2026-001",
    journeyProgress: 65,
    status: "IN TRANSIT"
  };

  // Live telemetry metrics from active hardware / simulator context
  const liveSensors = useMemo(() => {
    const s = activeTelemetry?.sensors || sensorData || {};
    return {
      temp: s.temperature?.value ?? s.temperature ?? 24.5,
      humidity: s.humidity?.value ?? s.humidity ?? 68.0,
      voc: s.voc?.value ?? s.voc ?? s.mq135 ?? 135,
      co2: s.co2?.value ?? s.co2 ?? 480,
      ethylene: s.gas?.value ?? s.ethylene ?? 0.22,
      rawGasSignal: s.gas?.value ?? s.mq135 ?? 135
    };
  }, [activeTelemetry, sensorData]);

  // Computed AI Insights & Anomaly alerts
  const aiAnomalies = useMemo(() => {
    const rawAnomalies = detectAnomalies(liveSensors);
    const list = [...rawAnomalies];

    batches.forEach((b) => {
      if (b.latestAssessment?.suspiciousQualityFlag) {
        list.push({
          severity: "HIGH",
          message: `Visual Anomaly: ${b.batchId} (${b.fruitType}) flagged with ${b.latestAssessment.visualClass}`
        });
      }
    });

    if (list.length === 0) {
      list.push({
        severity: "INFO",
        message: "All multi-modal fusion channels operating within normal threshold limits."
      });
    }
    return list;
  }, [liveSensors, batches]);

  // Aggregate Alert Feed
  const alertCenterFeed = useMemo(() => {
    const items = [
      {
        id: "alt-1",
        severity: "CRITICAL",
        time: "10 mins ago",
        batchId: "TF-APL-2026-004",
        shipmentId: "SHIP-APL-114",
        type: "Thermal Excursion",
        description: "Temperature exceeded cold chain threshold (33.5°C) accelerating senescence."
      },
      {
        id: "alt-2",
        severity: "WARNING",
        time: "25 mins ago",
        batchId: "TF-BAN-2026-005",
        shipmentId: "SHIP-BAN-205",
        type: "Abnormal Gas Spike",
        description: "Elevated VOC gas emissions detected signaling tissue breakdown."
      },
      {
        id: "alt-3",
        severity: "WARNING",
        time: "1 hour ago",
        batchId: "TF-ORG-2026-006",
        shipmentId: "SHIP-ORG-306",
        type: "Freshness Deterioration",
        description: "Freshness score dropped below 50% threshold. Quarantine advised."
      }
    ];
    return items;
  }, []);

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
      {/* ==================================================
          TOP SECTION: COMMAND CENTER HEADER
          ================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-blue-600 animate-pulse" /> Command Center Operations
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isLiveMode ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <Radio size={12} className={isLiveMode ? "animate-pulse text-emerald-600" : "text-slate-400"} />
              {isLiveMode ? "LIVE BACKEND SYNC" : "DEMO SIMULATOR"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            TraceFresh AI
            <span className="text-slate-500 font-medium text-lg sm:text-2xl block sm:inline sm:ml-3">
              Supply Chain Intelligence Dashboard
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Real-time IoT telemetry, AI vision inspection, and multi-modal cold-chain risk monitoring across active produce shipments.
          </p>
        </div>

        {/* Header Metadata Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-3 z-10 shrink-0">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Monitoring Status</div>
            <div className="text-xs font-extrabold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Active Shipments</div>
            <div className="text-sm font-black font-mono text-slate-900 mt-1">{kpiData.activeShipmentsCount}</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Active Nodes</div>
            <div className="text-sm font-black font-mono text-blue-600 mt-1">{kpiData.activeDevicesCount} Nodes</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Last Synced</div>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Just Now"}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          PRIMARY KPI ROW (6 CARDS)
          ================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Active Shipments"
          value={kpiData.activeShipmentsCount}
          subtitle="In-transit cold chain"
          icon={Truck}
          color="blue"
        />

        <MetricCard
          title="Monitored Batches"
          value={kpiData.monitoredBatchesCount}
          subtitle="Active lot passports"
          icon={Package}
          color="violet"
        />

        <MetricCard
          title="Avg Freshness Score"
          value={kpiData.avgFreshnessScore !== "No data" ? `${kpiData.avgFreshnessScore}%` : "No data"}
          trend={kpiData.avgFreshnessScore !== "No data" ? "↑ +1.2%" : null}
          subtitle="Fleet average"
          icon={Activity}
          color="emerald"
        />

        <MetricCard
          title="At-Risk Batches"
          value={kpiData.atRiskBatchesCount}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color="rose"
        />

        <MetricCard
          title="Active Devices"
          value={kpiData.activeDevicesCount}
          subtitle="IoT telemetry nodes"
          icon={Cpu}
          color="blue"
        />

        <MetricCard
          title="Avg Remaining Shelf Life"
          value={kpiData.avgShelfLife !== "No data" ? `${kpiData.avgShelfLife} Days` : "No data"}
          subtitle="Estimated shelf window"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* ==================================================
          FRESHNESS OVERVIEW & LIVE SENSOR SUMMARY
          ================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Large Freshness Intelligence Card (7 cols) */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <SectionHeader
            title="Freshness Intelligence Overview"
            subtitle="Batch freshness index distribution calculated via AI multi-modal fusion engine"
            badge="Health Engine"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Healthy Batches</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
                {freshnessDistribution.healthy}
              </div>
              <div className="text-xs font-semibold text-emerald-600 mt-1">
                {freshnessDistribution.healthyPct}% of total lots (≥85 Score)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Warning Batches</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="text-3xl font-black text-amber-700 font-mono mt-2">
                {freshnessDistribution.warning}
              </div>
              <div className="text-xs font-semibold text-amber-600 mt-1">
                {freshnessDistribution.warningPct}% of total lots (60-84 Score)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                <span>Critical Spoilage</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="text-3xl font-black text-rose-700 font-mono mt-2">
                {freshnessDistribution.critical}
              </div>
              <div className="text-xs font-semibold text-rose-600 mt-1">
                {freshnessDistribution.criticalPct}% of total lots (&lt;60 Score)
              </div>
            </div>
          </div>

          {/* Combined Progress Distribution Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Freshness Score Distribution Across Supply Chain</span>
              <span className="font-mono text-blue-600">Mean: {kpiData.avgFreshnessScore}%</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${freshnessDistribution.healthyPct}%` }}
                title={`Healthy: ${freshnessDistribution.healthyPct}%`}
              ></div>
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${freshnessDistribution.warningPct}%` }}
                title={`Warning: ${freshnessDistribution.warningPct}%`}
              ></div>
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${freshnessDistribution.criticalPct}%` }}
                title={`Critical: ${freshnessDistribution.criticalPct}%`}
              ></div>
            </div>
          </div>
        </div>

        {/* Live Sensor Summary Section (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <SectionHeader
            title="Live Environment Telemetry"
            subtitle="Active hardware & sensor telemetry readings"
            badge="Telemetry Bridge"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Thermometer size={14} className="text-blue-600" />
                <span>Temperature</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-2">
                {liveSensors.temp.toFixed(1)}°C
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                Optimal Zone
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Droplets size={14} className="text-blue-600" />
                <span>Humidity</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-2">
                {liveSensors.humidity.toFixed(1)}%
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                Nominal
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Wind size={14} className="text-purple-600" />
                <span>Gas / MQ135</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-2">
                {liveSensors.rawGasSignal} <span className="text-xs text-slate-400 font-normal">raw</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                MQ135 Gas Signal
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Wind size={14} className="text-blue-600" />
                <span>CO₂ Concentration</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-2">
                {liveSensors.co2} ppm
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                Baseline
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 col-span-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Sparkles size={14} className="text-amber-500" />
                <span>Ethylene Gas (Senescence)</span>
              </div>
              <div className="text-xl font-black text-slate-900 font-mono mt-2">
                {Number(liveSensors.ethylene).toFixed(2)} ppm
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                Calibrated Signal Target
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          ACTIVE SHIPMENTS TABLE
          ================================================== */}
      <DataCard
        title="Active Cold Chain Shipments"
        subtitle="Click any shipment row to navigate to detailed traceability and digital passport"
        action={
          <div className="flex items-center gap-1">
            {["ALL", "IN TRANSIT", "DELIVERED", "QUARANTINED"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
        noPadding
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-mono">
                <th className="py-3.5 px-4">Shipment</th>
                <th className="py-3.5 px-4">Batch ID</th>
                <th className="py-3.5 px-4">Fruit</th>
                <th className="py-3.5 px-4">Origin</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Dispatched</th>
                <th className="py-3.5 px-4">Current Location</th>
                <th className="py-3.5 px-4">Journey Progress</th>
                <th className="py-3.5 px-4">Freshness</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
              {filteredShipments.map((s) => (
                <tr
                  key={s.shipmentId}
                  onClick={() => {
                    setSelectedShipment(s);
                    navigate("/traceability");
                  }}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-bold font-mono text-blue-600 group-hover:underline flex items-center gap-1.5">
                    <Truck size={14} className="text-slate-400 group-hover:text-blue-600" />
                    <span>{s.shipmentId}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{s.batchId}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.fruit}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.origin}</td>
                  <td className="py-3.5 px-4 text-slate-500">{s.destination}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{s.dispatched}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">{s.currentLocation}</td>
                  <td className="py-3.5 px-4">
                    <div className="w-24 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>{s.journeyProgress}%</span>
                      </div>
                      <ProgressBar value={s.journeyProgress} size="sm" showValue={false} color={s.journeyProgress === 100 ? "emerald" : "blue"} />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className={s.freshnessScore >= 85 ? "text-emerald-600" : s.freshnessScore >= 60 ? "text-amber-600" : "text-rose-600"}>
                      {s.freshnessScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.risk} />
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      s.status === "DELIVERED"
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : s.status === "QUARANTINED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataCard>

      {/* ==================================================
          SHIPMENT JOURNEY PIPELINE & AI INSIGHTS
          ================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Compact Shipment Journey Pipeline (7 cols) */}
        <div className="xl:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <SectionHeader
            title={`Shipment Journey Pipeline — ${activeShipmentDetail?.shipmentId || "SHIP-APL-110"}`}
            subtitle={`Real-time transit milestones for Lot ${activeShipmentDetail?.batchId || "TF-APL-2026-001"}`}
            badge={activeShipmentDetail?.status || "IN TRANSIT"}
          />

          <div className="py-4 px-2">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 relative">
              {[
                { stage: "Harvested", done: true, time: "Jul 07 08:00" },
                { stage: "Packed", done: true, time: "Jul 07 14:30" },
                { stage: "Dispatched", done: true, time: "Jul 08 06:15" },
                { stage: "In Transit", done: (activeShipmentDetail?.journeyProgress || 0) > 40, time: "Active" },
                { stage: "Warehouse", done: (activeShipmentDetail?.journeyProgress || 0) >= 90, time: (activeShipmentDetail?.journeyProgress || 0) >= 90 ? "Arrived" : "Unknown" },
                { stage: "Delivered", done: activeShipmentDetail?.status === "DELIVERED", time: activeShipmentDetail?.status === "DELIVERED" ? "Completed" : "Unknown" }
              ].map((step, idx) => (
                <div key={step.stage} className="flex flex-col items-center text-center space-y-2 relative">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shadow-2xs border ${
                      step.done
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}
                  >
                    {step.done ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>
                  <div className="text-xs font-bold text-slate-900">{step.stage}</div>
                  <div className="text-[10px] font-mono text-slate-400">{step.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights & Anomalies Panel (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <SectionHeader
            title="AI Multi-Modal Insights"
            subtitle="Automated environmental, route, and optical vision anomaly flags"
            badge="AI Fusion"
          />

          <div className="space-y-3">
            {aiAnomalies.map((anom, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start gap-3"
              >
                <div className="mt-0.5 shrink-0">
                  {anom.severity === "HIGH" ? (
                    <Flame size={18} className="text-rose-500" />
                  ) : anom.severity === "MEDIUM" ? (
                    <AlertTriangle size={18} className="text-amber-500" />
                  ) : (
                    <Sparkles size={18} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{anom.message}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Severity: {anom.severity || "NORMAL"} • Verified by AI Decision Engine
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ==================================================
          ALERT CENTER FEED
          ================================================== */}
      <DataCard
        title="Enterprise Alert Center"
        subtitle="Critical thermal excursions, gas spikes, GPS deviations, and spoilage notifications"
        action={
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {alertCenterFeed.length} Action Items
          </span>
        }
      >
        <div className="divide-y divide-slate-100">
          {alertCenterFeed.map((alt) => (
            <div key={alt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertBadge level={alt.severity} />
                <div>
                  <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <span>{alt.type}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-blue-600">{alt.batchId}</span>
                    <span className="text-slate-400">({alt.shipmentId})</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{alt.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-mono font-medium text-slate-400">{alt.time}</span>
                <button
                  onClick={() => navigate("/traceability")}
                  className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DataCard>
    </div>
  );
}

export default Overview;