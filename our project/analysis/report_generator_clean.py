from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

try:
    from .data_prepare_clean import DEFAULT_MASTER_PATH, load_analysis_master
    from .profile_generator_clean import generate_group_profile, generate_student_profile
except ImportError:
    from data_prepare_clean import DEFAULT_MASTER_PATH, load_analysis_master
    from profile_generator_clean import generate_group_profile, generate_student_profile


DEFAULT_SAMPLE_REPORT_DIR = Path(__file__).resolve().parent / "outputs" / "reports" / "samples"


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


def get_risk_level_thresholds(master_path: str | Path = DEFAULT_MASTER_PATH) -> dict[str, float]:
    master = load_analysis_master(master_path=master_path, rebuild_if_missing=True)
    risk_prob = pd.to_numeric(master["risk_prob"], errors="coerce").dropna()
    if risk_prob.empty:
        return {"low_upper": 0.33, "medium_upper": 0.67}
    return {
        "low_upper": round(float(risk_prob.quantile(0.33)), 6),
        "medium_upper": round(float(risk_prob.quantile(0.67)), 6),
    }


def classify_risk_level(
    risk_prob: float | None,
    thresholds: dict[str, float] | None = None,
    *,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> str:
    if risk_prob is None:
        return "未知风险"
    if thresholds is None:
        thresholds = get_risk_level_thresholds(master_path)
    if risk_prob <= thresholds["low_upper"]:
        return "低风险"
    if risk_prob <= thresholds["medium_upper"]:
        return "中风险"
    return "高风险"


def _build_risk_dimensions(student_profile: dict) -> list[dict]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]
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
            "summary": "结合学习投入展示分、学习时长和图书馆活跃度判断当前投入是否充足。",
        },
        {
            "dimension": "行为规律",
            "status": build_status(metrics.get("night_net_ratio"), overall_mean.get("night_net_ratio"), reverse=True),
            "indicators": ["self_discipline_index", "night_net_ratio"],
            "summary": "结合行为规律展示分与夜间上网占比判断日常节律是否稳定。",
        },
        {
            "dimension": "健康发展",
            "status": build_status(metrics.get("health_index"), overall_mean.get("health_index")),
            "indicators": ["health_index", "development_index"],
            "summary": "结合健康发展展示分与综合发展展示分观察身心状态与成长稳定性。",
        },
    ]


def _build_explanations(student_profile: dict, risk_level: str) -> list[str]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]
    cluster_traits = student_profile.get("cluster_traits", [])
    explanations: list[str] = []

    risk_prob = metrics.get("risk_prob")
    if risk_prob is not None:
        if risk_level == "高风险":
            explanations.append("风险概率处于样本中的较高区间，近期需要优先关注学习投入与行为节律变化。")
        elif risk_level == "中风险":
            explanations.append("风险概率处于样本中的中间区间，当前状态需要持续跟踪。")
        else:
            explanations.append("风险概率整体较低，当前行为表现相对稳定。")

    for label, key, high_text, low_text in [
        ("学习投入", "study_index", "当前学习投入高于整体水平。", "当前学习投入低于整体水平，是优先补强的方向。"),
        ("行为规律", "self_discipline_index", "当前行为规律与自我管理表现较稳。", "当前行为规律维度偏弱，日常节律仍有优化空间。"),
        ("健康发展", "health_index", "当前健康发展维度处于较好水平。", "当前健康发展维度偏弱，建议补充运动与作息管理。"),
        ("综合发展", "development_index", "当前综合成长动能较强。", "当前综合成长动能偏弱，建议通过课程、竞赛和实践补强。"),
    ]:
        value = metrics.get(key)
        overall = comparisons.get("overall_mean", {}).get(key)
        if value is None or overall in (None, 0):
            continue
        if value >= overall * 1.05:
            explanations.append(high_text)
        elif value <= overall * 0.95:
            explanations.append(low_text)

    if student_profile.get("cluster_label"):
        trait_text = "、".join(cluster_traits) if cluster_traits else "暂无显著标签"
        explanations.append(f"该学生当前属于“{student_profile['cluster_label']}”，这一群体常见特征包括：{trait_text}。")

    deduplicated: list[str] = []
    for explanation in explanations:
        if explanation not in deduplicated:
            deduplicated.append(explanation)
    return deduplicated[:6]


def _build_suggestions(student_profile: dict, risk_level: str) -> list[str]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]
    suggestions: list[str] = []

    if risk_level == "高风险":
        suggestions.append("建议将该学生纳入近期重点关注范围，并按周复盘学习节奏、行为波动和课程表现。")

    study_index = metrics.get("study_index")
    overall_study = comparisons.get("overall_mean", {}).get("study_index")
    if study_index is not None and overall_study is not None and study_index <= overall_study * 0.95:
        suggestions.append("建议先从固定自习时段、课程任务清单和图书馆打卡习惯入手，补强学习投入。")

    library_count = metrics.get("library_count")
    overall_library = comparisons.get("overall_mean", {}).get("library_count")
    if library_count is not None and overall_library is not None and library_count <= overall_library * 0.9:
        suggestions.append("建议增加线下学习场景使用频率，优先通过图书馆、自习教室等固定学习场景稳定节奏。")

    self_index = metrics.get("self_discipline_index")
    overall_self = comparisons.get("overall_mean", {}).get("self_discipline_index")
    night_ratio = metrics.get("night_net_ratio")
    overall_night = comparisons.get("overall_mean", {}).get("night_net_ratio")
    if (self_index is not None and overall_self is not None and self_index <= overall_self * 0.95) or (
        night_ratio is not None and overall_night is not None and night_ratio >= overall_night * 1.1
    ):
        suggestions.append("建议减少夜间高活跃时段，建立睡前离线规则，优先改善作息规律。")

    health_index = metrics.get("health_index")
    overall_health = comparisons.get("overall_mean", {}).get("health_index")
    if health_index is not None and overall_health is not None and health_index <= overall_health * 0.95:
        suggestions.append("建议补充规律运动与体能训练安排，先把身体状态稳定下来。")

    development_index = metrics.get("development_index")
    overall_dev = comparisons.get("overall_mean", {}).get("development_index")
    if development_index is not None and overall_dev is not None and development_index <= overall_dev * 0.95:
        suggestions.append("建议通过竞赛、社团、项目或综合测评类活动补强综合发展维度。")

    if not suggestions:
        suggestions.append("建议保持当前节奏，并按月复盘学习投入、行为规律和风险变化。")
    return suggestions[:5]


def generate_report(student_id: str, master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    student_profile = generate_student_profile(student_id, master_path=master_path)
    group_profile = generate_group_profile(master_path=master_path)
    thresholds = get_risk_level_thresholds(master_path)
    risk_prob = student_profile["metrics"].get("risk_prob")
    risk_level = classify_risk_level(risk_prob, thresholds=thresholds, master_path=master_path)
    risk_dimensions = _build_risk_dimensions(student_profile)
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
