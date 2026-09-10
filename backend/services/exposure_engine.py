from datetime import datetime


def calculate_exposure_metrics(records, temp_optimal=(10.0, 25.0), hum_optimal=(45.0, 75.0), gas_threshold=250.0):
    """
    Computes cumulative environmental exposure and excursion statistics.
    Assumes records are sorted chronologically.
    """
    if not records or len(records) == 0:
        return {
            "temperatureExposure": {
                "aboveThresholdMinutes": 0,
                "belowThresholdMinutes": 0,
                "timeInOptimalRangeMinutes": 0,
                "excursionCount": 0,
                "maxDeviationC": 0.0,
                "cumulativeDeviationDegreeHours": 0.0
            },
            "humidityExposure": {
                "highHumidityMinutes": 0,
                "lowHumidityMinutes": 0,
                "timeInOptimalRangeMinutes": 0,
                "excursionCount": 0,
                "maxDeviationPct": 0.0
            },
            "gasExposure": {
                "highGasMinutes": 0,
                "peakGasPpm": 0.0,
                "averageGasPpm": 0.0,
                "excursionCount": 0,
                "recoveryMinutes": 0
            }
        }

    # Temperature tracking variables
    temp_above_min = 0.0
    temp_below_min = 0.0
    temp_opt_min = 0.0
    temp_excursions = 0
    in_temp_excursion = False
    max_temp_dev = 0.0
    cum_temp_dev_deg_hrs = 0.0

    # Humidity tracking variables
    hum_high_min = 0.0
    hum_low_min = 0.0
    hum_opt_min = 0.0
    hum_excursions = 0
    in_hum_excursion = False
    max_hum_dev = 0.0

    # Gas tracking variables
    gas_high_min = 0.0
    peak_gas = 0.0
    gas_sum = 0.0
    gas_count = 0
    gas_excursions = 0
    in_gas_excursion = False
    recovery_start_time = None
    recovery_minutes = 0.0

    # Estimate time delta between consecutive samples (default 1 minute per reading)
    for i in range(len(records)):
        curr = records[i]
        delta_minutes = 1.0

        if i > 0 and curr.get("timestamp") and records[i-1].get("timestamp"):
            try:
                t_curr = datetime.fromisoformat(curr["timestamp"].replace("Z", "+00:00"))
                t_prev = datetime.fromisoformat(records[i-1]["timestamp"].replace("Z", "+00:00"))
                diff_sec = abs((t_curr - t_prev).total_seconds())
                if 0 < diff_sec <= 3600:
                    delta_minutes = diff_sec / 60.0
            except Exception:
                delta_minutes = 1.0

        # 1. Temperature Processing
        t = curr.get("temperatureC")
        if t is not None:
            t = float(t)
            if t > temp_optimal[1]:
                temp_above_min += delta_minutes
                dev = t - temp_optimal[1]
                max_temp_dev = max(max_temp_dev, dev)
                cum_temp_dev_deg_hrs += (dev * (delta_minutes / 60.0))
                if not in_temp_excursion:
                    in_temp_excursion = True
                    temp_excursions += 1
            elif t < temp_optimal[0]:
                temp_below_min += delta_minutes
                dev = temp_optimal[0] - t
                max_temp_dev = max(max_temp_dev, dev)
                cum_temp_dev_deg_hrs += (dev * (delta_minutes / 60.0))
                if not in_temp_excursion:
                    in_temp_excursion = True
                    temp_excursions += 1
            else:
                temp_opt_min += delta_minutes
                in_temp_excursion = False

        # 2. Humidity Processing
        h = curr.get("humidityPct")
        if h is not None:
            h = float(h)
            if h > hum_optimal[1]:
                hum_high_min += delta_minutes
                dev = h - hum_optimal[1]
                max_hum_dev = max(max_hum_dev, dev)
                if not in_hum_excursion:
                    in_hum_excursion = True
                    hum_excursions += 1
            elif h < hum_optimal[0]:
                hum_low_min += delta_minutes
                dev = hum_optimal[0] - h
                max_hum_dev = max(max_hum_dev, dev)
                if not in_hum_excursion:
                    in_hum_excursion = True
                    hum_excursions += 1
            else:
                hum_opt_min += delta_minutes
                in_hum_excursion = False

        # 3. Gas Processing
        g = curr.get("gasPpm") or curr.get("vocIndex")
        if g is not None:
            g = float(g)
            peak_gas = max(peak_gas, g)
            gas_sum += g
            gas_count += 1

            if g > gas_threshold:
                gas_high_min += delta_minutes
                if not in_gas_excursion:
                    in_gas_excursion = True
                    gas_excursions += 1
            else:
                if in_gas_excursion:
                    in_gas_excursion = False
                    recovery_minutes += delta_minutes

    avg_gas = round(gas_sum / gas_count, 2) if gas_count > 0 else 0.0

    return {
        "temperatureExposure": {
            "aboveThresholdMinutes": round(temp_above_min, 1),
            "belowThresholdMinutes": round(temp_below_min, 1),
            "timeInOptimalRangeMinutes": round(temp_opt_min, 1),
            "excursionCount": temp_excursions,
            "maxDeviationC": round(max_temp_dev, 2),
            "cumulativeDeviationDegreeHours": round(cum_temp_dev_deg_hrs, 2)
        },
        "humidityExposure": {
            "highHumidityMinutes": round(hum_high_min, 1),
            "lowHumidityMinutes": round(hum_low_min, 1),
            "timeInOptimalRangeMinutes": round(hum_opt_min, 1),
            "excursionCount": hum_excursions,
            "maxDeviationPct": round(max_hum_dev, 2)
        },
        "gasExposure": {
            "highGasMinutes": round(gas_high_min, 1),
            "peakGasPpm": round(peak_gas, 2),
            "averageGasPpm": avg_gas,
            "excursionCount": gas_excursions,
            "recoveryMinutes": round(recovery_minutes, 1)
        }
    }
