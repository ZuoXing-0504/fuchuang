from __future__ import annotations

import argparse
import json
from pathlib import Path

try:
    import pandas as pd
except ImportError as exc:
    raise ImportError("analysis/report_generator.py 依赖 pandas。") from exc

try:
    from .data_prepare import DEFAULT_MASTER_PATH, load_analysis_master
    from .profile_generator import generate_group_profile, generate_student_profile
except ImportError:
    from data_prepare import DEFAULT_MASTER_PATH, load_analysis_master
    from profile_generator import generate_group_profile, generate_student_profile


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
            return "风险中性"
        if ratio <= 0.9:
            return "表现偏弱"
        if ratio >= 1.1:
            return "表现较好"
        return "表现中性"

    return [
        {
            "dimension": "学习投入风险",
            "status": build_status(metrics.get("study_index"), overall_mean.get("study_index")),
            "indicators": ["study_index", "study_time", "library_count"],
            "summary": "结合学习指数、学习时长和图书馆活跃度判断学习投入是否充足。",
        },
        {
            "dimension": "行为规律风险",
            "status": build_status(
                metrics.get("night_net_ratio"),
                overall_mean.get("night_net_ratio"),
                reverse=True,
            ),
            "indicators": ["self_discipline_index", "night_net_ratio"],
            "summary": "结合自律指数和夜间上网比例判断行为规律性是否稳定。",
        },
        {
            "dimension": "健康发展风险",
            "status": build_status(metrics.get("health_index"), overall_mean.get("health_index")),
            "indicators": ["health_index", "development_index"],
            "summary": "结合健康指数和综合发展指数判断身心状态与整体成长表现。",
        },
    ]


def _build_explanations(student_profile: dict, risk_level: str) -> list[str]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]
    risk = student_profile["risk_result"]

    explanations: list[str] = []
    overall_mean = comparisons.get("overall_mean", {})
    percentile_rank = comparisons.get("percentile_rank", {})
    cluster_traits = student_profile.get("cluster_traits", [])

    risk_prob = metrics.get("risk_prob")
    if risk_prob is not None:
        if risk_level == "高风险":
            explanations.append("风险概率处于样本中的较高区间，建议优先关注近期行为波动和学业节奏。")
        elif risk_level == "中风险":
            explanations.append("风险概率处于样本中的中间区间，当前状态需要持续跟踪。")
        else:
            explanations.append("风险概率整体较低，当前行为表现相对稳定。")

    study_index = metrics.get("study_index")
    overall_study_index = overall_mean.get("study_index")
    if study_index is not None and overall_study_index is not None:
        if study_index >= overall_study_index * 1.05:
            explanations.append("该学生在学习投入维度高于总体均值，说明学习参与度相对较好。")
        elif study_index <= overall_study_index * 0.95:
            explanations.append("该学生在学习投入维度低于总体均值，是需要优先补强的信号。")

    self_discipline_index = metrics.get("self_discipline_index")
    overall_self_discipline = overall_mean.get("self_discipline_index")
    if self_discipline_index is not None and overall_self_discipline is not None:
        if self_discipline_index >= overall_self_discipline * 1.05:
            explanations.append("该学生在行为规律与自律维度表现较好，日常节奏相对稳定。")
        elif self_discipline_index <= overall_self_discipline * 0.95:
            explanations.append("该学生在行为规律与自律维度偏弱，说明日常节奏仍有优化空间。")

    health_index = metrics.get("health_index")
    overall_health = overall_mean.get("health_index")
    if health_index is not None and overall_health is not None:
        if health_index >= overall_health * 1.05:
            explanations.append("该学生在健康发展维度高于总体均值，运动与身体状态相对较好。")
        elif health_index <= overall_health * 0.95:
            explanations.append("该学生在健康发展维度偏弱，建议关注运动投入和身体状态。")

    development_index = metrics.get("development_index")
    overall_development = overall_mean.get("development_index")
    if development_index is not None and overall_development is not None:
        if development_index >= overall_development * 1.05:
            explanations.append("该学生在综合发展维度表现较好，整体成长性较强。")
        elif development_index <= overall_development * 0.95:
            explanations.append("该学生在综合发展维度低于总体均值，建议补强综合素养相关活动。")

    if risk.get("cluster_label"):
        trait_text = "、".join(cluster_traits) if cluster_traits else "暂无显著标签"
        explanations.append(
            f"该学生当前属于“{risk['cluster_label']}”群体，该群体的典型特征包括：{trait_text}。"
        )

    if percentile_rank.get("risk_prob") is not None and percentile_rank["risk_prob"] <= 30:
        explanations.append("在全体学生中，该学生在风险安全维度的相对位置偏后，建议尽早介入跟踪。")

    deduplicated: list[str] = []
    for explanation in explanations:
        if explanation not in deduplicated:
            deduplicated.append(explanation)
    return deduplicated[:6]


def _build_suggestions(student_profile: dict, risk_level: str) -> list[str]:
    metrics = student_profile["metrics"]
    comparisons = student_profile["comparisons"]

    suggestions: list[str] = []
    overall_mean = comparisons.get("overall_mean", {})

    if risk_level == "高风险":
        suggestions.append("建议辅导员或班主任将其纳入近期重点关注名单，结合阶段成绩和日常行为做连续观察。")

    study_index = metrics.get("study_index")
    if (
        study_index is not None
        and overall_mean.get("study_index") is not None
        and study_index <= overall_mean["study_index"] * 0.95
    ):
        suggestions.append("建议围绕课堂学习、线上学习和固定自习场景建立更稳定的学习投入计划。")

    library_count = metrics.get("library_count")
    if (
        library_count is not None
        and overall_mean.get("library_count") is not None
        and library_count <= overall_mean["library_count"] * 0.9
    ):
        suggestions.append("建议增加图书馆或固定自习场景打卡频率，提升线下学习稳定性。")

    self_discipline_index = metrics.get("self_discipline_index")
    night_ratio = metrics.get("night_net_ratio")
    if (
        self_discipline_index is not None
        and overall_mean.get("self_discipline_index") is not None
        and self_discipline_index <= overall_mean["self_discipline_index"] * 0.95
    ) or (
        night_ratio is not None
        and overall_mean.get("night_net_ratio") is not None
        and night_ratio >= overall_mean["night_net_ratio"] * 1.1
    ):
        suggestions.append("建议控制夜间上网时段，建立睡前一小时离线规则，优先改善作息规律。")

    health_index = metrics.get("health_index")
    if (
        health_index is not None
        and overall_mean.get("health_index") is not None
        and health_index <= overall_mean["health_index"] * 0.95
    ):
        suggestions.append("建议增加规律运动、体测训练或日常锻炼安排，提升健康发展维度表现。")

    development_index = metrics.get("development_index")
    if (
        development_index is not None
        and overall_mean.get("development_index") is not None
        and development_index <= overall_mean["development_index"] * 0.95
    ):
        suggestions.append("建议结合竞赛、社团、综合测评等活动补强综合发展维度，提升整体成长性。")

    if not suggestions:
        suggestions.append("建议继续保持当前行为节奏，并按月复盘学习投入、自律表现、健康状态和风险变化。")

    return suggestions[:5]


def generate_report(student_id: str, master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    student_profile = generate_student_profile(student_id, master_path=master_path)
    group_profile = generate_group_profile(master_path=master_path)
    thresholds = get_risk_level_thresholds(master_path)
    risk_level = classify_risk_level(
        student_profile["risk_result"].get("risk_prob"),
        thresholds=thresholds,
        master_path=master_path,
    )

    cluster_key = (
        str(student_profile["risk_result"]["cluster"])
        if student_profile["risk_result"]["cluster"] is not None
        else None
    )
    cluster_profile = group_profile["feature_means"].get(cluster_key, {})
    risk_dimensions = _build_risk_dimensions(student_profile)

    report = {
        "basic_info": student_profile["basic_info"],
        "individual_profile": {
            "metrics": student_profile["metrics"],
            "radar_data": student_profile["radar_data"],
            "comparisons": student_profile["comparisons"],
        },
        "group_profile": {
            "cluster": student_profile["risk_result"]["cluster"],
            "cluster_label": student_profile["risk_result"].get("cluster_label"),
            "cluster_traits": cluster_profile.get("traits", []),
            "cluster_means": cluster_profile.get("means", {}),
            "cluster_distribution": group_profile["cluster_distribution"],
        },
        "risk_result": {
            "risk_prob": student_profile["risk_result"]["risk_prob"],
            "risk_label": student_profile["risk_result"]["risk_label"],
            "risk_level": risk_level,
            "risk_thresholds": thresholds,
            "cluster": student_profile["risk_result"]["cluster"],
            "cluster_label": student_profile["risk_result"].get("cluster_label"),
            "risk_dimensions": risk_dimensions,
        },
        "explanations": _build_explanations(student_profile, risk_level),
        "suggestions": _build_suggestions(student_profile, risk_level),
    }
    return _to_json_ready(report)


def generate_sample_reports(
    master_path: str | Path = DEFAULT_MASTER_PATH,
    output_dir: str | Path = DEFAULT_SAMPLE_REPORT_DIR,
) -> dict[str, dict]:
    master = load_analysis_master(master_path=master_path, rebuild_if_missing=True).copy()
    thresholds = get_risk_level_thresholds(master_path)
    master["risk_prob"] = pd.to_numeric(master["risk_prob"], errors="coerce")
    master = master[master["risk_prob"].notna()].copy()
    master["risk_level"] = master["risk_prob"].apply(
        lambda value: classify_risk_level(value, thresholds=thresholds, master_path=master_path)
    )

    target = Path(output_dir)
    if not target.is_absolute():
        target = Path(__file__).resolve().parents[1] / target
    target.mkdir(parents=True, exist_ok=True)

    saved_reports: dict[str, dict] = {}
    for level, prefix in [("低风险", "low_risk"), ("中风险", "medium_risk"), ("高风险", "high_risk")]:
        level_frame = master[master["risk_level"] == level].sort_values("risk_prob").reset_index(drop=True)
        if level_frame.empty:
            continue
        student_row = level_frame.iloc[len(level_frame) // 2]
        student_id = str(student_row["student_id"])
        report = generate_report(student_id, master_path=master_path)
        output_path = target / f"{prefix}_{student_id}.json"
        output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        saved_reports[level] = {
            "student_id": student_id,
            "risk_prob": float(student_row["risk_prob"]),
            "path": str(output_path.resolve()),
        }

    return saved_reports


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="生成学生个性化行为分析报告。")
    parser.add_argument("student_id", nargs="?", help="学生学号")
    parser.add_argument(
        "--master-path",
        default=str(DEFAULT_MASTER_PATH),
        help="analysis_master.csv 路径",
    )
    parser.add_argument("--save-json", dest="save_json", help="将单份报告保存为 JSON 文件")
    parser.add_argument(
        "--generate-samples",
        action="store_true",
        help="生成低风险、中风险、高风险三份样例报告",
    )
    parser.add_argument(
        "--sample-output-dir",
        default=str(DEFAULT_SAMPLE_REPORT_DIR),
        help="样例报告输出目录",
    )
    return parser


def main() -> None:
    args = _build_parser().parse_args()

    if args.generate_samples:
        saved_reports = generate_sample_reports(
            master_path=args.master_path,
            output_dir=args.sample_output_dir,
        )
        print(json.dumps(saved_reports, ensure_ascii=False, indent=2))
        return

    if not args.student_id:
        raise SystemExit("student_id 是必填参数，或使用 --generate-samples 生成样例报告。")

    report = generate_report(args.student_id, master_path=args.master_path)
    output_text = json.dumps(report, ensure_ascii=False, indent=2)

    if args.save_json:
        output_path = Path(args.save_json)
        if not output_path.is_absolute():
            output_path = Path(__file__).resolve().parents[1] / output_path
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output_text, encoding="utf-8")

    print(output_text)


if __name__ == "__main__":
    main()
