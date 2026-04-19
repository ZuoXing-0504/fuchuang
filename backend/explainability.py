from __future__ import annotations

from typing import Any


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def _priority_from_impact(impact: float) -> str:
    if impact >= 0.6:
        return "high"
    if impact >= 0.3:
        return "medium"
    return "low"


def build_risk_drivers(report: dict[str, Any], quality_alerts: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    quality_alerts = quality_alerts or []
    metrics = report.get("individual_profile", {}).get("metrics", {})
    comparisons = report.get("individual_profile", {}).get("comparisons", {})
    overall_mean = comparisons.get("overall_mean", {})
    cluster_mean = comparisons.get("cluster_mean", {})

    driver_specs = [
        {
            "label": "学习投入",
            "metric_key": "study_index",
            "feature_keys": ("study_time", "library_count"),
            "category": "学业",
            "low_message": "学习投入低于主要参考水平，说明当前的课程投入和线下学习节奏偏弱。",
            "high_message": "学习投入高于主要参考水平，属于当前阶段的相对优势。",
            "action": "优先固定每周学习时间块，并增加稳定的线下学习场景。",
        },
        {
            "label": "行为规律",
            "metric_key": "self_discipline_index",
            "feature_keys": ("night_net_ratio",),
            "category": "作息",
            "low_message": "行为规律维度偏弱，夜间活跃和节律波动正在拉高风险。",
            "high_message": "行为规律维度较稳，对整体风险有明显缓冲作用。",
            "action": "优先把夜间活跃前移到白天或晚间前段，减少作息继续后移。",
        },
        {
            "label": "健康发展",
            "metric_key": "health_index",
            "feature_keys": (),
            "category": "健康",
            "low_message": "健康发展维度偏弱，会直接影响学习连续性和状态稳定性。",
            "high_message": "健康发展维度较稳，是当前保持状态的重要支撑。",
            "action": "先恢复规律休息和轻量运动，再逐步提升任务强度。",
        },
        {
            "label": "综合发展",
            "metric_key": "development_index",
            "feature_keys": (),
            "category": "综合",
            "low_message": "综合发展动能偏弱，意味着成长任务的持续积累还不够。",
            "high_message": "综合发展动能较好，具备进一步拔高的空间。",
            "action": "选择一条能持续积累的课程、项目或实践主线持续推进。",
        },
    ]

    alert_map = {}
    for alert in quality_alerts:
        alert_map.setdefault(alert.get("field"), []).append(alert.get("description"))

    drivers = []
    for spec in driver_specs:
        metric_key = spec["metric_key"]
        self_score = _safe_float(metrics.get(metric_key), 50.0)
        overall_score = _safe_float(overall_mean.get(metric_key), self_score or 50.0)
        cluster_score = _safe_float(cluster_mean.get(metric_key), overall_score)
        reference_score = max(overall_score, cluster_score, 1.0)

        if self_score <= reference_score:
            impact = min(1.0, max(0.0, (reference_score - self_score) / reference_score))
            description = f"{spec['low_message']} 当前分数 {self_score:.1f}，全样本均值 {overall_score:.1f}，同画像均值 {cluster_score:.1f}。"
        else:
            impact = min(0.35, max(0.0, (self_score - reference_score) / max(self_score, 1.0)))
            description = f"{spec['high_message']} 当前分数 {self_score:.1f}，全样本均值 {overall_score:.1f}，同画像均值 {cluster_score:.1f}。"

        related_alerts = []
        for key in spec["feature_keys"]:
            related_alerts.extend(alert_map.get(key, []))
        if related_alerts:
            description += " 数据质量提示：" + "；".join(related_alerts[:2])

        drivers.append(
            {
                "feature": spec["label"],
                "impact": round(impact, 4),
                "category": spec["category"],
                "description": description,
                "action": spec["action"],
            }
        )

    drivers.sort(key=lambda item: item["impact"], reverse=True)
    return drivers


def build_structured_actions(drivers: list[dict[str, Any]], suggestions: list[str] | None = None) -> list[dict[str, Any]]:
    suggestions = suggestions or []
    actions = []
    for index, driver in enumerate(drivers[:4], start=1):
        actions.append(
            {
                "id": f"ACTION-{index}",
                "category": driver.get("category") or "综合",
                "priority": _priority_from_impact(_safe_float(driver.get("impact"), 0.0)),
                "title": f"优先处理{driver.get('feature')}",
                "description": driver.get("action") or driver.get("description") or "",
                "reason": driver.get("description") or "",
            }
        )

    for suggestion in suggestions:
        if len(actions) >= 6:
            break
        actions.append(
            {
                "id": f"ACTION-{len(actions) + 1}",
                "category": "综合",
                "priority": "medium",
                "title": suggestion[:18] + ("..." if len(suggestion) > 18 else ""),
                "description": suggestion,
                "reason": "来自系统生成的干预建议。",
            }
        )

    return actions
