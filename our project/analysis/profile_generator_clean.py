from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

try:
    from .data_prepare_clean import DEFAULT_MASTER_PATH, load_analysis_master
except ImportError:
    from data_prepare_clean import DEFAULT_MASTER_PATH, load_analysis_master


RAW_GROUP_COLUMNS = [
    "study_time",
    "library_count",
    "night_net_ratio",
    "risk_prob",
]
DISPLAY_GROUP_COLUMNS = [
    "study_index_display",
    "self_discipline_index_display",
    "health_index_display",
    "development_index_display",
]

DISPLAY_TO_BASE = {
    "study_index_display": "study_index",
    "self_discipline_index_display": "self_discipline_index",
    "health_index_display": "health_index",
    "development_index_display": "development_index",
}

RADAR_PROFILE_SPECS = [
    ("学习投入", "study_index"),
    ("行为规律", "self_discipline_index"),
    ("健康发展", "health_index"),
    ("综合发展", "development_index"),
]


def _load_master(master_path: str | Path = DEFAULT_MASTER_PATH) -> pd.DataFrame:
    frame = load_analysis_master(master_path=master_path, rebuild_if_missing=True).copy()
    for column in RAW_GROUP_COLUMNS + DISPLAY_GROUP_COLUMNS:
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


def _safe_float(value, default=None):
    try:
        if value is None or pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def _safe_text(value) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip()
    return "" if text.lower() == "nan" else text


def _percentile_score(series: pd.Series, value: float, *, reverse: bool = False) -> float | None:
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if clean.empty or pd.isna(value):
        return None
    score = (clean >= value).mean() * 100 if reverse else (clean <= value).mean() * 100
    return round(float(score), 2)


def _normalized_rank(series: pd.Series, *, reverse: bool = False) -> pd.Series:
    numeric = pd.to_numeric(series, errors="coerce")
    ranked = numeric.rank(method="average", pct=True)
    return 1 - ranked if reverse else ranked


def _build_cluster_label_mapping(frame: pd.DataFrame) -> dict[str, str]:
    if "cluster" not in frame.columns or frame["cluster"].dropna().empty:
        return {}

    cluster_stats = frame.dropna(subset=["cluster"]).groupby("cluster")[
        ["study_index_display", "self_discipline_index_display", "health_index_display", "development_index_display", "library_count", "night_net_ratio", "risk_prob"]
    ].mean()
    if cluster_stats.empty:
        return {}

    normalized = cluster_stats.apply(_normalized_rank)
    normalized["night_reverse"] = _normalized_rank(cluster_stats["night_net_ratio"], reverse=True)
    normalized["risk_reverse"] = _normalized_rank(cluster_stats["risk_prob"], reverse=True)

    label_map: dict[str, str] = {}
    remaining = list(cluster_stats.index)

    high_score = (
        normalized["study_index_display"]
        + normalized["self_discipline_index_display"]
        + normalized["library_count"]
        + normalized["health_index_display"]
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
            + (1 - night_candidates["study_index_display"])
            + (1 - night_candidates["library_count"])
        )
        night_cluster = night_score.idxmax()
        label_map[str(night_cluster)] = "夜间波动型"
        remaining.remove(night_cluster)

    if remaining:
        low_candidates = normalized.loc[remaining]
        low_score = (
            (1 - low_candidates["study_index_display"])
            + (1 - low_candidates["self_discipline_index_display"])
            + (1 - low_candidates["library_count"])
            + low_candidates["risk_prob"]
        )
        low_cluster = low_score.idxmax()
        label_map[str(low_cluster)] = "低投入风险型"
        remaining.remove(low_cluster)

    for cluster in remaining:
        label_map[str(cluster)] = "发展过渡型"
    return label_map


def get_cluster_label_mapping(master_path: str | Path = DEFAULT_MASTER_PATH) -> dict[str, str]:
    return _build_cluster_label_mapping(_load_master(master_path))


def _describe_cluster_traits(cluster_mean: pd.Series, overall_mean: pd.Series) -> list[str]:
    traits: list[str] = []
    comparison_pairs = [
        ("study_index_display", "学习投入相对更高", "学习投入相对偏弱"),
        ("self_discipline_index_display", "行为规律更稳定", "行为规律仍待提升"),
        ("library_count", "线下资源利用更积极", "线下资源利用偏低"),
        ("health_index_display", "健康发展状态较好", "健康发展维度偏弱"),
        ("development_index_display", "综合成长动能较强", "综合成长动能偏弱"),
        ("night_net_ratio", "夜间活跃偏高", "夜间活跃较低"),
        ("risk_prob", "风险敏感度偏高", "风险敏感度较低"),
    ]
    for column, high_text, low_text in comparison_pairs:
        cluster_value = cluster_mean.get(column, np.nan)
        overall_value = overall_mean.get(column, np.nan)
        if pd.isna(cluster_value) or pd.isna(overall_value) or overall_value == 0:
            continue
        ratio = cluster_value / overall_value
        if ratio >= 1.08:
            traits.append(high_text)
        elif ratio <= 0.92:
            traits.append(low_text)
    return traits[:4]


def generate_group_profile(master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    frame = _load_master(master_path)
    overall_mean = frame[RAW_GROUP_COLUMNS + DISPLAY_GROUP_COLUMNS].mean(numeric_only=True)
    cluster_label_map = _build_cluster_label_mapping(frame)

    cluster_distribution: list[dict] = []
    cluster_values = [value for value in frame["cluster"].dropna().unique().tolist()] if "cluster" in frame.columns else []
    for cluster in _sort_cluster_values(cluster_values):
        cluster_frame = frame[frame["cluster"] == cluster].copy()
        cluster_mean = cluster_frame[RAW_GROUP_COLUMNS + DISPLAY_GROUP_COLUMNS].mean(numeric_only=True)
        cluster_key = str(cluster)
        cluster_label = cluster_label_map.get(cluster_key, f"群体 {cluster_key}")
        cluster_distribution.append(
            {
                "cluster": cluster,
                "cluster_key": cluster_key,
                "cluster_label": cluster_label,
                "count": int(len(cluster_frame)),
                "ratio": round(float(len(cluster_frame) / len(frame) * 100), 2) if len(frame) else 0,
                "traits": _describe_cluster_traits(cluster_mean, overall_mean),
                "study_index_display": round(_safe_float(cluster_mean.get("study_index_display"), 0), 1),
                "self_discipline_index_display": round(_safe_float(cluster_mean.get("self_discipline_index_display"), 0), 1),
                "health_index_display": round(_safe_float(cluster_mean.get("health_index_display"), 0), 1),
                "development_index_display": round(_safe_float(cluster_mean.get("development_index_display"), 0), 1),
                "library_count": round(_safe_float(cluster_mean.get("library_count"), 0), 1),
                "night_net_ratio": round(_safe_float(cluster_mean.get("night_net_ratio"), 0) * 100, 2),
                "risk_prob": round(_safe_float(cluster_mean.get("risk_prob"), 0) * 100, 2),
            }
        )

    return {
        "cluster_distribution": cluster_distribution,
        "cluster_label_map": cluster_label_map,
        "overall_mean": overall_mean.to_dict(),
    }


def generate_student_profile(student_id: str, master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    frame = _load_master(master_path)
    matched = frame[frame["student_id"].astype(str).str.lower() == str(student_id).strip().lower()]
    if matched.empty:
        raise ValueError("学生不存在")

    row = matched.iloc[0]
    cluster_label_map = _build_cluster_label_mapping(frame)
    cluster_value = row.get("cluster")
    cluster_key = str(cluster_value) if pd.notna(cluster_value) else ""
    cluster_label = cluster_label_map.get(cluster_key, "发展过渡型")

    cluster_frame = frame[frame["cluster"] == cluster_value].copy() if pd.notna(cluster_value) else frame.iloc[0:0].copy()
    overall_mean = frame[RAW_GROUP_COLUMNS + DISPLAY_GROUP_COLUMNS].mean(numeric_only=True)
    cluster_mean = cluster_frame[RAW_GROUP_COLUMNS + DISPLAY_GROUP_COLUMNS].mean(numeric_only=True) if not cluster_frame.empty else pd.Series(dtype=float)

    metrics = {
        "study_index": _safe_float(row.get("study_index_display"), 0.0),
        "self_discipline_index": _safe_float(row.get("self_discipline_index_display"), 0.0),
        "health_index": _safe_float(row.get("health_index_display"), 0.0),
        "development_index": _safe_float(row.get("development_index_display"), 0.0),
        "risk_prob": _safe_float(row.get("risk_prob"), 0.0),
        "study_time": _safe_float(row.get("study_time"), 0.0),
        "library_count": _safe_float(row.get("library_count"), 0.0),
        "night_net_ratio": _safe_float(row.get("night_net_ratio"), 0.0),
    }

    comparisons = {
        "overall_mean": {
            "study_index": _safe_float(overall_mean.get("study_index_display"), 0.0),
            "self_discipline_index": _safe_float(overall_mean.get("self_discipline_index_display"), 0.0),
            "health_index": _safe_float(overall_mean.get("health_index_display"), 0.0),
            "development_index": _safe_float(overall_mean.get("development_index_display"), 0.0),
            "risk_prob": _safe_float(overall_mean.get("risk_prob"), 0.0),
            "study_time": _safe_float(overall_mean.get("study_time"), 0.0),
            "library_count": _safe_float(overall_mean.get("library_count"), 0.0),
            "night_net_ratio": _safe_float(overall_mean.get("night_net_ratio"), 0.0),
        },
        "cluster_mean": {
            "study_index": _safe_float(cluster_mean.get("study_index_display"), 0.0),
            "self_discipline_index": _safe_float(cluster_mean.get("self_discipline_index_display"), 0.0),
            "health_index": _safe_float(cluster_mean.get("health_index_display"), 0.0),
            "development_index": _safe_float(cluster_mean.get("development_index_display"), 0.0),
            "risk_prob": _safe_float(cluster_mean.get("risk_prob"), 0.0),
            "study_time": _safe_float(cluster_mean.get("study_time"), 0.0),
            "library_count": _safe_float(cluster_mean.get("library_count"), 0.0),
            "night_net_ratio": _safe_float(cluster_mean.get("night_net_ratio"), 0.0),
        },
        "percentile_rank": {
            "study_index": _percentile_score(frame["study_index_display"], row.get("study_index_display")),
            "self_discipline_index": _percentile_score(frame["self_discipline_index_display"], row.get("self_discipline_index_display")),
            "health_index": _percentile_score(frame["health_index_display"], row.get("health_index_display")),
            "development_index": _percentile_score(frame["development_index_display"], row.get("development_index_display")),
            "risk_prob": _percentile_score(frame["risk_prob"], row.get("risk_prob"), reverse=True),
        },
    }

    radar_data = [
        {"indicator": indicator, "key": key, "value": round(_safe_float(metrics.get(key), 0.0), 1)}
        for indicator, key in RADAR_PROFILE_SPECS
    ]
    radar_data.append({"indicator": "风险安全", "key": "risk_prob", "value": round((1 - metrics["risk_prob"]) * 100, 1)})

    return {
        "student_id": str(row.get("student_id")),
        "basic_info": {
            "student_id": str(row.get("student_id")),
            "name": _safe_text(row.get("name")) or str(row.get("student_id")),
            "college": _safe_text(row.get("college")),
            "major": _safe_text(row.get("major")),
            "performance_level": _safe_text(row.get("performance_level")),
        },
        "metrics": metrics,
        "raw_metrics": {
            "study_index": _safe_float(row.get("study_index"), 0.0),
            "self_discipline_index": _safe_float(row.get("self_discipline_index"), 0.0),
            "health_index": _safe_float(row.get("health_index"), 0.0),
            "risk_index": _safe_float(row.get("risk_index"), 0.0),
            "development_index": _safe_float(row.get("development_index"), 0.0),
        },
        "radar_data": radar_data,
        "comparisons": comparisons,
        "cluster": cluster_value,
        "cluster_label": cluster_label,
        "cluster_traits": _describe_cluster_traits(cluster_mean, overall_mean),
    }
