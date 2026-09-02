export function calculateHealthMetrics(sensorData) {

let healthScore = 100;

// Temperature Penalty
if (sensorData.temperature > 8)
healthScore -=
(sensorData.temperature - 8) * 2;

// Humidity Penalty
if (sensorData.humidity < 80)
healthScore -= 10;

// Ethylene Penalty
if (sensorData.ethylene > 1)
healthScore -= 25;
else if (sensorData.ethylene > 0.5)
healthScore -= 15;
else if (sensorData.ethylene > 0.1)
healthScore -= 5;

// VOC Penalty
if (sensorData.voc > 250)
healthScore -= 20;
else if (sensorData.voc > 150)
healthScore -= 10;

// Clamp between 0 and 100
healthScore = Math.max(
0,
Math.min(100, healthScore)
);

const shelfLife = Number(
(healthScore / 10).toFixed(1)
);

const spoilageRisk = Number(
(100 - healthScore).toFixed(2)
);

let riskLevel = "EXCELLENT";

if (healthScore < 60)
riskLevel = "CRITICAL";
else if (healthScore < 75)
riskLevel = "WARNING";
else if (healthScore < 90)
riskLevel = "GOOD";

return {
healthScore: Number(
healthScore.toFixed(2)
),


shelfLife,

spoilageRisk,

riskLevel,


};
}
