from __future__ import annotations

import unittest

from backend.data_source import ModelOutputsRepository, UnifiedDataRepository
from app import BASE_DIR, STUDENT_FEATURE_COLUMN_CANDIDATES, app, load_analysis_master


class BackendSmokeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = UnifiedDataRepository(
            BASE_DIR,
            analysis_loader=load_analysis_master,
            student_feature_column_candidates=STUDENT_FEATURE_COLUMN_CANDIDATES,
        )
        self.model_repository = ModelOutputsRepository(BASE_DIR)

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

    def test_admin_endpoints_contract_smoke(self) -> None:
        client = app.test_client()

        dashboard = client.get("/api/admin/dashboard/overview")
        self.assertEqual(dashboard.status_code, 200)
        self.assertIn("data", dashboard.get_json())

        metrics = client.get("/api/admin/model/metrics")
        self.assertEqual(metrics.status_code, 200)
        self.assertIn("metrics", metrics.get_json()["data"])

        clusters = client.get("/api/admin/cluster/profile")
        self.assertEqual(clusters.status_code, 200)
        self.assertIsInstance(clusters.get_json()["data"], list)


if __name__ == "__main__":
    unittest.main()
