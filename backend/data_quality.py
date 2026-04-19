from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class FieldRule:
    key: str
    label: str
    nonnegative: bool = False
    ratio: bool = False
    integer_like: bool = False


FIELD_RULES = (
    FieldRule("study_time", "学习时长", nonnegative=True),
    FieldRule("library_count", "图书馆访问次数", nonnegative=True, integer_like=True),
    FieldRule("consume_avg", "日均消费", nonnegative=True),
    FieldRule("night_net_ratio", "夜间上网占比", nonnegative=True, ratio=True),
    FieldRule("risk_prob", "风险概率", nonnegative=True, ratio=True),
    FieldRule("study_index", "学习指数"),
    FieldRule("self_discipline_index", "行为规律指数"),
    FieldRule("health_index", "健康指数"),
    FieldRule("risk_index", "风险指数"),
    FieldRule("development_index", "综合发展指数"),
)


def _safe_number(value: Any, digits: int = 4) -> float | None:
    try:
        if value is None or pd.isna(value):
            return None
        return round(float(value), digits)
    except Exception:
        return None


class DataQualityService:
    def __init__(self, repository) -> None:
        self.repository = repository
        self._cache: dict[str, Any] | None = None

    def build_dataset_report(self) -> dict[str, Any]:
        if self._cache is not None:
            return self._cache

        frame = self.repository.load_analysis_frame() if self.repository is not None else None
        if frame is None or frame.empty:
            self._cache = {
                "generatedAt": datetime.now().isoformat(timespec="seconds"),
                "summary": {
                    "rowCount": 0,
                    "fieldCount": len(FIELD_RULES),
                    "missingHeavyFields": 0,
                    "zeroInflatedFields": 0,
                    "longTailFields": 0,
                    "invalidFields": 0,
                },
                "fields": [],
            }
            return self._cache

        field_reports: list[dict[str, Any]] = []
        missing_heavy_fields = 0
        zero_inflated_fields = 0
        long_tail_fields = 0
        invalid_fields = 0

        for rule in FIELD_RULES:
            series = pd.to_numeric(frame.get(rule.key), errors="coerce")
            total = len(series)
            clean = series.dropna()
            missing_count = int(series.isna().sum())
            zero_count = int((clean == 0).sum()) if not clean.empty else 0
            missing_rate = missing_count / total if total else 0.0
            zero_rate = zero_count / len(clean) if len(clean) else 0.0

            p01 = clean.quantile(0.01) if not clean.empty else np.nan
            p50 = clean.quantile(0.50) if not clean.empty else np.nan
            p99 = clean.quantile(0.99) if not clean.empty else np.nan
            q1 = clean.quantile(0.25) if not clean.empty else np.nan
            q3 = clean.quantile(0.75) if not clean.empty else np.nan
            iqr = q3 - q1 if not clean.empty else np.nan
            lower_bound = q1 - 1.5 * iqr if pd.notna(iqr) else np.nan
            upper_bound = q3 + 1.5 * iqr if pd.notna(iqr) else np.nan
            outlier_mask = (
                (clean < lower_bound) | (clean > upper_bound)
                if pd.notna(lower_bound) and pd.notna(upper_bound)
                else pd.Series([False] * len(clean), index=clean.index)
            )
            outlier_count = int(outlier_mask.sum())
            outlier_rate = outlier_count / len(clean) if len(clean) else 0.0
            skewness = float(clean.skew()) if len(clean) >= 3 else 0.0

            distribution_tags: list[str] = []
            validation_issues: list[str] = []

            if missing_rate >= 0.1:
                distribution_tags.append("missing_heavy")
                missing_heavy_fields += 1
            if zero_rate >= 0.6:
                distribution_tags.append("zero_inflated")
                zero_inflated_fields += 1
            if pd.notna(p99) and p99 not in (0, np.nan):
                max_value = float(clean.max()) if not clean.empty else 0.0
                if max_value / max(float(p99), 1e-9) >= 5:
                    distribution_tags.append("long_tail")
                    long_tail_fields += 1
            if abs(skewness) >= 2:
                distribution_tags.append("high_skew")
            if outlier_rate >= 0.05:
                distribution_tags.append("outlier_heavy")

            if rule.nonnegative and not clean.empty and float(clean.min()) < 0:
                validation_issues.append("存在小于 0 的非法值")
            if rule.ratio and not clean.empty:
                if float(clean.min()) < 0 or float(clean.max()) > 1:
                    validation_issues.append("比例字段超出 0 到 1 的合法范围")
            if rule.integer_like and not clean.empty:
                non_integer_count = int((np.abs(clean - np.round(clean)) > 1e-6).sum())
                if non_integer_count > 0:
                    validation_issues.append("整数型字段存在非整数值")

            if validation_issues:
                invalid_fields += 1

            field_reports.append(
                {
                    "key": rule.key,
                    "label": rule.label,
                    "missingRate": round(missing_rate, 4),
                    "zeroRate": round(zero_rate, 4),
                    "outlierRate": round(outlier_rate, 4),
                    "skewness": round(skewness, 4),
                    "distributionTags": distribution_tags,
                    "validationIssues": validation_issues,
                    "range": {
                        "min": _safe_number(clean.min(), 4) if not clean.empty else None,
                        "p01": _safe_number(p01, 4),
                        "p50": _safe_number(p50, 4),
                        "p99": _safe_number(p99, 4),
                        "max": _safe_number(clean.max(), 4) if not clean.empty else None,
                    },
                }
            )

        self._cache = {
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "summary": {
                "rowCount": int(len(frame)),
                "fieldCount": len(FIELD_RULES),
                "missingHeavyFields": missing_heavy_fields,
                "zeroInflatedFields": zero_inflated_fields,
                "longTailFields": long_tail_fields,
                "invalidFields": invalid_fields,
            },
            "fields": field_reports,
        }
        return self._cache

    def build_student_alerts(self, row) -> list[dict[str, Any]]:
        report = self.build_dataset_report()
        if row is None:
            return []
        row_get = row.get if hasattr(row, "get") else lambda *_: None

        alerts: list[dict[str, Any]] = []
        for field in report.get("fields", []):
            key = field["key"]
            label = field["label"]
            value = _safe_number(row_get(key), 4)
            if value is None:
                alerts.append(
                    {
                        "field": key,
                        "label": label,
                        "severity": "medium",
                        "type": "missing",
                        "description": f"{label}当前缺失，建议确认原始数据是否完整。",
                    }
                )
                continue

            range_info = field.get("range", {})
            p01 = range_info.get("p01")
            p99 = range_info.get("p99")
            validation_issues = field.get("validationIssues", [])

            if validation_issues:
                if "比例字段超出 0 到 1 的合法范围" in validation_issues and (value < 0 or value > 1):
                    alerts.append(
                        {
                            "field": key,
                            "label": label,
                            "severity": "high",
                            "type": "invalid_range",
                            "description": f"{label}取值为 {value}，超出了合法范围。",
                        }
                    )
                    continue
                if "存在小于 0 的非法值" in validation_issues and value < 0:
                    alerts.append(
                        {
                            "field": key,
                            "label": label,
                            "severity": "high",
                            "type": "invalid_negative",
                            "description": f"{label}取值为 {value}，不应出现负值。",
                        }
                    )
                    continue

            if p99 is not None and value > p99:
                alerts.append(
                    {
                        "field": key,
                        "label": label,
                        "severity": "medium",
                        "type": "high_outlier",
                        "description": f"{label}高于样本 P99，属于偏高异常值。",
                    }
                )
            elif p01 is not None and value < p01:
                alerts.append(
                    {
                        "field": key,
                        "label": label,
                        "severity": "medium",
                        "type": "low_outlier",
                        "description": f"{label}低于样本 P01，属于偏低异常值。",
                    }
                )

        return alerts[:8]
