export function calculateHealthMetrics(sensorData) {
  let healthScore = 100;
  const reasons = [];
  const thresholdExcursions = [];

  const temp = sensorData.temperature != null ? Number(sensorData.temperature) : null;
  const hum = sensorData.humidity != null ? Number(sensorData.humidity) : null;
  const voc = sensorData.voc != null ? Number(sensorData.voc) : null;
  const eth = sensorData.ethylene != null ? Number(sensorData.ethylene) : null;
  const co2 = sensorData.co2 != null ? Number(sensorData.co2) : null;

  // Temperature Evaluation (Ideal: 2 - 8°C for cold chain; >25°C triggers ambient risk)
  if (temp !== null) {
    if (temp > 25.0) {
      healthScore -= (temp - 8) * 2.2;
      thresholdExcursions.push(`Thermal Excursion (${temp.toFixed(1)}°C exceeds ambient limit)`);
      reasons.push(`Temperature ${temp.toFixed(1)}°C exceeds cold chain threshold (2-8°C), accelerating respiration rate.`);
    } else if (temp > 8.0) {
      healthScore -= (temp - 8) * 1.5;
      reasons.push(`Temperature ${temp.toFixed(1)}°C is above optimal storage zone (2-8°C).`);
    } else {
      reasons.push(`Temperature ${temp.toFixed(1)}°C is within optimal cold chain limits.`);
    }
  }

  // Humidity Evaluation (Optimal: 80 - 90%)
  if (hum !== null) {
    if (hum < 60) {
      healthScore -= 12;
      thresholdExcursions.push(`Low Humidity (${hum.toFixed(1)}% desiccation risk)`);
      reasons.push(`Low humidity (${hum.toFixed(1)}%) risks produce moisture loss and surface shrinking.`);
    } else if (hum < 80) {
      healthScore -= 6;
    } else {
      reasons.push(`Relative humidity (${hum.toFixed(1)}%) provides ideal moisture balance.`);
    }
  }

  // Ethylene Gas Evaluation
  if (eth !== null) {
    if (eth > 0.4) {
      healthScore -= 25;
      thresholdExcursions.push(`High Ethylene Gas (${eth.toFixed(2)} ppm)`);
      reasons.push(`Ethylene concentration (${eth.toFixed(2)} ppm) indicates rapid fruit ripening & senescence.`);
    } else if (eth > 0.2) {
      healthScore -= 10;
      reasons.push(`Ethylene level (${eth.toFixed(2)} ppm) is moderately elevated.`);
    } else {
      reasons.push(`Ethylene level (${eth.toFixed(2)} ppm) is normal.`);
    }
  }

  // VOC Gas Evaluation
  if (voc !== null) {
    if (voc > 200) {
      healthScore -= 22;
      thresholdExcursions.push(`Elevated VOCs (${voc} ppm decay off-gassing)`);
      reasons.push(`VOC sensor detected ${voc} ppm organic compounds, signaling microbial activity or early spoilage.`);
    } else if (voc > 150) {
      healthScore -= 10;
      reasons.push(`VOC level ${voc} ppm shows slight volatile organic activity.`);
    }
  }

  // CO2 Evaluation
  if (co2 !== null && co2 > 500) {
    healthScore -= 8;
    reasons.push(`CO₂ level (${co2} ppm) indicates elevated container respiration.`);
  }

  // Clamp between 0 and 100
  healthScore = Math.max(0, Math.min(100, healthScore));

  const shelfLife = Number((healthScore / 10).toFixed(1));
  const spoilageRisk = Number((100 - healthScore).toFixed(2));

  let riskLevel = "EXCELLENT";
  if (healthScore < 50) riskLevel = "CRITICAL";
  else if (healthScore < 70) riskLevel = "WARNING";
  else if (healthScore < 88) riskLevel = "GOOD";

  return {
    healthScore: Number(healthScore.toFixed(2)),
    shelfLife,
    spoilageRisk,
    riskLevel,
    reasons,
    thresholdExcursions,
  };
}

