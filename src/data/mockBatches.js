export const mockBatches = [
  {
    batchId: "TF-APL-2026-001",
    fruitType: "apple",
    displayName: "Premium Apple",
    source: "Demo Farm A",
    location: "Chennai Warehouse",
    createdAt: "2026-07-08T08:00:00",
    lastUpdated: "2026-07-08T11:42:00",

    latestAssessment: {
      visualClass: "freshapple",
      confidence: 0.94,
      freshnessScore: 94,
      shelfLifeDays: 9.4,
      spoilageRisk: 6,
      riskLevel: "GOOD",
      status: "VERIFIED FRESH",
      qualityAdvisory:
        "No suspicious quality pattern detected. Fruit appears visually healthy and storage conditions are within acceptable range.",
      suspiciousQualityFlag: false,
      reasons: [
        "Visual quality is strong and consistent with a fresh apple profile",
        "Temperature remains within acceptable storage range",
        "Humidity is stable and does not indicate accelerated spoilage",
        "No elevated spoilage signal detected from the current gas reading"
      ]
    },

    latestSensors: {
      temperature: 24.6,
      humidity: 61,
      mq135: 188,
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
    displayName: "Export Banana Batch",
    source: "Demo Farm B",
    location: "Coimbatore Transit Hub",
    createdAt: "2026-07-08T09:10:00",
    lastUpdated: "2026-07-08T12:20:00",

    latestAssessment: {
      visualClass: "freshbanana",
      confidence: 0.86,
      freshnessScore: 74,
      shelfLifeDays: 3.2,
      spoilageRisk: 28,
      riskLevel: "MONITOR",
      status: "MONITOR",
      qualityAdvisory:
        "Possible accelerated ripening or storage stress detected. Visual condition is acceptable, but environmental conditions suggest increased deterioration risk. Manual inspection is recommended within the next 24 hours.",
      suspiciousQualityFlag: true,
      reasons: [
        "Humidity is above the ideal storage range for this banana batch",
        "Gas reading is moderately elevated compared to the normal baseline",
        "Banana batch is in a sensitive ripening stage and may deteriorate faster",
        "Shelf life may reduce under the current storage environment"
      ]
    },

    latestSensors: {
      temperature: 30.8,
      humidity: 78,
      mq135: 412,
      storageCondition: "Suboptimal"
    },

    traceability: {
      lotId: "LOT-BAN-07",
      packedDate: "2026-07-07",
      lastScanTime: "2026-07-08T12:20:00",
      shipmentId: "SHIP-BAN-203",
      node: "Coimbatore Transit Hub"
    }
  },

  {
    batchId: "TF-ORG-2026-003",
    fruitType: "orange",
    displayName: "Premium Orange Batch",
    source: "Demo Farm C",
    location: "Bengaluru Distribution Center",
    createdAt: "2026-07-08T07:40:00",
    lastUpdated: "2026-07-08T10:55:00",

    latestAssessment: {
      visualClass: "freshorange",
      confidence: 0.91,
      freshnessScore: 88,
      shelfLifeDays: 6.1,
      spoilageRisk: 12,
      riskLevel: "GOOD",
      status: "VERIFIED FRESH",
      qualityAdvisory:
        "No major quality concerns detected. Visual condition, freshness indicators, and storage readings remain within acceptable limits.",
      suspiciousQualityFlag: false,
      reasons: [
        "Surface quality appears healthy and consistent with fresh oranges",
        "Temperature is within the acceptable storage band",
        "Current spoilage indicators remain low",
        "No significant mismatch observed between visual and sensor conditions"
      ]
    },

    latestSensors: {
      temperature: 25.9,
      humidity: 65,
      mq135: 210,
      storageCondition: "Good"
    },

    traceability: {
      lotId: "LOT-ORG-03",
      packedDate: "2026-07-07",
      lastScanTime: "2026-07-08T10:55:00",
      shipmentId: "SHIP-ORG-144",
      node: "Bengaluru Distribution Center"
    }
  }
];

export const getBatchById = (batchId) =>
  mockBatches.find((batch) => batch.batchId === batchId);