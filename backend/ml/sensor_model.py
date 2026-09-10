from ml.sensor_features import extract_sensor_features


class SensorEnvironmentModel:
    """
    ML Prototype Environmental Assessment Model.
    
    IMPORTANT: This is a decision-support prototype baseline model.
    It combines statistical rolling bounds, cumulative exposure metrics,
    and rule-based risk inference. It is clearly labeled:
    
    "type": "prototype", "validated": False
    """
    def __init__(self):
        self.metadata = {
            "modelName": "sensor-environment-model",
            "version": "0.1.0",
            "type": "prototype",
            "validated": False,
            "trainedAt": None,
            "inputFeatures": [
                "temperatureC", "humidityPct", "gasPpm", "co2Ppm",
                "rollingMeanTemp", "rollingStdTemp", "tempRateOfChange",
                "tempAboveThresholdMinutes", "qualityScore", "sensorConfidence"
            ]
        }

    def predict(self, normalized_record, baselines=None, exposure=None, quality_report=None):
        features = extract_sensor_features(normalized_record, baselines, exposure, quality_report)
        f_dict = features.get("dict", {})

        risk_score = 0
        contributing_factors = []

        temp = f_dict.get("temperatureC", 20.0)
        hum = f_dict.get("humidityPct", 65.0)
        gas = f_dict.get("gasPpm", 150.0)
        t_rate = f_dict.get("tempRateOfChange", 0.0)
        t_exp = f_dict.get("tempAboveThresholdMinutes", 0.0)
        quality = f_dict.get("qualityScore", 100)

        # 1. Thermal Stress
        if temp > 25.0:
            dev = temp - 25.0
            r = min(35, int(dev * 6.0))
            risk_score += r
            contributing_factors.append(f"Elevated temperature: {temp}°C (+{r} risk)")

        if t_rate > 2.0:
            risk_score += 15
            contributing_factors.append(f"Rapid temperature rise (+{t_rate:.1f}°C/hr)")

        if t_exp > 30.0:
            risk_score += 20
            contributing_factors.append(f"Prolonged high temperature exposure ({t_exp:.0f} min)")

        # 2. Humidity Stress
        if hum > 75.0:
            dev = hum - 75.0
            r = min(25, int(dev * 2.0))
            risk_score += r
            contributing_factors.append(f"Elevated humidity: {hum}% (+{r} risk)")

        # 3. Gas / Spoilage Stress
        if gas > 250.0:
            dev = gas - 250.0
            r = min(30, int(dev * 0.1))
            risk_score += r
            contributing_factors.append(f"Elevated spoilage gas signal: {gas} ppm (+{r} risk)")

        # 4. Quality Factor
        if quality < 80:
            risk_score += 10
            contributing_factors.append(f"Sensor signal quality degraded ({quality}%)")

        risk_score = max(0, min(100, risk_score))

        # Trend Determination
        if t_rate > 3.0:
            trend = "CRITICAL_SPIKE"
        elif t_rate > 1.0:
            trend = "RISING"
        elif t_rate < -1.0:
            trend = "FALLING"
        else:
            trend = "STABLE"

        confidence = round((quality / 100.0) * 0.95, 2)

        return {
            "environmentRisk": risk_score,
            "trend": trend,
            "confidence": confidence,
            "contributingFactors": contributing_factors if contributing_factors else ["Optimal environmental conditions"],
            "modelMetadata": self.metadata
        }
