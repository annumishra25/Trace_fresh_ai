export function detectAnomalies(sensorData) {

  const alerts = [];

  // Temperature

  if (sensorData.temperature > 30) {
    alerts.push({
      severity: "HIGH",
      message:
        "High temperature detected. Spoilage risk increasing."
    });
  }

  // Humidity

  if (sensorData.humidity < 55) {
    alerts.push({
      severity: "MEDIUM",
      message:
        "Humidity below recommended storage range."
    });
  }

  // VOC

  if (sensorData.voc > 250) {
    alerts.push({
      severity: "HIGH",
      message:
        "VOC spike detected. Possible spoilage event."
    });
  }

  // CO₂

  if (sensorData.co2 > 700) {
    alerts.push({
      severity: "MEDIUM",
      message:
        "Elevated CO₂ concentration detected."
    });
  }

  // Ethylene

  if (sensorData.ethylene > 0.8) {
    alerts.push({
      severity: "HIGH",
      message:
        "Ethylene level critical. Accelerated ripening expected."
    });
  }

  // Weight Loss

  if (sensorData.weight < 220) {
    alerts.push({
      severity: "MEDIUM",
      message:
        "Abnormal weight reduction detected."
    });
  }

  return alerts;
}