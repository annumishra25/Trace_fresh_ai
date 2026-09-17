export const mockBatches = [
  {
    batchId: "TF-APL-2026-001",
    fruitType: "apple",
    displayName: "Fresh Apple Lot 1",
    source: "Demo Farm A",
    location: "Chennai Storage Node",
    createdAt: "2026-07-08T08:00:00",
    lastUpdated: "2026-07-08T11:42:00",

    latestAssessment: {
      visualClass: "freshapples",
      confidence: 0.96,
      freshnessScore: 94,
      shelfLifeDays: 9.4,
      spoilageRisk: 6,
      riskLevel: "EXCELLENT",
      status: "VERIFIED FRESH",
      qualityAdvisory:
        "Surface scan confirms healthy apple texture with zero decay signs. Storage parameters remain optimal.",
      suspiciousQualityFlag: false,
      reasons: [
        "Visual classifier confirmed fresh apple surface (freshapples)",
        "Temperature 33.5°C oscillating within monitored parameters",
        "Humidity 62.5% and gas reading remain baseline optimal"
      ]
    },

    latestSensors: {
      temperature: 33.5,
      humidity: 62.5,
      mq135: 125,
      voc: 125,
      co2: 425,
      ethylene: 0.18,
      weight: 250.0,
      storageCondition: "Optimal"
    },

    traceability: {
      lotId: "LOT-APL-01",
      packedDate: "2026-07-07",
      lastScanTime: "2026-07-08T11:42:00",
      shipmentId: "SHIP-APL-110",
      node: "Chennai Storage Node"
    }
  },

  {
    batchId: "TF-BAN-2026-002",
    fruitType: "banana",
    displayName: "Fresh Banana Lot 2",
    source: "Demo Farm B",
    location: "Coimbatore Transit Hub",
    createdAt: "2026-07-08T09:10:00",
    lastUpdated: "2026-07-08T12:20:00",

    latestAssessment: {
      visualClass: "freshbanana",
      confidence: 0.92,
      freshnessScore: 88,
      shelfLifeDays: 5.2,
      spoilageRisk: 12,
      riskLevel: "GOOD",
      status: "VERIFIED FRESH",
      qualityAdvisory:
        "Fresh export banana batch in ideal ripening stage. Visual skin color is vibrant and unblemished.",
      suspiciousQualityFlag: false,
      reasons: [
        "Visual classifier confirmed fresh banana skin (freshbanana)",
        "Ethylene level normal for current ripening stage",
        "Storage conditions stable across transit"
      ]
    },

    latestSensors: {
      temperature: 33.5,
      humidity: 62.5,
      mq135: 125,
      voc: 125,
      co2: 425,
      ethylene: 0.18,
      weight: 250.0,
      storageCondition: "Optimal"
    },

    traceability: {
      lotId: "LOT-BAN-02",
      packedDate: "2026-07-07",
      lastScanTime: "2026-07-08T12:20:00",
      shipmentId: "SHIP-BAN-200",
      node: "Coimbatore Transit Hub"
    }
  },

  {
    batchId: "TF-ORG-2026-003",
    fruitType: "orange",
    displayName: "Fresh Orange Lot 3",
    source: "Demo Farm C",
    location: "Bengaluru Distribution Center",
    createdAt: "2026-07-08T07:40:00",
    lastUpdated: "2026-07-08T10:55:00",

    latestAssessment: {
      visualClass: "freshoranges",
      confidence: 0.94,
      freshnessScore: 92,
      shelfLifeDays: 7.1,
      spoilageRisk: 8,
      riskLevel: "EXCELLENT",
      status: "VERIFIED FRESH",
      qualityAdvisory:
        "Premium orange surface confirmed healthy. Zero mold or rot detected under AI vision scan.",
      suspiciousQualityFlag: false,
      reasons: [
        "Visual classifier confirmed fresh orange skin (freshoranges)",
        "VOC off-gassing within normal limits",
        "Temperature remains stable"
      ]
    },

    latestSensors: {
      temperature: 33.5,
      humidity: 62.5,
      mq135: 125,
      voc: 125,
      co2: 425,
      ethylene: 0.18,
      weight: 250.0,
      storageCondition: "Optimal"
    },

    traceability: {
      lotId: "LOT-ORG-03",
      packedDate: "2026-07-07",
      lastScanTime: "2026-07-08T10:55:00",
      shipmentId: "SHIP-ORG-300",
      node: "Bengaluru Distribution Center"
    }
  },

  {
    batchId: "TF-APL-2026-004",
    fruitType: "apple",
    displayName: "Rotten Apple Lot 4",
    source: "Demo Farm A",
    location: "Quarantine Vault 1",
    createdAt: "2026-07-08T10:00:00",
    lastUpdated: "2026-07-08T13:00:00",

    latestAssessment: {
      visualClass: "rottenapples",
      confidence: 0.98,
      freshnessScore: 0,
      shelfLifeDays: 0.0,
      spoilageRisk: 100,
      riskLevel: "CRITICAL",
      status: "ROTTEN / UNSAFE",
      qualityAdvisory:
        "CRITICAL ALERT: Visual scan detected decaying rotten apple surface (rottenapples). Spoilage risk 100%. Quarantine required.",
      suspiciousQualityFlag: true,
      reasons: [
        "Visual classifier detected severe decay patterns: rottenapples (98% confidence)",
        "Elevated VOC gas detected from tissue breakdown",
        "Quarantine protocol activated"
      ]
    },

    latestSensors: {
      temperature: 33.5,
      humidity: 62.5,
      mq135: 125,
      voc: 125,
      co2: 425,
      ethylene: 0.18,
      weight: 250.0,
      storageCondition: "Suboptimal"
    },

    traceability: {
      lotId: "LOT-APL-04",
      packedDate: "2026-07-05",
      lastScanTime: "2026-07-08T13:00:00",
      shipmentId: "SHIP-APL-114",
      node: "Quarantine Vault 1"
    }
  },

  {
    batchId: "TF-BAN-2026-005",
    fruitType: "banana",
    displayName: "Rotten Banana Lot 5",
    source: "Demo Farm B",
    location: "Quarantine Vault 2",
    createdAt: "2026-07-08T11:00:00",
    lastUpdated: "2026-07-08T13:30:00",

    latestAssessment: {
      visualClass: "rottenbanana",
      confidence: 0.97,
      freshnessScore: 0,
      shelfLifeDays: 0.0,
      spoilageRisk: 100,
      riskLevel: "CRITICAL",
      status: "ROTTEN / UNSAFE",
      qualityAdvisory:
        "CRITICAL ALERT: Visual scan detected overripe rotten banana tissue (rottenbanana). High ethylene & VOC emissions.",
      suspiciousQualityFlag: true,
      reasons: [
        "Visual classifier detected severe rot: rottenbanana (97% confidence)",
        "Ethylene off-gassing spiking senescence process",
        "Batch flagged for immediate removal"
      ]
    },

    latestSensors: {
      temperature: 33.5,
      humidity: 62.5,
      mq135: 125,
      voc: 125,
      co2: 425,
      ethylene: 0.18,
      weight: 250.0,
      storageCondition: "Suboptimal"
    },

    traceability: {
      lotId: "LOT-BAN-05",
      packedDate: "2026-07-04",
      lastScanTime: "2026-07-08T13:30:00",
      shipmentId: "SHIP-BAN-205",
      node: "Quarantine Vault 2"
    }
  },

  {
    batchId: "TF-ORG-2026-006",
    fruitType: "orange",
    displayName: "Rotten Orange Lot 6",
    source: "Demo Farm C",
    location: "Quarantine Vault 3",
    createdAt: "2026-07-08T11:30:00",
    lastUpdated: "2026-07-08T13:45:00",

    latestAssessment: {
      visualClass: "rottenoranges",
      confidence: 0.96,
      freshnessScore: 0,
      shelfLifeDays: 0.0,
      spoilageRisk: 100,
      riskLevel: "CRITICAL",
      status: "ROTTEN / UNSAFE",
      qualityAdvisory:
        "CRITICAL ALERT: Visual scan detected surface mold and citrus decay (rottenoranges). Batch unfit for consumption.",
      suspiciousQualityFlag: true,
      reasons: [
        "Visual classifier detected rot pattern: rottenoranges (96% confidence)",
        "Microbial breakdown detected by gas sensor readings",
        "Isolated in quarantine container"
      ]
    },

    latestSensors: {
      temperature: 33.5,
      humidity: 62.5,
      mq135: 125,
      voc: 125,
      co2: 425,
      ethylene: 0.18,
      weight: 250.0,
      storageCondition: "Suboptimal"
    },

    traceability: {
      lotId: "LOT-ORG-06",
      packedDate: "2026-07-04",
      lastScanTime: "2026-07-08T13:45:00",
      shipmentId: "SHIP-ORG-306",
      node: "Quarantine Vault 3"
    }
  }
];

export const getBatchById = (batchId) =>
  mockBatches.find((batch) => batch.batchId === batchId);

export const updateLotPassport = (batchId, scanData) => {
  const batch = mockBatches.find((b) => b.batchId === batchId);
  if (!batch) return null;

  if (scanData.latestAssessment) {
    batch.latestAssessment = {
      ...batch.latestAssessment,
      ...scanData.latestAssessment
    };
  }

  if (scanData.latestSensors) {
    batch.latestSensors = {
      ...batch.latestSensors,
      ...scanData.latestSensors
    };
  }

  if (scanData.lastCapture) {
    batch.lastCapture = scanData.lastCapture;
  }

  batch.lastUpdated = new Date().toISOString();
  if (batch.traceability) {
    batch.traceability.lastScanTime = batch.lastUpdated;
  }

  return batch;
};