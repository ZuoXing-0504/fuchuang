from __future__ import annotations

from pathlib import Path

import numpy as np

try:
    import pandas as pd
except ImportError as exc:
    raise ImportError("analysis/profile_generator.py 依赖 pandas。") from exc

try:
    from .data_prepare import DEFAULT_MASTER_PATH, load_analysis_master
except ImportError:
    from data_prepare import DEFAULT_MASTER_PATH, load_analysis_master


GROUP_PROFILE_COLUMNS = [
    "study_time",
    "library_count",
    "night_net_ratio",
    "study_index",
    "self_discipline_index",
    "health_index",
    "development_index",
    "risk_prob",
]

STUDENT_METRIC_COLUMNS = GROUP_PROFILE_COLUMNS

RADAR_PROFILE_SPECS = [
    ("学习投入", "study_index", False),
    ("自律水平", "self_discipline_index", False),
    ("健康发展", "health_index", False),
    ("综合发展", "development_index", False),
    ("风险反向值", "risk_prob", True),
]

DISPLAY_GROUP_LABELS = [
    "高投入稳健型",
    "低投入风险型",
    "夜间波动型",
    "均衡发展型",
    "发展过渡型",
]


def _load_master(master_path: str | Path = DEFAULT_MASTER_PATH) -> pd.DataFrame:
    frame = load_analysis_master(master_path=master_path, rebuild_if_missing=True).copy()
    for column in GROUP_PROFILE_COLUMNS:
        if column in frame.columns:
            frame[column] = pd.to_numeric(frame[column], errors="coerce")
    return frame


def _sort_cluster_values(values: list) -> list:
    def sort_key(value):
        try:
            return (0, float(value))
        except Exception:
            return (1, str(value))

    return sorted(values, key=sort_key)


def _percentile_score(series: pd.Series, value: float, *, reverse: bool = False) -> float | None:
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if clean.empty or pd.isna(value):
        return None
    score = (clean >= value).mean() * 100 if reverse else (clean <= value).mean() * 100
    return round(float(score), 2)


def _safe_float(value) -> float | None:
    if pd.isna(value):
        return None
    return round(float(value), 4)


def _safe_scalar(value):
    if value is None:
        return None
    if isinstance(value, np.generic):
        return value.item()
    return value


def _safe_text(value) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip()
    return "" if text.lower() == "nan" else text


def _normalized_rank(series: pd.Series, *, reverse: bool = False) -> pd.Series:
    numeric = pd.to_numeric(series, errors="coerce")
    ranked = numeric.rank(method="average", pct=True)
    return 1 - ranked if reverse else ranked


def _build_cluster_label_mapping(frame: pd.DataFrame) -> dict[str, str]:
    if "cluster" not in frame.columns or frame["cluster"].dropna().empty:
        return {}

    cluster_stats = frame.dropna(subset=["cluster"]).groupby("cluster")[GROUP_PROFILE_COLUMNS].mean()
    cluster_stats = cluster_stats.copy()
    if cluster_stats.empty:
        return {}

    normalized = cluster_stats.apply(_normalized_rank)
    normalized["night_reverse"] = _normalized_rank(cluster_stats["night_net_ratio"], reverse=True)
    normalized["risk_reverse"] = _normalized_rank(cluster_stats["risk_prob"], reverse=True)

    label_map: dict[str, str] = {}
    remaining = list(cluster_stats.index)

    high_score = (
        normalized["study_index"]
        + normalized["self_discipline_index"]
        + normalized["library_count"]
        + normalized["health_index"]
        + normalized["risk_reverse"]
    )
    high_cluster = high_score.idxmax()
    label_map[str(high_cluster)] = "高投入稳健型"
    remaining.remove(high_cluster)

    if remaining:
        night_candidates = normalized.loc[remaining]
        night_score = (
            night_candidates["night_net_ratio"]
            + night_candidates["risk_prob"]
            + (1 - night_candidates["study_index"])
            + (1 - night_candidates["library_count"])
        )
        night_cluster = night_score.idxmax()
        label_map[str(night_cluster)] = "夜间波动型"
        remaining.remove(night_cluster)

    if remaining:
        low_candidates = normalized.loc[remaining]
        low_score = (
            (1 - low_candidates["study_index"])
            + (1 - low_candidates["self_discipline_index"])
            + (1 - low_candidates["library_count"])
            + low_candidates["risk_prob"]
        )
        low_cluster = low_score.idxmax()
        label_map[str(low_cluster)] = "低投入风险型"
        remaining.remove(low_cluster)

    if remaining:
        overall_mean = cluster_stats.mean(numeric_only=True)
        for cluster in list(remaining):
            cluster_mean = cluster_stats.loc[cluster]
            is_balanced = (
                pd.notna(cluster_mean.get("study_index"))
                and pd.notna(overall_mean.get("study_index"))
                and cluster_mean["study_index"] >= overall_mean["study_index"] * 0.9
                and cluster_mean["study_index"] <= overall_mean["study_index"] * 1.1
                and cluster_mean["self_discipline_index"] >= overall_mean["self_discipline_index"] * 0.9
                and cluster_mean["self_discipline_index"] <= overall_mean["self_discipline_index"] * 1.1
                and cluster_mean["health_index"] >= overall_mean["health_index"] * 0.9
                and cluster_mean["health_index"] <= overall_mean["health_index"] * 1.1
                and cluster_mean["risk_prob"] <= overall_mean["risk_prob"] * 1.1
            )
            label_map[str(cluster)] = "均衡发展型" if is_balanced else "发展过渡型"

    return label_map


def get_cluster_label_mapping(master_path: str | Path = DEFAULT_MASTER_PATH) -> dict[str, str]:
    frame = _load_master(master_path)
    return _build_cluster_label_mapping(frame)


def _describe_cluster_traits(cluster_mean: pd.Series, overall_mean: pd.Series) -> list[str]:
    traits: list[str] = []
    comparison_pairs = [
        ("study_index", "学习投入较高", "学习投入较低"),
        ("self_discipline_index", "自律水平较高", "自律水平较低"),
        ("library_count", "图书馆活跃度较高", "图书馆活跃度较低"),
        ("health_index", "健康发展较好", "健康发展较弱"),
        ("development_index", "综合发展较强", "综合发展较弱"),
        ("night_net_ratio", "夜间上网占比较高", "夜间上网占比较低"),
        ("risk_prob", "风险概率偏高", "风险概率偏低"),
    ]

    for column, high_text, low_text in comparison_pairs:
        cluster_value = cluster_mean.get(column, np.nan)
        overall_value = overall_mean.get(column, np.nan)
        if pd.isna(cluster_value) or pd.isna(overall_value) or overall_value == 0:
            continue
        ratio = cluster_value / overall_value
        if ratio >= 1.1:
            traits.append(high_text)
        elif ratio <= 0.9:
            traits.append(low_text)

    return traits[:4]


def generate_group_profile(master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    frame = _load_master(master_path)
    overall_mean = frame[GROUP_PROFILE_COLUMNS].mean(numeric_only=True)
    cluster_label_map = _build_cluster_label_mapping(frame)

    cluster_distribution: list[dict] = []
    feature_means: dict[str, dict] = {}

    cluster_values = (
        [value for value in frame["cluster"].dropna().unique().tolist()]
        if "cluster" in frame.columns
        else []
    )
    for cluster in _sort_cluster_values(cluster_values):
        cluster_frame = frame[frame["cluster"] == cluster].copy()
        cluster_mean = cluster_frame[GROUP_PROFILE_COLUMNS].mean(numeric_only=True)
        cluster_key = str(cluster)
        cluster_label = cluster_label_map.get(cluster_key, f"群体 {cluster_key}")
        cluster_distribution.append(
            {
                "cluster": _safe_scalar(cluster),
                "label": cluster_label,
                "count": int(len(cluster_frame)),
                "ratio": round(float(len(cluster_frame) / max(len(frame), 1)), 4),
            }
        )
        feature_means[cluster_key] = {
            "label": cluster_label,
            "traits": _describe_cluster_traits(cluster_mean, overall_mean),
            "means": {
                column: _safe_float(cluster_mean.get(column, np.nan))
                for column in GROUP_PROFILE_COLUMNS
            },
            "risk_ratio": _safe_float(
                pd.to_numeric(cluster_frame["risk_label"], errors="coerce").mean()
            )
            if "risk_label" in cluster_frame.columns
            else None,
        }

    return {
        "total_students": int(len(frame)),
        "cluster_label_map": cluster_label_map,
        "cluster_distribution": cluster_distribution,
        "feature_means": feature_means,
        "overall_means": {
            column: _safe_float(overall_mean.get(column, np.nan))
            for column in GROUP_PROFILE_COLUMNS
        },
        "risk_distribution": {
            "high_risk_count": int(
                pd.to_numeric(frame.get("risk_label"), errors="coerce").fillna(0).sum()
            )
            if "risk_label" in frame.columns
            else 0,
            "high_risk_ratio": _safe_float(
                pd.to_numeric(frame.get("risk_label"), errors="coerce").mean()
            )
            if "risk_label" in frame.columns
            else None,
        },
    }


def generate_student_profile(student_id: str, master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    frame = _load_master(master_path)
    normalized_id = str(student_id).strip().lower()
    student_rows = frame[frame["student_id"].astype(str).str.lower() == normalized_id].copy()
    if student_rows.empty:
        raise ValueError(f"未找到学生: {student_id}")

    student = student_rows.iloc[0]
    group_profile = generate_group_profile(master_path)
    cluster_key = str(student["cluster"]) if pd.notna(student.get("cluster")) else None
    cluster_entry = group_profile["feature_means"].get(cluster_key, {})
    overall_means = group_profile["overall_means"]

    radar_data = []
    for label, column, reverse in RADAR_PROFILE_SPECS:
        radar_data.append(
            {
                "indicator": label,
                "column": column,
                "value": _percentile_score(frame[column], student[column], reverse=reverse)
                if column in frame.columns
                else None,
            }
        )

    return {
        "student_id": student["student_id"],
        "basic_info": {
            "student_id": student["student_id"],
            "name": _safe_text(student.get("name", "")),
            "college": _safe_text(student.get("college", "")),
            "major": _safe_text(student.get("major", "")),
        },
        "metrics": {
            column: _safe_float(student.get(column, np.nan))
            for column in STUDENT_METRIC_COLUMNS
        },
        "radar_data": radar_data,
        "risk_result": {
            "risk_prob": _safe_float(student.get("risk_prob", np.nan)),
            "risk_label": None
            if pd.isna(student.get("risk_label"))
            else int(float(student["risk_label"])),
            "cluster": _safe_scalar(student.get("cluster")),
            "cluster_label": cluster_entry.get("label"),
        },
        "comparisons": {
            "overall_mean": overall_means,
            "cluster_mean": cluster_entry.get("means", {}),
            "percentile_rank": {
                "study_index": _percentile_score(frame["study_index"], student["study_index"])
                if "study_index" in frame.columns
                else None,
                "self_discipline_index": _percentile_score(
                    frame["self_discipline_index"], student["self_discipline_index"]
                )
                if "self_discipline_index" in frame.columns
                else None,
                "health_index": _percentile_score(frame["health_index"], student["health_index"])
                if "health_index" in frame.columns
                else None,
                "development_index": _percentile_score(
                    frame["development_index"], student["development_index"]
                )
                if "development_index" in frame.columns
                else None,
                "study_time": _percentile_score(frame["study_time"], student["study_time"])
                if "study_time" in frame.columns
                else None,
                "library_count": _percentile_score(
                    frame["library_count"], student["library_count"]
                )
                if "library_count" in frame.columns
                else None,
                "night_net_ratio": _percentile_score(
                    frame["night_net_ratio"], student["night_net_ratio"], reverse=True
                )
                if "night_net_ratio" in frame.columns
                else None,
                "risk_prob": _percentile_score(
                    frame["risk_prob"], student["risk_prob"], reverse=True
                )
                if "risk_prob" in frame.columns
                else None,
            },
        },
        "cluster_traits": cluster_entry.get("traits", []),
    }
