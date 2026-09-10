import os
import sys
import unittest

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.fusion_engine import (
  calculate_fusion_confidence,
  calculate_component_risks,
  calculate_cross_signal_interactions,
  resolve_signal_conflicts,
  estimate_shelf_life,
  evaluate_multi_modal_fusion,
  run_fusion_demo,
  get_passport_summary
)
from services.fusion_explainability import generate_fusion_explanation


class TestFusionEngine(unittest.TestCase):

  def test_calculate_fusion_confidence(self):
    # Case 1: Ideal inputs
    conf = calculate_fusion_confidence(
      image_quality_score=95.0,
      image_status='GOOD',
      gps_age_seconds=10.0,
      sensor_freshness_seconds=5.0,
    )
    self.assertGreaterEqual(conf['overallConfidence'], 0.90)
    self.assertEqual(conf['rating'], 'HIGH')
    self.assertEqual(len(conf['appliedPenalties']), 0)

    # Case 2: Blurry image penalty
    conf_blur = calculate_fusion_confidence(
      image_quality_score=40.0,
      image_status='BLURRY',
      gps_age_seconds=10.0,
      sensor_freshness_seconds=5.0,
    )
    self.assertLess(conf_blur['overallConfidence'], conf['overallConfidence'])
    self.assertTrue(
      any(
        pen['reason'] == 'BLURRY_OR_POOR_IMAGE'
        for pen in conf_blur['appliedPenalties']
      )
    )

    # Case 3: Stale GPS penalty
    conf_stale = calculate_fusion_confidence(
      image_quality_score=95.0,
      image_status='GOOD',
      gps_age_seconds=7200.0,  # 2 hours old
      sensor_freshness_seconds=5.0,
    )
    self.assertLess(conf_stale['overallConfidence'], conf['overallConfidence'])
    self.assertTrue(
      any('GPS_STALE' in pen['reason'] for pen in conf_stale['appliedPenalties'])
    )

  def test_calculate_component_risks(self):
    comp = calculate_component_risks(
      sensor_risk_score=20.0,
      route_risk_score=40.0,
      visual_risk_score=60.0,
      confidence_data={
        'sensorConfidence': 0.9,
        'routeConfidence': 0.8,
        'visualConfidence': 0.7,
      },
    )
    # Expected weighted = 20*0.40 + 40*0.25 + 60*0.35 = 8 + 10 + 21 = 39.0
    self.assertEqual(comp['sensorRisk']['score'], 20.0)
    self.assertEqual(comp['routeRisk']['score'], 40.0)
    self.assertEqual(comp['visualRisk']['score'], 60.0)
    self.assertAlmostEqual(comp['baseWeightedRisk'], 39.0, places=1)

  def test_calculate_cross_signal_interactions(self):
    # Rule 1: Temp excursion + Route delay
    inter = calculate_cross_signal_interactions(
      sensor_risk=50.0, route_risk=45.0, visual_risk=10.0
    )
    self.assertGreaterEqual(inter['combinedMultiplier'], 1.30)
    self.assertTrue(
      any(
        rule['rule'] == 'TEMP_EXCURSION_AND_ROUTE_DELAY'
        for rule in inter['activeRules']
      )
    )

    # Rule 2: High humidity + Mold risk
    inter2 = calculate_cross_signal_interactions(
      sensor_risk=30.0, route_risk=10.0, visual_risk=55.0
    )
    self.assertGreaterEqual(inter2['combinedMultiplier'], 1.35)
    self.assertTrue(
      any(
        rule['rule'] == 'HUMIDITY_AND_MOLD_RISK'
        for rule in inter2['activeRules']
      )
    )

  def test_resolve_signal_conflicts(self):
    # Conflict: Low sensor risk (10) but High visual risk (60)
    res = resolve_signal_conflicts(
      sensor_risk=10.0, route_risk=10.0, visual_risk=60.0, base_status='NORMAL'
    )
    self.assertTrue(res['conflictDetected'])
    self.assertEqual(res['conflictType'], 'NORMAL_SENSORS_VS_VISUAL_ANOMALY')
    self.assertEqual(res['recommendedStatus'], 'SIGNAL_CONFLICT')

  def test_estimate_shelf_life(self):
    # Low risk (10) => max shelf life ~ 6.3 days
    sl_good = estimate_shelf_life(
      overall_risk_score=10.0, produce_type='APPLES'
    )
    self.assertGreaterEqual(sl_good['remainingDays'], 5.0)

    # High risk (80) => depleted shelf life ~ 1.4 days
    sl_poor = estimate_shelf_life(
      overall_risk_score=80.0, produce_type='APPLES'
    )
    self.assertLess(sl_poor['remainingDays'], 2.5)

  def test_generate_fusion_explanation(self):
    component_risks = {
      'sensorRisk': {'score': 65.0, 'rating': 'HIGH'},
      'routeRisk': {'score': 50.0, 'rating': 'MODERATE'},
      'visualRisk': {'score': 20.0, 'rating': 'LOW'},
    }
    interactions = {
      'activeRules': [
        {'rule': 'TEMP_EXCURSION_AND_ROUTE_DELAY', 'multiplier': 1.35}
      ]
    }
    conf = {'overallConfidence': 0.85, 'rating': 'HIGH'}
    conflict = {'conflictDetected': False}

    exp = generate_fusion_explanation(
      status='WARNING_DISPATCH',
      overall_risk=62.0,
      component_risks=component_risks,
      interactions=interactions,
      confidence_data=conf,
      conflict_data=conflict,
      produce_type='APPLES',
    )
    self.assertIn('summaryText', exp)
    self.assertIn('actionableDriver', exp)
    self.assertIn('recommendation', exp)
    self.assertGreater(len(exp['evidenceStatements']), 0)

  def test_evaluate_multi_modal_fusion(self):
    res = evaluate_multi_modal_fusion(
      batch_id='TF-APL-2026-001', node_id='TF-NODE-01'
    )
    self.assertIn('fusionStatus', res)
    self.assertIn('overallRiskScore', res)
    self.assertIn('freshnessIndex', res)
    self.assertIn('confidence', res)
    self.assertIn('componentRisks', res)
    self.assertIn('explanation', res)
    self.assertIn('estimatedShelfLife', res)

  def test_fusion_demo_scenarios(self):
    scenarios = [
      'ALL_GREEN',
      'TEMP_EXCURSION',
      'HIGH_HUMIDITY_MOLD',
      'SIGNAL_CONFLICT_MOLD',
      'BLURRY_IMAGE_LOW_CONF',
      'STALE_GPS_SEVERITY',
      'CRITICAL_MULTI_EXCURSION',
    ]

    for sc in scenarios:
      res = run_fusion_demo(sc, batch_id='TF-APL-2026-001', node_id='TF-NODE-01')
      self.assertIsNotNone(res, f'Demo scenario {sc} returned None')
      self.assertIn('fusionStatus', res)
      self.assertEqual(res['demoScenario'], sc)

      if sc == 'ALL_GREEN':
        self.assertEqual(res['fusionStatus'], 'NORMAL')
        self.assertGreaterEqual(res['freshnessIndex']['score'], 80)
      elif sc == 'SIGNAL_CONFLICT_MOLD':
        self.assertEqual(res['fusionStatus'], 'SIGNAL_CONFLICT')
      elif sc == 'CRITICAL_MULTI_EXCURSION':
        self.assertEqual(res['fusionStatus'], 'CRITICAL_ACTION_REQUIRED')
        self.assertLessEqual(res['freshnessIndex']['score'], 40)

  def test_get_passport_summary(self):
    passport = get_passport_summary(batch_id='TF-APL-2026-001')
    self.assertIn('passportId', passport)
    self.assertIn('batchId', passport)
    self.assertIn('freshnessIndex', passport)
    self.assertIn('freshnessRating', passport)
    self.assertIn('conditionStatus', passport)
    self.assertIn('summaryStatement', passport)


if __name__ == '__main__':
  unittest.main()
