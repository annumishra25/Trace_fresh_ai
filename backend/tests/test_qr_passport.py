import os
import sys
import unittest

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.qr_service import (
    create_qr_identity,
    verify_qr_token,
    deactivate_qr_token,
    get_qr_by_batch,
    generate_public_token
)
from services.passport_service import (
    generate_digital_product_passport,
    calculate_passport_hash,
    get_passport_by_id
)
from services.public_passport_service import (
    get_public_consumer_passport,
    get_public_demo_scenario
)


class TestQRPassportService(unittest.TestCase):

    def test_generate_public_token(self):
        t1 = generate_public_token()
        t2 = generate_public_token()
        self.assertTrue(t1.startswith("TR-VER-"))
        self.assertTrue(t2.startswith("TR-VER-"))
        self.assertNotEqual(t1, t2)

    def test_qr_creation_and_uniqueness(self):
        b1 = "TF-TEST-BATCH-001"
        b2 = "TF-TEST-BATCH-002"

        qr1 = create_qr_identity(b1)
        qr2 = create_qr_identity(b2)

        self.assertIsNotNone(qr1)
        self.assertIsNotNone(qr2)
        self.assertEqual(qr1["batchId"], b1)
        self.assertEqual(qr2["batchId"], b2)
        self.assertNotEqual(qr1["qrId"], qr2["qrId"])
        self.assertNotEqual(qr1["publicToken"], qr2["publicToken"])
        self.assertEqual(qr1["status"], "ACTIVE")

    def test_qr_lifecycle_transitions(self):
        b_id = "TF-TEST-LIFECYCLE-001"
        qr = create_qr_identity(b_id)
        pub_token = qr["publicToken"]

        # Initial Active Check
        res_active = verify_qr_token(pub_token)
        self.assertTrue(res_active["valid"])
        self.assertEqual(res_active["status"], "ACTIVE")

        # Reissue New QR -> active QR becomes REPLACED
        new_qr = create_qr_identity(b_id, force_new=True)
        self.assertEqual(new_qr["status"], "ACTIVE")
        self.assertNotEqual(new_qr["publicToken"], pub_token)

        # Verify old token status is REPLACED
        res_old = verify_qr_token(pub_token)
        self.assertFalse(res_old["valid"])
        self.assertEqual(res_old["status"], "REPLACED")

        # Revoke the new active QR
        deactivated = deactivate_qr_token(new_qr["qrId"], reason="Test Revocation")
        self.assertIsNotNone(deactivated)
        self.assertEqual(deactivated["status"], "REVOKED")

        # Re-verify revoked token
        res_revoked = verify_qr_token(new_qr["publicToken"])
        self.assertFalse(res_revoked["valid"])
        self.assertEqual(res_revoked["status"], "REVOKED")

    def test_passport_generation_and_integrity_hash(self):
        batch_id = "TF-APL-2026-001"
        passport = generate_digital_product_passport(batch_id=batch_id)

        self.assertIsNotNone(passport)
        self.assertIn("passportId", passport)
        self.assertEqual(passport["passportVersion"], "1.0")
        self.assertIn("passportHash", passport)
        self.assertTrue(passport["passportHash"].startswith("sha256:"))

        # Calculate hash on current passport
        calculated_hash = calculate_passport_hash(passport)
        self.assertEqual(passport["passportHash"], calculated_hash)

    def test_public_passport_sanitization(self):
        batch_id = "TF-APL-2026-001"
        qr = create_qr_identity(batch_id)
        pub_passport = get_public_consumer_passport(qr["publicToken"])

        self.assertTrue(pub_passport["verified"])
        self.assertEqual(pub_passport["verificationStatus"], "VERIFIED")

        # Ensure no internal node IDs or raw decision traces are exposed
        json_str = str(pub_passport)
        self.assertNotIn("TF-NODE-01", json_str)
        self.assertNotIn("decisionTrace", json_str)
        self.assertNotIn("api_secret", json_str)
        self.assertNotIn("db_password", json_str)

    def test_batch_isolation(self):
        qr_a = create_qr_identity("BATCH-AAA-111")
        qr_b = create_qr_identity("BATCH-BBB-222")

        pass_a = get_public_consumer_passport(qr_a["publicToken"])
        pass_b = get_public_consumer_passport(qr_b["publicToken"])

        self.assertEqual(pass_a["product"]["batchCode"], "BATCH-AAA-111")
        self.assertEqual(pass_b["product"]["batchCode"], "BATCH-BBB-222")
        self.assertNotEqual(pass_a["product"]["batchCode"], pass_b["product"]["batchCode"])

    def test_public_demo_scenarios(self):
        scenarios = [
            "VERIFIED_GOOD",
            "VERIFIED_MONITOR",
            "VERIFIED_ATTENTION",
            "IN_TRANSIT",
            "COMPLETED",
            "REVOKED_QR",
            "INVALID_QR",
            "INSUFFICIENT_DATA"
        ]

        for sc in scenarios:
            res = get_public_demo_scenario(sc)
            self.assertIsNotNone(res)
            if sc in ["REVOKED_QR", "INVALID_QR"]:
                self.assertFalse(res["verified"])
            else:
                self.assertTrue(res["verified"])


if __name__ == "__main__":
    unittest.main()
