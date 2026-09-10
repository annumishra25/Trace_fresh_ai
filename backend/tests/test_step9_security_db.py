import os
import sys
import unittest

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config import Config
from database.db import init_db, get_db_session
from database.models import UserModel, BatchModel, DeviceNodeModel, QRIdentityModel
from services.auth_service import (
    hash_password,
    verify_password,
    generate_jwt_token,
    decode_jwt_token,
    authenticate_user,
    seed_default_users
)


class TestStep9SecurityDB(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        seed_default_users()

    def test_config_defaults(self):
        self.assertIsNotNone(Config.SECRET_KEY)
        self.assertIsNotNone(Config.JWT_SECRET_KEY)
        self.assertTrue(Config.SQLALCHEMY_DATABASE_URI.startswith("sqlite") or "postgresql" in Config.SQLALCHEMY_DATABASE_URI)

    def test_password_hashing(self):
        pwd = "TestSecretPassword123!"
        hashed = hash_password(pwd)
        self.assertNotEqual(pwd, hashed)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("WrongPassword!", hashed))

    def test_jwt_generation_and_decoding(self):
        token = generate_jwt_token(user_id=1, username="admin", role="ADMIN")
        self.assertIsNotNone(token)
        payload = decode_jwt_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["username"], "admin")
        self.assertEqual(payload["role"], "ADMIN")

    def test_authenticate_user(self):
        # Default seeded admin account
        res, err = authenticate_user("admin", "TraceFresh#2026!Admin")
        self.assertIsNone(err)
        self.assertIsNotNone(res)
        self.assertIn("token", res)
        self.assertEqual(res["user"]["username"], "admin")

        # Wrong password
        res_err, err_msg = authenticate_user("admin", "WrongPassword")
        self.assertIsNone(res_err)
        self.assertIsNotNone(err_msg)

    def test_database_orm_crud(self):
        session = get_db_session()
        try:
            # Create Batch
            b_id = "TF-TEST-ORMBATCH-01"
            batch = BatchModel(
                batch_id=b_id,
                display_name="Test ORM Apples",
                fruit_type="APPLES",
                source="Test Farm"
            )
            session.add(batch)
            session.commit()

            # Read Batch
            fetched = session.query(BatchModel).filter_by(batch_id=b_id).first()
            self.assertIsNotNone(fetched)
            self.assertEqual(fetched.display_name, "Test ORM Apples")

            # Clean up
            session.delete(fetched)
            session.commit()
        finally:
            session.close()


if __name__ == "__main__":
    unittest.main()
