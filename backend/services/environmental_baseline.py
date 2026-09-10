import numpy as np
from datetime import datetime, timezone


def calculate_series_stats(series):
    """Calculate mean, median, min, max, std dev for a numeric array."""
    clean_series = [float(x) for x in series if x is not None]
    if not clean_series:
        return {
            "mean": None,
            "median": None,
            "min": None,
            "max": None,
            "stdDev": None,
            "count": 0
        }

    arr = np.array(clean_series)
    return {
        "mean": round(float(np.mean(arr)), 2),
        "median": round(float(np.median(arr)), 2),
        "min": round(float(np.min(arr)), 2),
        "max": round(float(np.max(arr)), 2),
        "stdDev": round(float(np.std(arr)), 2),
        "count": len(clean_series)
    }


def calculate_rate_of_change(records, metric_key):
    """
    Calculate hourly rate of change for a metric across recent records.
    Returns value in units per hour.
    """
    valid_records = [
        r for r in records
        if r.get(metric_key) is not None and r.get("timestamp")
    ]
    if len(valid_records) < 2:
        return 0.0

    try:
        t_first = datetime.fromisoformat(valid_records[0]["timestamp"].replace("Z", "+00:00"))
        t_last = datetime.fromisoformat(valid_records[-1]["timestamp"].replace("Z", "+00:00"))
        hours = (t_last - t_first).total_seconds() / 3600.0
        
        if hours <= 0:
            return 0.0

        val_first = float(valid_records[0][metric_key])
        val_last = float(valid_records[-1][metric_key])
        
        rate = (val_last - val_first) / hours
        return round(rate, 2)
    except Exception:
        return 0.0


class EnvironmentalBaselineEngine:
    def compute_baseline(self, records):
        """
        Compute rolling baselines across all environmental metrics for a node/shipment.
        """
        if not records:
            return {
                "temperature": calculate_series_stats([]),
                "humidity": calculate_series_stats([]),
                "gas": calculate_series_stats([]),
                "co2": calculate_series_stats([]),
                "ratesOfChange": {"temperature": 0.0, "humidity": 0.0, "gas": 0.0}
            }

        temp_series = [r.get("temperatureC") for r in records]
        hum_series = [r.get("humidityPct") for r in records]
        gas_series = [r.get("gasPpm") or r.get("vocIndex") for r in records]
        co2_series = [r.get("co2Ppm") for r in records]

        return {
            "temperature": calculate_series_stats(temp_series),
            "humidity": calculate_series_stats(hum_series),
            "gas": calculate_series_stats(gas_series),
            "co2": calculate_series_stats(co2_series),
            "ratesOfChange": {
                "temperaturePerHour": calculate_rate_of_change(records, "temperatureC"),
                "humidityPerHour": calculate_rate_of_change(records, "humidityPct"),
                "gasPerHour": calculate_rate_of_change(records, "gasPpm")
            }
        }
