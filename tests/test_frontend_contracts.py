from __future__ import annotations

import unittest

from app import app


class FrontendContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = app.test_client()

    def _login_admin(self) -> str:
        response = self.client.post(
            "/api/auth/login",
            json={"username": "admin001", "password": "123456", "role": "admin"},
        )
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()["data"]
        self.assertIn("token", payload)
        return payload["token"]

    @staticmethod
    def _headers(token: str) -> dict[str, str]:
        return {"Authorization": f"Bearer {token}"}

    def test_admin_contract_payloads_cover_frontend_views(self) -> None:
        token = self._login_admin()

        overview = self.client.get("/api/admin/dashboard/overview", headers=self._headers(token))
        self.assertEqual(overview.status_code, 200)
        overview_data = overview.get_json()["data"]
        for key in ("kpis", "riskDistribution", "profileDistribution", "topRisks", "dataQualitySummary"):
            self.assertIn(key, overview_data)

        warnings = self.client.get("/api/admin/risk/list", headers=self._headers(token))
        self.assertEqual(warnings.status_code, 200)
        warnings_payload = warnings.get_json()["data"]
        self.assertIn("list", warnings_payload)
        warnings_data = warnings_payload["list"]
        self.assertIsInstance(warnings_data, list)
        self.assertGreater(len(warnings_data), 0)
        for key in ("studentId", "name", "riskLevel", "profileCategory"):
            self.assertIn(key, warnings_data[0])

        student_id = warnings_data[0]["studentId"]
        detail = self.client.get(f"/api/admin/student/{student_id}", headers=self._headers(token))
        self.assertEqual(detail.status_code, 200)
        detail_data = detail.get_json()["data"]
        for key in (
            "factors",
            "featureTables",
            "predictionEvidence",
            "recommendedActions",
            "dataQualityAlerts",
            "riskDrivers",
        ):
            self.assertIn(key, detail_data)

        analysis = self.client.get("/api/admin/analysis/results", headers=self._headers(token))
        self.assertEqual(analysis.status_code, 200)
        analysis_data = analysis.get_json()["data"]
        for key in ("summaryCards", "chartStatus", "charts", "storyline", "dataQuality"):
            self.assertIn(key, analysis_data)

    def test_student_contract_payloads_cover_frontend_views(self) -> None:
        token = self._login_admin()

        dashboard = self.client.get("/api/student/dashboard", headers=self._headers(token))
        self.assertEqual(dashboard.status_code, 200)
        dashboard_data = dashboard.get_json()["data"]
        for key in ("profileCategory", "analysisCharts", "dataQualityAlerts", "riskDrivers"):
            self.assertIn(key, dashboard_data)

        profile = self.client.get("/api/student/profile", headers=self._headers(token))
        self.assertEqual(profile.status_code, 200)
        profile_data = profile.get_json()["data"]
        for key in ("profileCategory", "radar", "strengths", "weaknesses", "riskDrivers", "dataQualityAlerts"):
            self.assertIn(key, profile_data)

        report = self.client.get("/api/student/report", headers=self._headers(token))
        self.assertEqual(report.status_code, 200)
        report_data = report.get_json()["data"]
        for key in ("sections", "suggestions", "recommendedActions", "predictionEvidence", "riskDrivers"):
            self.assertIn(key, report_data)

        recommendations = self.client.get("/api/student/recommendations", headers=self._headers(token))
        self.assertEqual(recommendations.status_code, 200)
        recommendations_data = recommendations.get_json()["data"]
        self.assertIn("recommendations", recommendations_data)
        self.assertIsInstance(recommendations_data["recommendations"], list)
        if recommendations_data["recommendations"]:
            for key in ("category", "priority", "title", "description", "reason"):
                self.assertIn(key, recommendations_data["recommendations"][0])


if __name__ == "__main__":
    unittest.main()
