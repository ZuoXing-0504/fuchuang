from __future__ import annotations

import importlib.util
import shutil
import sys
import unittest
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
ANALYSIS_DIR = BASE_DIR / "our project" / "analysis"


def _load_module(module_name: str, path: Path):
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


class AnalysisPipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.data_prepare = _load_module("data_prepare", ANALYSIS_DIR / "data_prepare.py")
        cls.charts = _load_module("charts", ANALYSIS_DIR / "charts.py")
        cls.temp_dir = BASE_DIR / ".codex_tmp" / "test_charts"
        cls.temp_dir.mkdir(parents=True, exist_ok=True)

    @classmethod
    def tearDownClass(cls) -> None:
        shutil.rmtree(cls.temp_dir, ignore_errors=True)
        sys.modules.pop("data_prepare", None)
        sys.modules.pop("charts", None)

    def test_analysis_master_contains_required_columns(self) -> None:
        frame = self.data_prepare.load_analysis_master(rebuild_if_missing=False)
        required = {
            "student_id",
            "study_time",
            "library_count",
            "night_net_ratio",
            "risk_prob",
            "risk_label",
            "cluster",
        }
        self.assertTrue(required.issubset(set(frame.columns)))
        self.assertGreater(len(frame), 0)
        self.assertTrue(frame["risk_prob"].dropna().between(0, 1).all())
        self.assertTrue(frame["night_net_ratio"].dropna().between(0, 1).all())

    def test_chart_generation_outputs_all_expected_files(self) -> None:
        outputs = self.charts.generate_all_charts(
            master_path=self.data_prepare.DEFAULT_MASTER_PATH,
            output_dir=self.temp_dir,
        )
        expected_names = {
            "study_time_distribution",
            "library_count_distribution",
            "health_index_distribution",
            "night_net_ratio_distribution",
            "study_time_vs_risk_prob",
            "library_count_vs_risk_prob",
            "cluster_distribution",
            "cluster_core_feature_means",
        }
        self.assertEqual(set(outputs.keys()), expected_names)

        for output_path in outputs.values():
            path = Path(output_path)
            self.assertTrue(path.exists(), msg=f"Missing chart: {path}")
            self.assertGreater(path.stat().st_size, 0, msg=f"Empty chart: {path}")


if __name__ == "__main__":
    unittest.main()
