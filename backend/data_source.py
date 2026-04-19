from __future__ import annotations

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

import pandas as pd


def _normalize_student_id_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    if text.lower() in {"", "nan", "none", "null"}:
        return ""
    if text.endswith(".0"):
        text = text[:-2]
    return text


class UnifiedDataRepository:
    def __init__(
        self,
        base_dir: str | Path,
        *,
        analysis_loader: Callable[..., pd.DataFrame] | None = None,
        student_feature_column_candidates: dict[str, tuple[str, ...]] | None = None,
    ) -> None:
        self.base_dir = Path(base_dir)
        self.analysis_loader = analysis_loader
        self.student_feature_column_candidates = student_feature_column_candidates or {}
        self.analysis_master_path = self.base_dir / "our project" / "analysis_master.csv"
        self.train_features_path = self.base_dir / "our project" / "train_features_final.csv"
        self.runtime_db_path = self.base_dir / "student_behavior.db"
        self._analysis_frame_cache: pd.DataFrame | None = None
        self._train_features_cache: pd.DataFrame | None = None

    def data_source_summary(self) -> dict[str, Any]:
        return {
            "canonicalSource": "analysis_master.csv",
            "analysisMasterPath": str(self.analysis_master_path),
            "trainFeaturesPath": str(self.train_features_path),
            "runtimeDbPath": str(self.runtime_db_path),
            "sourcePolicy": [
                "analysis_master.csv 作为学生画像、风险列表和报告读取链路的主数据源。",
                "train_features_final.csv 作为原始工程特征补充源，用于特征说明和在线预测回退。",
                "student_behavior.db 仅承担账号、令牌和可选特征覆盖的运行时存储。",
            ],
        }

    def load_analysis_frame(self) -> pd.DataFrame | None:
        if self._analysis_frame_cache is not None:
            return self._analysis_frame_cache
        if self.analysis_loader is None:
            return None
        try:
            frame = self.analysis_loader(rebuild_if_missing=True)
            if frame is not None and "student_id" in frame.columns:
                frame = frame.copy()
                frame["student_id"] = frame["student_id"].map(_normalize_student_id_text)
            self._analysis_frame_cache = frame
        except Exception:
            self._analysis_frame_cache = None
        return self._analysis_frame_cache

    def pick_default_student_id(self) -> str | None:
        frame = self.load_analysis_frame()
        if frame is None or frame.empty or "student_id" not in frame.columns:
            return None
        return _normalize_student_id_text(frame.iloc[0]["student_id"])

    def find_student_row(self, student_id: str) -> pd.Series | None:
        frame = self.load_analysis_frame()
        if frame is None or frame.empty or "student_id" not in frame.columns:
            return None
        sid = _normalize_student_id_text(student_id).lower()
        if not sid:
            return None
        matched = frame[frame["student_id"].astype(str).str.lower() == sid]
        if matched.empty:
            return None
        return matched.iloc[0]

    def load_train_features_frame(self) -> pd.DataFrame:
        if self._train_features_cache is not None:
            return self._train_features_cache
        if not self.train_features_path.exists():
            self._train_features_cache = pd.DataFrame()
            return self._train_features_cache
        try:
            frame = pd.read_csv(self.train_features_path)
            if "student_id" in frame.columns:
                frame["student_id"] = frame["student_id"].map(_normalize_student_id_text)
            self._train_features_cache = frame
        except Exception:
            self._train_features_cache = pd.DataFrame()
        return self._train_features_cache

    def load_train_feature_record(self, student_id: str) -> dict[str, Any]:
        frame = self.load_train_features_frame()
        if frame.empty or "student_id" not in frame.columns:
            return {}
        sid = _normalize_student_id_text(student_id)
        match = frame.loc[frame["student_id"] == sid]
        if match.empty:
            return {}
        row = match.iloc[0].to_dict()
        return {key: (None if pd.isna(value) else value) for key, value in row.items()}

    def load_student_feature_record(self, student_id: str) -> dict[str, Any]:
        result: dict[str, Any] = {}
        raw_record = self.load_train_feature_record(student_id)

        connection = None
        try:
            if self.runtime_db_path.exists():
                connection = sqlite3.connect(self.runtime_db_path)
                connection.row_factory = sqlite3.Row
                cursor = connection.cursor()
                columns = {row[1] for row in cursor.execute("PRAGMA table_info(student_features)").fetchall()}
                selected_columns: list[tuple[str, str]] = []
                for alias, candidates in self.student_feature_column_candidates.items():
                    actual_name = next((candidate for candidate in candidates if candidate in columns), None)
                    if actual_name:
                        selected_columns.append((alias, actual_name))
                if selected_columns:
                    select_sql = ", ".join([f'"{actual}" AS "{alias}"' for alias, actual in selected_columns])
                    row = cursor.execute(
                        f"SELECT {select_sql} FROM student_features WHERE student_id = ? LIMIT 1",
                        (_normalize_student_id_text(student_id),),
                    ).fetchone()
                    if row is not None:
                        result.update({alias: row[alias] for alias, _ in selected_columns})
        except Exception:
            pass
        finally:
            if connection is not None:
                connection.close()

        for alias, candidates in self.student_feature_column_candidates.items():
            if result.get(alias) is not None:
                continue
            for candidate in candidates:
                if candidate in raw_record:
                    value = raw_record.get(candidate)
                    if value is not None:
                        result[alias] = value
                        break

        result["_raw_record"] = raw_record
        return result


class ModelOutputsRepository:
    MODEL_NAME_MAP = {
        "rf": "RandomForest",
        "logistic": "LogisticRegression",
        "extratrees": "ExtraTrees",
    }

    def __init__(self, base_dir: str | Path) -> None:
        self.base_dir = Path(base_dir)
        self.model_outputs_dir = self.base_dir / "our project" / "model_outputs"

    def _read_csv(self, filename: str) -> pd.DataFrame:
        path = self.model_outputs_dir / filename
        if not path.exists():
            return pd.DataFrame()
        try:
            return pd.read_csv(path)
        except Exception:
            return pd.DataFrame()

    def build_risk_model_summary(self, *, top_n: int = 5) -> dict[str, Any]:
        compare = self._read_csv("risk_classification_model_compare.csv")
        importance = self._read_csv("risk_classification_importance.csv")

        metrics = []
        if not compare.empty:
            for _, row in compare.iterrows():
                metrics.append(
                    {
                        "model": self.MODEL_NAME_MAP.get(str(row.get("model") or "").strip(), str(row.get("model") or "unknown")),
                        "accuracy": float(row.get("accuracy") or 0),
                        "precision": float(row.get("precision") or 0),
                        "recall": float(row.get("recall") or 0),
                        "f1": float(row.get("f1") or 0),
                        "auc": float(row.get("auc") or 0),
                        "cvAuc": float(row.get("cv_auc") or 0),
                    }
                )

        importance_rows = []
        if not importance.empty:
            for _, row in importance.head(top_n).iterrows():
                importance_rows.append(
                    {
                        "feature": str(row.get("feature") or "unknown"),
                        "importance": float(row.get("importance") or 0),
                    }
                )

        descriptions = [
            "模型表现页统一使用 risk_classification_model_compare.csv 作为风险模型评估基准。",
            "特征重要性统一使用 risk_classification_importance.csv，避免前后端各自拼接不同来源。",
            "analysis_master.csv 负责画像展示，模型输出文件负责评估说明，两者职责分离但契约统一。",
        ]
        return {
            "metrics": metrics,
            "importance": importance_rows,
            "description": descriptions,
        }

    def build_cluster_insights(
        self,
        student_rows: list[dict[str, Any]],
        *,
        cluster_name_resolver: Callable[[Any], str],
    ) -> list[dict[str, Any]]:
        profile_frame = self._read_csv("cluster_profile.csv")
        if profile_frame.empty:
            return []

        radar_columns = [
            "上网时长",
            "跑步次数",
            "体测分",
            "测验平均分",
            "作业平均分",
        ]
        normalized_profiles = profile_frame.copy()
        for column in radar_columns:
            if column not in normalized_profiles.columns:
                continue
            col_min = float(normalized_profiles[column].min())
            col_max = float(normalized_profiles[column].max())
            if col_max == col_min:
                normalized_profiles[column] = 50
            else:
                normalized_profiles[column] = (
                    (normalized_profiles[column] - col_min) / (col_max - col_min) * 100
                ).round(1)

        insights = []
        for _, row in profile_frame.iterrows():
            cluster_value = row.get("学生画像类别")
            category = cluster_name_resolver(cluster_value)
            students = [item for item in student_rows if str(item.get("profileCategory") or "") == category][:6]

            averages = []
            for column in radar_columns:
                if column in row:
                    averages.append({"name": column, "value": round(float(row.get(column) or 0), 2)})

            normalized_row = normalized_profiles.loc[row.name]
            radar = []
            for column in radar_columns:
                if column in normalized_row:
                    radar.append({"indicator": column, "value": round(float(normalized_row.get(column) or 0), 1)})

            highlights = sorted(
                averages,
                key=lambda item: abs(float(item["value"])),
                reverse=True,
            )[:2]
            description = "；".join(
                f"{item['name']}均值为 {item['value']:.2f}" for item in highlights
            ) or "当前群体暂无额外说明。"

            insights.append(
                {
                    "category": category,
                    "title": f"{category}群体画像",
                    "description": description,
                    "radar": radar,
                    "averages": averages,
                    "students": students,
                }
            )

        return insights


class InMemoryBatchTaskStore:
    def __init__(self) -> None:
        self._tasks: list[dict[str, Any]] = []

    def list_tasks(self) -> list[dict[str, Any]]:
        return list(reversed(self._tasks))

    def submit(self, file_name: str) -> dict[str, Any]:
        safe_name = str(file_name or "").strip() or "batch_predict.csv"
        task = {
            "taskId": f"TASK-{len(self._tasks) + 1:04d}",
            "filename": safe_name,
            "status": "已完成",
            "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "records": 0,
        }
        self._tasks.append(task)
        return task
