def extract_sensor_features(normalized_record, baselines=None, exposure=None, quality_report=None):
    """
    Extracts an ML-ready feature dictionary and vector representation from sensor telemetry.
    """
    if not normalized_record:
        return {}

    baselines = baselines or {}
    exposure = exposure or {}
    quality_report = quality_report or {}

    temp = float(normalized_record.get("temperatureC") or 20.0)
    hum = float(normalized_record.get("humidityPct") or 65.0)
    gas = float(normalized_record.get("gasPpm") or normalized_record.get("vocIndex") or 150.0)
    co2 = float(normalized_record.get("co2Ppm") or 0.0)

    temp_base = baselines.get("temperature", {})
    hum_base = baselines.get("humidity", {})
    gas_base = baselines.get("gas", {})
    rates = baselines.get("ratesOfChange", {})

    temp_exp = exposure.get("temperatureExposure", {})
    hum_exp = exposure.get("humidityExposure", {})
    gas_exp = exposure.get("gasExposure", {})

    feature_dict = {
        "temperatureC": temp,
        "humidityPct": hum,
        "gasPpm": gas,
        "co2Ppm": co2,
        "rollingMeanTemp": temp_base.get("mean", temp),
        "rollingStdTemp": temp_base.get("stdDev", 0.0),
        "tempRateOfChange": rates.get("temperaturePerHour", 0.0),
        "humidityRateOfChange": rates.get("humidityPerHour", 0.0),
        "gasRateOfChange": rates.get("gasPerHour", 0.0),
        "tempAboveThresholdMinutes": temp_exp.get("aboveThresholdMinutes", 0.0),
        "humidityHighMinutes": hum_exp.get("highHumidityMinutes", 0.0),
        "gasHighMinutes": gas_exp.get("highGasMinutes", 0.0),
        "tempExcursionCount": temp_exp.get("excursionCount", 0),
        "qualityScore": quality_report.get("qualityScore", 100),
        "sensorConfidence": quality_report.get("confidence", 1.0)
    }

    feature_vector = [
        feature_dict["temperatureC"],
        feature_dict["humidityPct"],
        feature_dict["gasPpm"],
        feature_dict["co2Ppm"],
        feature_dict["rollingMeanTemp"],
        feature_dict["rollingStdTemp"],
        feature_dict["tempRateOfChange"],
        feature_dict["tempAboveThresholdMinutes"],
        feature_dict["qualityScore"],
        feature_dict["sensorConfidence"]
    ]

    return {
        "dict": feature_dict,
        "vector": feature_vector,
        "featureNames": [
            "temperatureC", "humidityPct", "gasPpm", "co2Ppm",
            "rollingMeanTemp", "rollingStdTemp", "tempRateOfChange",
            "tempAboveThresholdMinutes", "qualityScore", "sensorConfidence"
        ]
    }
