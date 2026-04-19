from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

try:
    from .data_prepare_clean import DEFAULT_MASTER_PATH, load_analysis_master
except ImportError:
    from data_prepare_clean import DEFAULT_MASTER_PATH, load_analysis_master


DEFAULT_SAMPLE_REPORT_DIR = Path(__file__).resolve().parent / "outputs" / "reports" / "samples"

DISPLAY_COLUMN_MAP = {
    "study_index": "study_index_display",
    "self_discipline_index": "self_discipline_index_display",
    "health_index": "health_index_display",
    "risk_index": "risk_index_display",
    "development_index": "development_index_display",
}

CLUSTER_LABEL_MAP = {
    0: "高投入稳健型",
    1: "低投入风险型",
    2: "夜间波动型",
    3: "发展过渡型",
}


def _to_json_ready(value):
    if isinstance(value, dict):
        return {str(key): _to_json_ready(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_to_json_ready(item) for item in value]
    if isinstance(value, tuple):
        return [_to_json_ready(item) for item in value]
    if isinstance(value, Path):
        return str(value)
    item_method = getattr(value, "item", None)
    if callable(item_method):
        try:
            return _to_json_ready(item_method())
        except Exception:
            pass
    return value


def _safe_float(value, default=None):
    try:
        if value is None or pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def _safe_text(value) -> str:
    if value is None or pd.isna(value):
        return ""
    text = str(value).strip()
    return "" if text.lower() == "nan" else text


def _cluster_label(value) -> str:
    try:
        return CLUSTER_LABEL_MAP.get(int(float(value)), "发展过渡型")
    except Exception:
        return "发展过渡型"


def _get_display_value(row: pd.Series, key: str, default: float = 0.0) -> float:
    display_column = DISPLAY_COLUMN_MAP.get(key)
    value = _safe_float(row.get(display_column), None) if display_column else None
    if value is None:
        value = _safe_float(row.get(key), default)
    return round(float(value if value is not None else default), 2)


def _load_master(master_path: str | Path = DEFAULT_MASTER_PATH) -> pd.DataFrame:
    frame = load_analysis_master(master_path=master_path, rebuild_if_missing=True).copy()
    numeric_columns = [
        "study_time",
        "library_count",
        "consume_avg",
        "night_net_ratio",
        "risk_prob",
        "study_index",
        "self_discipline_index",
        "health_index",
        "risk_index",
        "development_index",
        "study_index_display",
        "self_discipline_index_display",
        "health_index_display",
        "risk_index_display",
        "development_index_display",
    ]
    for column in numeric_columns:
        if column in frame.columns:
            frame[column] = pd.to_numeric(frame[column], errors="coerce")
    if "student_id" in frame.columns:
        frame["student_id"] = frame["student_id"].astype(str).str.strip()
    return frame


def get_risk_level_thresholds(master_path: str | Path = DEFAULT_MASTER_PATH) -> tuple[float, float]:
    master = _load_master(master_path)
    risk_prob = pd.to_numeric(master["risk_prob"], errors="coerce").dropna()
    if risk_prob.empty:
        return 0.3, 0.6
    low_upper = round(float(risk_prob.quantile(0.33)), 6)
    medium_upper = round(float(risk_prob.quantile(0.67)), 6)
    return low_upper, medium_upper


def classify_risk_level(
    risk_prob: float | None,
    thresholds: tuple[float, float] | None = None,
    *,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> str:
    if risk_prob is None:
        return "待识别"
    low_upper, medium_upper = thresholds or get_risk_level_thresholds(master_path)
    if risk_prob <= low_upper:
        return "低风险"
    if risk_prob <= medium_upper:
        return "中风险"
    return "高风险"


def _describe_cluster_traits(cluster_mean: pd.Series, overall_mean: pd.Series) -> list[str]:
    traits: list[str] = []
    specs = [
        ("study_index_display", "学习投入相对更高", "学习投入相对偏弱"),
        ("self_discipline_index_display", "行为规律更稳定", "行为规律仍待提升"),
        ("library_count", "线下资源利用更积极", "线下资源利用偏低"),
        ("health_index_display", "健康发展状态较好", "健康发展维度偏弱"),
        ("development_index_display", "综合成长动能较强", "综合成长动能偏弱"),
        ("night_net_ratio", "夜间活跃偏高", "夜间活跃较低"),
        ("risk_prob", "风险敏感度偏高", "风险敏感度较低"),
    ]
    for column, high_text, low_text in specs:
        cluster_value = _safe_float(cluster_mean.get(column))
        overall_value = _safe_float(overall_mean.get(column))
        if cluster_value is None or overall_value in (None, 0):
            continue
        ratio = cluster_value / overall_value
        if ratio >= 1.08:
            traits.append(high_text)
        elif ratio <= 0.92:
            traits.append(low_text)
    return traits[:4]


def _build_group_profile(frame: pd.DataFrame) -> dict:
    overall_mean = frame[
        [
            "study_index_display",
            "self_discipline_index_display",
            "health_index_display",
            "development_index_display",
            "library_count",
            "night_net_ratio",
            "risk_prob",
        ]
    ].mean(numeric_only=True)
    distributions: list[dict] = []
    if "cluster" not in frame.columns:
        return {"cluster_distribution": [], "overall_mean": overall_mean.to_dict()}
    for cluster in sorted(frame["cluster"].dropna().unique().tolist(), key=lambda value: float(value)):
        cluster_frame = frame[frame["cluster"] == cluster].copy()
        cluster_mean = cluster_frame[
            [
                "study_index_display",
                "self_discipline_index_display",
                "health_index_display",
                "development_index_display",
                "library_count",
                "night_net_ratio",
                "risk_prob",
            ]
        ].mean(numeric_only=True)
        distributions.append(
            {
                "cluster": cluster,
                "cluster_label": _cluster_label(cluster),
                "count": int(len(cluster_frame)),
                "ratio": round(float(len(cluster_frame) / len(frame) * 100), 2) if len(frame) else 0,
                "traits": _describe_cluster_traits(cluster_mean, overall_mean),
                "study_index_display": round(_safe_float(cluster_mean.get("study_index_display"), 0), 1),
                "self_discipline_index_display": round(_safe_float(cluster_mean.get("self_discipline_index_display"), 0), 1),
                "health_index_display": round(_safe_float(cluster_mean.get("health_index_display"), 0), 1),
                "development_index_display": round(_safe_float(cluster_mean.get("development_index_display"), 0), 1),
                "library_count": round(_safe_float(cluster_mean.get("library_count"), 0), 1),
                "night_net_ratio": round(_safe_float(cluster_mean.get("night_net_ratio"), 0) * 100, 1),
                "risk_prob": round(_safe_float(cluster_mean.get("risk_prob"), 0) * 100, 1),
            }
        )
    return {"cluster_distribution": distributions, "overall_mean": overall_mean.to_dict()}


def _percentile_score(series: pd.Series, value: float, *, reverse: bool = False) -> float | None:
    clean = pd.to_numeric(series, errors="coerce").dropna()
    if clean.empty or pd.isna(value):
        return None
    score = (clean >= value).mean() * 100 if reverse else (clean <= value).mean() * 100
    return round(float(score), 2)


def _build_risk_dimensions(metrics: dict, comparisons: dict) -> list[dict]:
    overall_mean = comparisons.get("overall_mean", {})

    def build_status(metric_value, overall_value, *, reverse: bool = False) -> str:
        if metric_value is None or overall_value in (None, 0):
            return "数据待补充"
        ratio = metric_value / overall_value if overall_value else 1
        if reverse:
            if ratio >= 1.1:
                return "风险偏高"
            if ratio <= 0.9:
                return "风险较低"
            return "风险居中"
        if ratio <= 0.9:
            return "表现偏弱"
        if ratio >= 1.1:
            return "表现较好"
        return "表现居中"

    return [
        {
            "dimension": "学习投入",
            "status": build_status(metrics.get("study_index"), overall_mean.get("study_index")),
            "indicators": ["study_index", "study_time", "library_count"],
            "summary": "系统会结合学习投入展示分、学习时长原始值和图书馆打卡次数判断当前投入是否充足。",
        },
        {
            "dimension": "行为规律",
            "status": build_status(metrics.get("night_net_ratio"), overall_mean.get("night_net_ratio"), reverse=True),
            "indicators": ["self_discipline_index", "night_net_ratio"],
            "summary": "系统会结合行为规律展示分与夜间上网占比观察当前作息与行为节律是否稳定。",
        },
        {
            "dimension": "健康发展",
            "status": build_status(metrics.get("health_index"), overall_mean.get("health_index")),
            "indicators": ["health_index", "development_index"],
            "summary": "系统会结合健康发展展示分与综合发展展示分判断当前身心状态是否稳定。",
        },
    ]


def _append_unique(items: list[str], *candidates: str) -> None:
    for candidate in candidates:
        text = candidate.strip() if candidate else ""
        if text and text not in items:
            items.append(text)


def _build_explanations(student_profile: dict, risk_level: str) -> list[str]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]
    cluster_traits = student_profile.get("cluster_traits", [])
    explanations: list[str] = []

    risk_prob = metrics.get("risk_prob")
    if risk_prob is not None:
        if risk_level == "高风险":
            _append_unique(explanations, "当前风险概率处于样本中的较高区间，近期需要优先关注学习投入与行为节律变化。")
        elif risk_level == "中风险":
            _append_unique(explanations, "当前风险概率处于中间区间，建议结合近期行为变化持续观察。")
        else:
            _append_unique(explanations, "当前风险概率整体较低，说明近期整体状态相对稳定。")

    explanation_specs = [
        ("学习投入", "study_index", "当前学习投入高于整体参考水平。", "当前学习投入低于整体参考水平，是优先补强的方向。"),
        ("行为规律", "self_discipline_index", "当前行为规律较稳定，作息与日常节奏保持较好。", "当前行为规律维度偏弱，日常节奏仍有优化空间。"),
        ("健康发展", "health_index", "当前健康发展维度处于较好水平。", "当前健康发展维度偏弱，建议关注休息、运动和身体状态。"),
        ("综合发展", "development_index", "当前综合发展动能较强。", "当前综合发展动能偏弱，建议逐步补强课程、实践和成长活动。"),
    ]
    for _, key, high_text, low_text in explanation_specs:
        value = metrics.get(key)
        overall = comparisons.get("overall_mean", {}).get(key)
        if value is None or overall in (None, 0):
            continue
        if value >= overall * 1.05:
            _append_unique(explanations, high_text)
        elif value <= overall * 0.95:
            _append_unique(explanations, low_text)

    if cluster_traits:
        _append_unique(explanations, f"当前学生归入“{student_profile['cluster_label']}”，这一群体常见特征包括：{'、'.join(cluster_traits)}。")

    return explanations[:6]


def _build_suggestions(student_profile: dict, risk_level: str) -> list[str]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]
    basic_info = student_profile["basic_info"]
    cluster_label = student_profile["cluster_label"]
    performance_level = basic_info.get("performance_level", "")
    suggestions: list[str] = []

    study_score = _safe_float(metrics.get("study_index"), 50)
    self_score = _safe_float(metrics.get("self_discipline_index"), 50)
    health_score = _safe_float(metrics.get("health_index"), 50)
    development_score = _safe_float(metrics.get("development_index"), 50)
    study_time = _safe_float(metrics.get("study_time"), 0)
    library_count = _safe_float(metrics.get("library_count"), 0)
    night_ratio = _safe_float(metrics.get("night_net_ratio"), 0)
    risk_prob = _safe_float(metrics.get("risk_prob"), 0)

    overall_study = _safe_float(comparisons.get("overall_mean", {}).get("study_index"), 50)
    overall_self = _safe_float(comparisons.get("overall_mean", {}).get("self_discipline_index"), 50)
    overall_health = _safe_float(comparisons.get("overall_mean", {}).get("health_index"), 50)
    overall_dev = _safe_float(comparisons.get("overall_mean", {}).get("development_index"), 50)
    overall_library = _safe_float(comparisons.get("overall_mean", {}).get("library_count"), 0)
    overall_night = _safe_float(comparisons.get("overall_mean", {}).get("night_net_ratio"), 0)
    study_text = f"{study_score:.1f} 分"
    self_text = f"{self_score:.1f} 分"
    health_text = f"{health_score:.1f} 分"
    development_text = f"{development_score:.1f} 分"
    library_text = f"{library_count:.0f} 次"
    night_text = f"{night_ratio * 100:.1f}%"

    if risk_level == "高风险":
        _append_unique(
            suggestions,
            f"当前风险较高，建议先把近期目标缩小到一到两个最关键的学习任务，并按周记录完成情况，优先把节奏稳住。",
            f"建议将当前学生纳入重点关注名单，优先跟踪最近两周的学习投入、作息节奏和课程完成情况。",
        )
    elif risk_level == "中风险":
        _append_unique(suggestions, "建议每周做一次简短复盘，重点关注学习投入、夜间活跃和课程完成情况是否出现连续波动。")

    cluster_specific = {
        "高投入稳健型": f"当前属于高投入稳健型，学习投入约 {study_text}，更适合从“保持稳定 + 适度拔高”入手，避免因为追求过多目标打乱已有节奏。",
        "低投入风险型": f"当前属于低投入风险型，学习投入约 {study_text}、图书馆打卡约 {library_text}，建议先补学习投入和线下学习场景，再逐步恢复到稳定节奏。",
        "夜间波动型": f"当前属于夜间波动型，夜间活跃占比约 {night_text}，最需要优先处理作息偏移问题，作息稳住后其余维度通常会更容易改善。",
        "发展过渡型": f"当前属于发展过渡型，综合发展约 {development_text}，建议避免频繁切换方向，优先选择一条能连续积累的成长路径。",
    }
    _append_unique(suggestions, cluster_specific.get(cluster_label, "建议围绕当前最弱维度持续补强，并定期复盘变化。"))

    if study_score <= min(45, overall_study):
        _append_unique(
            suggestions,
            f"当前学习投入约 {study_text}，建议先固定每周的学习时间块，例如把晚间两个稳定时段留给课程复习和任务整理，逐步把学习投入拉回稳定区间。",
        )
    elif study_score >= 75 and performance_level not in {"低表现", "中表现"}:
        _append_unique(
            suggestions,
            f"当前学习投入约 {study_text}，基础已经比较好，建议把一部分精力转向更有挑战的课程项目、竞赛或实践任务，提升成长上限。",
        )

    if library_count <= max(20, overall_library * 0.8):
        _append_unique(
            suggestions,
            f"当前图书馆打卡约 {library_text}，建议增加线下学习场景的使用频率，例如固定去图书馆或自习教室完成高专注任务，帮助建立更稳定的学习环境。",
        )
    elif library_count >= max(60, overall_library * 1.2):
        _append_unique(
            suggestions,
            f"当前图书馆打卡约 {library_text}，线下学习资源利用已经比较积极，建议继续保持，并把图书馆时间优先用于高难度课程或需要深度专注的任务。",
        )

    if self_score <= min(45, overall_self):
        _append_unique(
            suggestions,
            f"当前行为规律约 {self_text}，建议把每天的关键事项控制在少量可完成的范围内，并提前规划第二天任务，降低节奏被打乱的概率。",
        )

    if night_ratio >= max(0.08, overall_night * 1.2):
        _append_unique(
            suggestions,
            f"当前夜间活跃占比约 {night_text}，建议把高强度娱乐或上网行为前移，睡前尽量只保留轻量任务，减少作息继续后移的风险。",
        )
    elif night_ratio == 0 and self_score >= 65:
        _append_unique(
            suggestions,
            "当前夜间活跃控制得较好，建议继续保持稳定作息，把精力更多投向白天和晚间前段的高效学习时段。",
        )

    if health_score <= min(45, overall_health):
        _append_unique(
            suggestions,
            f"当前健康发展约 {health_text}，建议先从可持续的小习惯开始，比如固定步行、轻量运动和规律休息，把身心状态稳住后再增加任务强度。",
        )
    elif health_score >= 75:
        _append_unique(
            suggestions,
            f"当前健康发展约 {health_text}，身心状态基础较好，建议继续保持规律运动和休息，让健康状态成为支撑学习稳定性的优势项。",
        )

    if development_score <= min(45, overall_dev):
        _append_unique(
            suggestions,
            f"当前综合发展约 {development_text}，建议补充一项能持续积累的成长任务，例如课程项目、实践记录或社团职责，逐步提升综合发展动能。",
        )
    elif development_score >= 75:
        _append_unique(
            suggestions,
            f"当前综合发展约 {development_text}，动能较强，建议主动争取更高质量的实践、竞赛或科研体验，进一步放大当前优势。",
        )

    if performance_level == "低表现":
        _append_unique(
            suggestions,
            "当前学业表现偏弱，建议先围绕近期课程成绩做针对性补短，把最影响整体表现的薄弱科目优先稳住。",
        )
    elif performance_level == "高表现":
        _append_unique(
            suggestions,
            "当前学业表现较好，建议在保持稳定成绩的同时，把优势课程沉淀成作品、项目或更高层次的实践成果。",
        )

    if study_time and study_time > 0 and study_score <= 45:
        _append_unique(
            suggestions,
            "当前学习时长原始值并不算少，但投入效果仍偏弱，建议把重点从“延长时间”转向“优化学习结构和任务质量”。",
        )

    if risk_prob >= 0.5 and performance_level == "低表现":
        _append_unique(
            suggestions,
            "如果近期已经连续出现任务拖延、成绩下滑或作息失衡，建议尽快寻求辅导员、任课老师或学习伙伴的外部支持。",
        )

    balanced_state = (
        study_score >= 55
        and self_score >= 55
        and health_score >= 55
        and development_score >= 55
        and risk_level == "低风险"
    )
    if balanced_state:
        _append_unique(suggestions, "建议保持当前节奏，并按月复盘一次学习投入和行为规律，避免状态在高压阶段突然波动。")

    if not suggestions:
        _append_unique(suggestions, "建议保持当前节奏，并持续观察学习投入、行为规律和综合发展三个维度的变化。")
    return suggestions[:8]


def generate_report(student_id: str, master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    frame = _load_master(master_path)
    matched = frame[frame["student_id"].astype(str).str.lower() == str(student_id).strip().lower()]
    if matched.empty:
        raise ValueError("学生不存在")

    row = matched.iloc[0]
    group_profile = _build_group_profile(frame)
    cluster_value = row.get("cluster")
    cluster_label = _cluster_label(cluster_value)
    cluster_frame = frame[frame["cluster"] == cluster_value].copy() if pd.notna(cluster_value) else frame.iloc[0:0].copy()

    metrics = {
        "study_index": _get_display_value(row, "study_index", 50),
        "self_discipline_index": _get_display_value(row, "self_discipline_index", 50),
        "health_index": _get_display_value(row, "health_index", 50),
        "development_index": _get_display_value(row, "development_index", 50),
        "risk_prob": _safe_float(row.get("risk_prob"), 0.0),
        "study_time": _safe_float(row.get("study_time"), 0.0),
        "library_count": _safe_float(row.get("library_count"), 0.0),
        "night_net_ratio": _safe_float(row.get("night_net_ratio"), 0.0),
    }
    raw_metrics = {
        "study_index": _safe_float(row.get("study_index"), 0.0),
        "self_discipline_index": _safe_float(row.get("self_discipline_index"), 0.0),
        "health_index": _safe_float(row.get("health_index"), 0.0),
        "risk_index": _safe_float(row.get("risk_index"), 0.0),
        "development_index": _safe_float(row.get("development_index"), 0.0),
    }

    overall_mean = group_profile["overall_mean"]
    cluster_mean = (
        cluster_frame[
            [
                "study_index_display",
                "self_discipline_index_display",
                "health_index_display",
                "development_index_display",
                "risk_prob",
                "study_time",
                "library_count",
                "night_net_ratio",
            ]
        ].mean(numeric_only=True)
        if not cluster_frame.empty
        else pd.Series(dtype=float)
    )
    comparisons = {
        "overall_mean": {
            "study_index": _safe_float(overall_mean.get("study_index_display"), 0.0),
            "self_discipline_index": _safe_float(overall_mean.get("self_discipline_index_display"), 0.0),
            "health_index": _safe_float(overall_mean.get("health_index_display"), 0.0),
            "development_index": _safe_float(overall_mean.get("development_index_display"), 0.0),
            "risk_prob": _safe_float(overall_mean.get("risk_prob"), 0.0),
            "study_time": _safe_float(frame["study_time"].mean(), 0.0),
            "library_count": _safe_float(frame["library_count"].mean(), 0.0),
            "night_net_ratio": _safe_float(frame["night_net_ratio"].mean(), 0.0),
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
        {"indicator": "学习投入", "key": "study_index", "value": round(metrics["study_index"], 1)},
        {"indicator": "行为规律", "key": "self_discipline_index", "value": round(metrics["self_discipline_index"], 1)},
        {"indicator": "健康发展", "key": "health_index", "value": round(metrics["health_index"], 1)},
        {"indicator": "综合发展", "key": "development_index", "value": round(metrics["development_index"], 1)},
        {"indicator": "风险安全", "key": "risk_prob", "value": round((1 - metrics["risk_prob"]) * 100, 1)},
    ]

    student_profile = {
        "student_id": str(row.get("student_id")),
        "basic_info": {
            "student_id": str(row.get("student_id")),
            "name": _safe_text(row.get("name")) or str(row.get("student_id")),
            "college": _safe_text(row.get("college")),
            "major": _safe_text(row.get("major")),
            "performance_level": _safe_text(row.get("performance_level")),
        },
        "metrics": metrics,
        "raw_metrics": raw_metrics,
        "radar_data": radar_data,
        "comparisons": comparisons,
        "cluster": cluster_value,
        "cluster_label": cluster_label,
        "cluster_traits": _describe_cluster_traits(cluster_mean, pd.Series(overall_mean)),
    }

    thresholds = get_risk_level_thresholds(master_path)
    risk_prob = metrics.get("risk_prob")
    risk_level = classify_risk_level(risk_prob, thresholds=thresholds, master_path=master_path)
    risk_dimensions = _build_risk_dimensions(metrics, comparisons)
    explanations = _build_explanations(student_profile, risk_level)
    suggestions = _build_suggestions(student_profile, risk_level)

    return {
        "basic_info": student_profile["basic_info"],
        "individual_profile": {
            "metrics": student_profile["metrics"],
            "raw_metrics": student_profile["raw_metrics"],
            "radar_data": student_profile["radar_data"],
            "comparisons": student_profile["comparisons"],
        },
        "group_profile": {
            "cluster": student_profile.get("cluster"),
            "cluster_label": student_profile.get("cluster_label"),
            "cluster_traits": student_profile.get("cluster_traits", []),
            "cluster_distribution": group_profile.get("cluster_distribution", []),
        },
        "risk_result": {
            "risk_prob": risk_prob,
            "risk_level": risk_level,
            "cluster": student_profile.get("cluster"),
            "cluster_label": student_profile.get("cluster_label"),
            "risk_dimensions": risk_dimensions,
        },
        "explanations": explanations,
        "suggestions": suggestions,
    }


def export_sample_report(student_id: str, output_path: str | Path | None = None) -> Path:
    report = generate_report(student_id)
    path = Path(output_path) if output_path else DEFAULT_SAMPLE_REPORT_DIR / f"{student_id}.json"
    if not path.is_absolute():
        path = DEFAULT_SAMPLE_REPORT_DIR / path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_to_json_ready(report), ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="生成学生个性化分析报告。")
    parser.add_argument("student_id", help="学生学号")
    parser.add_argument("--master-path", dest="master_path", default=str(DEFAULT_MASTER_PATH), help="analysis_master.csv 路径")
    parser.add_argument("--output", dest="output_path", help="导出 JSON 路径")
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    output = export_sample_report(args.student_id, args.output_path)
    print(f"报告已导出到: {output}")


if __name__ == "__main__":
    main()
