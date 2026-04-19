from __future__ import annotations

import argparse
import json
from pathlib import Path

try:
    import pandas as pd
except ImportError as exc:
    raise ImportError("analysis/api_payload_builder.py 依赖 pandas。") from exc

try:
    from .data_prepare import DEFAULT_MASTER_PATH, load_analysis_master
    from .profile_generator import generate_group_profile, generate_student_profile
    from .report_generator import (
        classify_risk_level,
        generate_report,
        get_risk_level_thresholds,
    )
except ImportError:
    from data_prepare import DEFAULT_MASTER_PATH, load_analysis_master
    from profile_generator import generate_group_profile, generate_student_profile
    from report_generator import classify_risk_level, generate_report, get_risk_level_thresholds


DEFAULT_PAYLOAD_OUTPUT_DIR = Path(__file__).resolve().parent / "outputs" / "api_payloads"

CORE_METRIC_FIELDS = [
    "study_time",
    "library_count",
    "night_net_ratio",
    "study_index",
    "self_discipline_index",
    "health_index",
    "development_index",
]


def _load_student_row(student_id: str, master_path: str | Path = DEFAULT_MASTER_PATH) -> pd.Series:
    master = load_analysis_master(master_path=master_path, rebuild_if_missing=True).copy()
    matched = master[master["student_id"].astype(str).str.lower() == str(student_id).strip().lower()]
    if matched.empty:
        raise ValueError(f"未找到学生: {student_id}")
    return matched.iloc[0]


def _build_level_distribution(master_path: str | Path = DEFAULT_MASTER_PATH) -> list[dict]:
    master = load_analysis_master(master_path=master_path, rebuild_if_missing=True).copy()
    thresholds = get_risk_level_thresholds(master_path)
    master["risk_prob"] = pd.to_numeric(master["risk_prob"], errors="coerce")
    master = master[master["risk_prob"].notna()].copy()
    master["risk_level"] = master["risk_prob"].apply(
        lambda value: classify_risk_level(value, thresholds=thresholds, master_path=master_path)
    )

    total = max(len(master), 1)
    distribution = []
    for level in ["低风险", "中风险", "高风险"]:
        count = int((master["risk_level"] == level).sum())
        distribution.append(
            {
                "risk_level": level,
                "count": count,
                "ratio": round(count / total, 4),
            }
        )
    return distribution


def build_student_detail_payload(
    student_id: str,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> dict:
    row = _load_student_row(student_id, master_path)
    report = generate_report(student_id, master_path=master_path)

    return {
        "page": "student_detail",
        "basic_info": {
            "student_id": report["basic_info"]["student_id"],
            "college": report["basic_info"]["college"],
            "major": report["basic_info"]["major"],
        },
        "summary": {
            "risk_level": report["risk_result"]["risk_level"],
            "risk_prob": report["risk_result"]["risk_prob"],
            "cluster": report["risk_result"]["cluster"],
            "cluster_label": report["risk_result"]["cluster_label"],
            "performance_level": row.get("performance_level"),
        },
        "core_metrics": {field: report["individual_profile"]["metrics"].get(field) for field in CORE_METRIC_FIELDS},
    }


def build_individual_profile_payload(
    student_id: str,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> dict:
    profile = generate_student_profile(student_id, master_path=master_path)

    return {
        "page": "individual_profile",
        "basic_info": profile["basic_info"],
        "radar_profile": profile["radar_data"],
        "metric_snapshot": profile["metrics"],
        "comparison": profile["comparisons"],
        "cluster_profile": {
            "cluster": profile["risk_result"]["cluster"],
            "cluster_label": profile["risk_result"]["cluster_label"],
            "cluster_traits": profile["cluster_traits"],
        },
    }


def build_group_profile_payload(master_path: str | Path = DEFAULT_MASTER_PATH) -> dict:
    group_profile = generate_group_profile(master_path=master_path)

    cluster_cards = []
    for cluster_item in group_profile["cluster_distribution"]:
        cluster_key = str(cluster_item["cluster"])
        cluster_cards.append(
            {
                "cluster": cluster_item["cluster"],
                "cluster_label": cluster_item["label"],
                "count": cluster_item["count"],
                "ratio": cluster_item["ratio"],
                "traits": group_profile["feature_means"][cluster_key]["traits"],
                "means": group_profile["feature_means"][cluster_key]["means"],
                "risk_ratio": group_profile["feature_means"][cluster_key]["risk_ratio"],
            }
        )

    return {
        "page": "group_profile",
        "overview": {
            "total_students": group_profile["total_students"],
            "cluster_count": len(group_profile["cluster_distribution"]),
        },
        "cluster_label_map": group_profile["cluster_label_map"],
        "cluster_distribution": group_profile["cluster_distribution"],
        "cluster_cards": cluster_cards,
        "overall_means": group_profile["overall_means"],
        "risk_distribution": group_profile["risk_distribution"],
    }


def build_risk_analysis_payload(
    student_id: str | None = None,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> dict:
    thresholds = get_risk_level_thresholds(master_path)
    level_distribution = _build_level_distribution(master_path)

    payload = {
        "page": "risk_analysis",
        "thresholds": thresholds,
        "level_distribution": level_distribution,
        "risk_dimensions": [
            {
                "dimension": "学习投入风险",
                "description": "由学习指数、学习时长和图书馆活跃度共同反映。",
            },
            {
                "dimension": "行为规律风险",
                "description": "由自律指数和夜间上网比例共同反映。",
            },
            {
                "dimension": "健康发展风险",
                "description": "由健康指数和综合发展指数共同反映。",
            },
        ],
    }

    if student_id is not None:
        report = generate_report(student_id, master_path=master_path)
        payload["focus_student"] = {
            "student_id": report["basic_info"]["student_id"],
            "college": report["basic_info"]["college"],
            "major": report["basic_info"]["major"],
            "risk_result": report["risk_result"],
        }

    return payload


def build_report_page_payload(
    student_id: str,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> dict:
    report = generate_report(student_id, master_path=master_path)
    return {
        "page": "report_page",
        "basic_info": report["basic_info"],
        "individual_profile": report["individual_profile"],
        "group_profile": report["group_profile"],
        "risk_result": report["risk_result"],
        "explanations": report["explanations"],
        "suggestions": report["suggestions"],
    }


def build_all_page_payloads(
    student_id: str,
    master_path: str | Path = DEFAULT_MASTER_PATH,
) -> dict[str, dict]:
    return {
        "student_detail": build_student_detail_payload(student_id, master_path=master_path),
        "individual_profile": build_individual_profile_payload(student_id, master_path=master_path),
        "group_profile": build_group_profile_payload(master_path=master_path),
        "risk_analysis": build_risk_analysis_payload(student_id=student_id, master_path=master_path),
        "report_page": build_report_page_payload(student_id, master_path=master_path),
    }


def export_payload_bundle(
    student_id: str,
    master_path: str | Path = DEFAULT_MASTER_PATH,
    output_dir: str | Path = DEFAULT_PAYLOAD_OUTPUT_DIR,
) -> dict[str, str]:
    payloads = build_all_page_payloads(student_id, master_path=master_path)
    target = Path(output_dir)
    if not target.is_absolute():
        target = Path(__file__).resolve().parents[1] / target
    target.mkdir(parents=True, exist_ok=True)

    saved_paths: dict[str, str] = {}
    for payload_name, payload in payloads.items():
        output_path = target / f"{payload_name}_{student_id}.json"
        output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        saved_paths[payload_name] = str(output_path.resolve())
    return saved_paths


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="构造前端页面可直接使用的分析 JSON 载荷。")
    parser.add_argument("student_id", help="学生学号")
    parser.add_argument(
        "--master-path",
        default=str(DEFAULT_MASTER_PATH),
        help="analysis_master.csv 路径",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_PAYLOAD_OUTPUT_DIR),
        help="前端 JSON 载荷输出目录",
    )
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    saved = export_payload_bundle(
        student_id=args.student_id,
        master_path=args.master_path,
        output_dir=args.output_dir,
    )
    print(json.dumps(saved, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
