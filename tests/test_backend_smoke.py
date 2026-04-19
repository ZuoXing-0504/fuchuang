from __future__ import annotations

import unittest
from datetime import datetime

from backend.data_quality import DataQualityService
from backend.data_source import ModelOutputsRepository, UnifiedDataRepository
from app import (
    BASE_DIR,
    STUDENT_FEATURE_COLUMN_CANDIDATES,
    UserAccount,
    app,
    db,
    load_analysis_master,
)


class BackendSmokeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = UnifiedDataRepository(
            BASE_DIR,
            analysis_loader=load_analysis_master,
            student_feature_column_candidates=STUDENT_FEATURE_COLUMN_CANDIDATES,
        )
        self.model_repository = ModelOutputsRepository(BASE_DIR)
        self.quality_service = DataQualityService(self.repository)

    def test_analysis_repository_uses_analysis_master_as_canonical_source(self) -> None:
        summary = self.repository.data_source_summary()
        self.assertEqual(summary["canonicalSource"], "analysis_master.csv")
        frame = self.repository.load_analysis_frame()
        self.assertIsNotNone(frame)
        self.assertGreater(len(frame), 0)

    def test_model_summary_contains_metrics_and_importance(self) -> None:
        summary = self.model_repository.build_risk_model_summary()
        self.assertGreater(len(summary["metrics"]), 0)
        self.assertGreater(len(summary["importance"]), 0)

    def test_data_quality_summary_and_alerts_exist(self) -> None:
        report = self.quality_service.build_dataset_report()
        self.assertIn("summary", report)
        self.assertGreater(len(report["fields"]), 0)
        row = self.repository.find_student_row(self.repository.pick_default_student_id())
        alerts = self.quality_service.build_student_alerts(row)
        self.assertIsInstance(alerts, list)

    def test_admin_endpoints_contract_smoke(self) -> None:
        client = app.test_client()

        login_response = client.post("/api/auth/login", json={"username": "admin001", "password": "123456", "role": "admin"})
        self.assertEqual(login_response.status_code, 200)
        login_payload = login_response.get_json()["data"]
        self.assertIn("tokenExpiresAt", login_payload)
        self.assertIn("permissions", login_payload)
        token = login_payload["token"]

        dashboard = client.get("/api/admin/dashboard/overview", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(dashboard.status_code, 200)
        self.assertIn("data", dashboard.get_json())
        self.assertIn("dataQualitySummary", dashboard.get_json()["data"])

        metrics = client.get("/api/admin/model/metrics", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(metrics.status_code, 200)
        self.assertIn("metrics", metrics.get_json()["data"])

        clusters = client.get("/api/admin/cluster/profile", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(clusters.status_code, 200)
        self.assertIsInstance(clusters.get_json()["data"], list)

    def test_admin_endpoint_requires_valid_token(self) -> None:
        client = app.test_client()
        response = client.get("/api/admin/dashboard/overview")
        self.assertEqual(response.status_code, 401)

        with app.app_context():
            account = UserAccount.query.filter_by(username="admin001").first()
            self.assertIsNotNone(account)
            account.token = "expired-token-for-test"
            account.token_expires_at = datetime(2000, 1, 1)
            db.session.commit()

        expired = client.get("/api/admin/dashboard/overview", headers={"Authorization": "Bearer expired-token-for-test"})
        self.assertEqual(expired.status_code, 401)


if __name__ == "__main__":
    unittest.main()
