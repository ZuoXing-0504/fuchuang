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
                "analysis_master.csv 负责学生画像、风险名单与报告读取链路。",
                "train_features_final.csv 负责原始和进阶特征说明，以及在线预测回退。",
                "student_behavior.db 负责账号、令牌和可选运行时特征覆盖。",
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
        "rf_reg": "RandomForestRegressor",
        "extratrees_reg": "ExtraTreesRegressor",
    }
    TASK_REGISTRY = [
        {
            "taskKey": "risk",
            "taskName": "风险预测",
            "taskType": "binary",
            "compareFile": "risk_classification_model_compare.csv",
            "importanceFile": "risk_classification_importance.csv",
            "primaryMetric": "auc",
            "secondaryMetric": "f1",
            "description": "识别学生风险等级，是整个预警链路的核心入口。",
            "onlineModelFile": "risk_model.joblib",
        },
        {
            "taskKey": "scholarship",
            "taskName": "奖学金获得概率预测",
            "taskType": "binary",
            "compareFile": "scholarship_classification_model_compare.csv",
            "importanceFile": "scholarship_classification_importance.csv",
            "primaryMetric": "auc",
            "secondaryMetric": "f1",
            "description": "预测学生获得奖学金的可能性，用于体现学业与发展成果。",
            "onlineModelFile": "scholarship_model.joblib",
        },
        {
            "taskKey": "performance",
            "taskName": "综合成绩档次分类",
            "taskType": "multiclass",
            "compareFile": "performance_classification_model_compare.csv",
            "importanceFile": "performance_classification_importance.csv",
            "primaryMetric": "macro_auc_ovr",
            "secondaryMetric": "macro_f1",
            "description": "对学生整体学业表现进行高、中、低档位分类。",
            "onlineModelFile": "performance_model.joblib",
        },
        {
            "taskKey": "health",
            "taskName": "健康水平分类",
            "taskType": "multiclass",
            "compareFile": "health_classification_model_compare.csv",
            "importanceFile": "health_classification_importance.csv",
            "primaryMetric": "macro_auc_ovr",
            "secondaryMetric": "macro_f1",
            "description": "根据体测、运动和行为规律特征识别健康状态层级。",
            "onlineModelFile": "health_model.joblib",
        },
        {
            "taskKey": "change_trend",
            "taskName": "变化趋势预测",
            "taskType": "multiclass",
            "compareFile": "change_trend_classification_model_compare.csv",
            "importanceFile": "change_trend_classification_importance.csv",
            "primaryMetric": "macro_auc_ovr",
            "secondaryMetric": "macro_f1",
            "description": "判断学生处于上升、稳定还是下降趋势。",
            "onlineModelFile": "change_trend_model.joblib",
        },
        {
            "taskKey": "learning_engagement",
            "taskName": "学习投入档次分类",
            "taskType": "multiclass",
            "compareFile": "learning_engagement_classification_model_compare.csv",
            "importanceFile": "learning_engagement_classification_importance.csv",
            "primaryMetric": "macro_auc_ovr",
            "secondaryMetric": "macro_f1",
            "description": "评估学生的学习投入档位，承接个体画像里的学习投入维度。",
            "onlineModelFile": "learning_engagement_model.joblib",
        },
        {
            "taskKey": "development",
            "taskName": "综合发展档次分类",
            "taskType": "multiclass",
            "compareFile": "development_classification_model_compare.csv",
            "importanceFile": "development_classification_importance.csv",
            "primaryMetric": "macro_auc_ovr",
            "secondaryMetric": "macro_f1",
            "description": "评估学生综合发展水平，体现成长潜力和长期表现。",
            "onlineModelFile": "development_model.joblib",
        },
        {
            "taskKey": "cet4",
            "taskName": "英语四级通过概率预测",
            "taskType": "binary",
            "compareFile": "cet4_classification_model_compare.csv",
            "importanceFile": "cet4_classification_importance.csv",
            "primaryMetric": "auc",
            "secondaryMetric": "f1",
            "description": "基于学生基础特征预测英语四级通过概率。",
            "onlineModelFile": "cet4_model.joblib",
        },
        {
            "taskKey": "cet6",
            "taskName": "英语六级通过概率预测",
            "taskType": "binary",
            "compareFile": "cet6_classification_model_compare.csv",
            "importanceFile": "cet6_classification_importance.csv",
            "primaryMetric": "auc",
            "secondaryMetric": "f1",
            "description": "基于学生基础特征预测英语六级通过概率。",
            "onlineModelFile": "cet6_model.joblib",
        },
        {
            "taskKey": "score_regression",
            "taskName": "综合成绩预测",
            "taskType": "regression",
            "compareFile": "score_regression_model_compare.csv",
            "importanceFile": "",
            "primaryMetric": "r2",
            "secondaryMetric": "rmse",
            "description": "直接回归预测综合成绩分数，用于个体报告中的分值参考。",
            "onlineModelFile": "score_regression_model.joblib",
        },
    ]

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

    def _format_model_name(self, value: Any) -> str:
        model_name = str(value or "unknown").strip()
        return self.MODEL_NAME_MAP.get(model_name, model_name)

    def _metric_definitions(self, task_type: str) -> list[tuple[str, str]]:
        if task_type == "binary":
            return [
                ("accuracy", "Accuracy"),
                ("precision", "Precision"),
                ("recall", "Recall"),
                ("f1", "F1"),
                ("auc", "AUC"),
                ("cv_auc", "CV AUC"),
            ]
        if task_type == "multiclass":
            return [
                ("accuracy", "Accuracy"),
                ("macro_precision", "Macro Precision"),
                ("macro_recall", "Macro Recall"),
                ("macro_f1", "Macro F1"),
                ("macro_auc_ovr", "Macro AUC"),
            ]
        return [
            ("r2", "R2"),
            ("rmse", "RMSE"),
            ("mae", "MAE"),
        ]

    def _safe_float(self, value: Any) -> float | None:
        try:
            number = float(value)
        except Exception:
            return None
        if pd.isna(number):
            return None
        return number

    def _summarize_task(self, config: dict[str, Any], *, top_n: int = 5) -> dict[str, Any]:
        compare = self._read_csv(config["compareFile"])
        importance = self._read_csv(config["importanceFile"]) if config.get("importanceFile") else pd.DataFrame()
        metric_defs = self._metric_definitions(config["taskType"])

        metric_rows: list[dict[str, Any]] = []
        best_row = None
        best_score = None
        for _, row in compare.iterrows():
            values = []
            for key, label in metric_defs:
                metric_value = self._safe_float(row.get(key))
                if metric_value is None:
                    continue
                values.append({"key": key, "label": label, "value": metric_value})
            metric_rows.append({"model": self._format_model_name(row.get("model")), "values": values})
            score = self._safe_float(row.get(config["primaryMetric"]))
            if score is None:
                continue
            if best_score is None or score > best_score:
                best_score = score
                best_row = row

        if best_row is None and not compare.empty:
            best_row = compare.iloc[0]

        importance_rows = []
        if not importance.empty:
            for _, row in importance.head(top_n).iterrows():
                importance_rows.append(
                    {
                        "feature": str(row.get("feature") or "unknown"),
                        "importance": float(row.get("importance") or 0),
                    }
                )

        metric_label_map = {key: label for key, label in metric_defs}
        best_model = self._format_model_name(best_row.get("model")) if best_row is not None else "未提供"
        primary_value = self._safe_float(best_row.get(config["primaryMetric"])) if best_row is not None else None
        secondary_value = self._safe_float(best_row.get(config["secondaryMetric"])) if best_row is not None else None
        online_available = (self.base_dir / "ml" / "saved_models" / str(config.get("onlineModelFile") or "")).exists()
        return {
            "taskKey": config["taskKey"],
            "taskName": config["taskName"],
            "taskType": config["taskType"],
            "description": config["description"],
            "bestModel": best_model,
            "primaryMetricKey": config["primaryMetric"],
            "primaryMetricLabel": metric_label_map.get(config["primaryMetric"], config["primaryMetric"]),
            "primaryMetricValue": primary_value,
            "secondaryMetricKey": config["secondaryMetric"],
            "secondaryMetricLabel": metric_label_map.get(config["secondaryMetric"], config["secondaryMetric"]),
            "secondaryMetricValue": secondary_value,
            "rows": metric_rows,
            "importance": importance_rows,
            "status": "online" if online_available else "offline_evaluation",
            "statusLabel": "已接入在线预测" if online_available else "已有离线评估，线上推断待补齐",
            "onlineAvailable": online_available,
            "source": config["compareFile"],
        }

    def build_risk_model_summary(self, *, top_n: int = 5) -> dict[str, Any]:
        task_summaries = [self._summarize_task(config, top_n=top_n) for config in self.TASK_REGISTRY]
        risk_task = next((task for task in task_summaries if task["taskKey"] == "risk"), None)

        metrics = []
        importance_rows = []
        if risk_task is not None:
            for row in risk_task["rows"]:
                metric_map = {item["key"]: item["value"] for item in row["values"]}
                metrics.append(
                    {
                        "model": row["model"],
                        "accuracy": float(metric_map.get("accuracy") or 0),
                        "precision": float(metric_map.get("precision") or 0),
                        "recall": float(metric_map.get("recall") or 0),
                        "f1": float(metric_map.get("f1") or 0),
                        "auc": float(metric_map.get("auc") or 0),
                        "cvAuc": float(metric_map.get("cv_auc") or 0),
                    }
                )
            importance_rows = list(risk_task["importance"])

        online_tasks = sum(1 for task in task_summaries if task["onlineAvailable"])
        return {
            "metrics": metrics,
            "importance": importance_rows,
            "description": [
                "统一预测模型模块已经纳入风险、奖学金、综合成绩、健康、变化趋势、学习投入和综合发展等任务。",
                "页面会同时展示离线评估结果与在线接入状态，便于答辩时说明当前系统成熟度。",
                "当前特征说明与模型评估分别来自 train_features_final.csv 和 model_outputs 目录，口径保持一致。",
            ],
            "overviewCards": [
                {"label": "预测任务数", "value": str(len(task_summaries)), "tone": "primary", "note": "统一模型模块已收录的任务总数"},
                {"label": "在线任务数", "value": str(online_tasks), "tone": "success", "note": "已接入单学生在线预测的任务"},
                {"label": "离线评估任务数", "value": str(len(task_summaries) - online_tasks), "tone": "warning", "note": "已有评估结果但待补齐线上推断"},
            ],
            "tasks": task_summaries,
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

        column_aliases = {
            "上网时长": ("上网时长",),
            "跑步次数": ("跑步次数",),
            "体测分": ("体测分",),
            "测验平均分": ("测验平均分",),
            "作业平均分": ("作业平均分",),
        }
        available_columns = {
            label: next((candidate for candidate in candidates if candidate in profile_frame.columns), None)
            for label, candidates in column_aliases.items()
        }
        normalized_profiles = profile_frame.copy()
        for column in filter(None, available_columns.values()):
            col_min = float(normalized_profiles[column].min())
            col_max = float(normalized_profiles[column].max())
            if col_max == col_min:
                normalized_profiles[column] = 50
            else:
                normalized_profiles[column] = (
                    (normalized_profiles[column] - col_min) / (col_max - col_min) * 100
                ).round(1)

        cluster_column = next(
            (candidate for candidate in ("学生画像类别", "瀛︾敓鐢诲儚绫诲埆") if candidate in profile_frame.columns),
            None,
        )
        if cluster_column is None:
            return []

        insights = []
        for _, row in profile_frame.iterrows():
            cluster_value = row.get(cluster_column)
            category = cluster_name_resolver(cluster_value)
            students = [item for item in student_rows if str(item.get("profileCategory") or "") == category][:6]

            averages = []
            for label, actual_column in available_columns.items():
                if actual_column:
                    averages.append({"name": label, "value": round(float(row.get(actual_column) or 0), 2)})

            normalized_row = normalized_profiles.loc[row.name]
            radar = []
            for label, actual_column in available_columns.items():
                if actual_column:
                    radar.append({"indicator": label, "value": round(float(normalized_row.get(actual_column) or 0), 1)})

            highlights = sorted(averages, key=lambda item: abs(float(item["value"])), reverse=True)[:2]
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
