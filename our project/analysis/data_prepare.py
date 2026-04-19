from __future__ import annotations

import argparse
from pathlib import Path
from typing import Sequence

import numpy as np

try:
    import pandas as pd
except ImportError as exc:
    raise ImportError(
        "analysis/data_prepare.py 依赖 pandas。请先安装 pandas，"
        "若需要读取 xlsx 还请安装 openpyxl。"
    ) from exc


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MASTER_PATH = PROJECT_ROOT / "analysis_master.csv"

DEFAULT_FEATURE_CANDIDATES = (
    PROJECT_ROOT / "feature_table.csv",
    PROJECT_ROOT / "train_features_final.csv",
)
DEFAULT_MODEL_CANDIDATES = (
    PROJECT_ROOT / "model_result.csv",
    PROJECT_ROOT / "model_outputs" / "student_labels_and_clusters.csv",
)
DEFAULT_INFO_CANDIDATES = (
    PROJECT_ROOT / "student_info.csv",
    PROJECT_ROOT / "data" / "学生基本信息.xlsx",
)
DEFAULT_INFO_ENRICH_CANDIDATES = (
    PROJECT_ROOT / "data" / "线上学习（综合表现）.xlsx",
    PROJECT_ROOT / "data" / "学生体能考核.xlsx",
)

MASTER_COLUMNS = [
    "student_id",
    "name",
    "college",
    "major",
    "study_time",
    "library_count",
    "consume_avg",
    "night_net_ratio",
    "risk_prob",
    "risk_label",
    "cluster",
]

OPTIONAL_COLUMNS = [
    "study_index",
    "self_discipline_index",
    "health_index",
    "risk_index",
    "development_index",
    "performance_level",
]


def _clean_columns(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    frame.columns = [
        str(col).strip().replace("\ufeff", "").replace("\n", "").replace("\t", "")
        for col in frame.columns
    ]
    return frame


def _normalize_student_id(series: pd.Series) -> pd.Series:
    values = series.astype(str).str.strip().str.lower()
    values = values.str.replace(r"\.0$", "", regex=True)
    values = values.str.replace(r"\s+", "", regex=True)
    return values.replace({"": np.nan, "nan": np.nan, "none": np.nan, "null": np.nan})


def _first_existing_path(explicit_path: str | Path | None, candidates: Sequence[Path]) -> Path | None:
    if explicit_path is not None:
        path = Path(explicit_path)
        if not path.is_absolute():
            path = PROJECT_ROOT / path
        return path if path.exists() else None

    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def _read_csv(path: Path) -> pd.DataFrame:
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "gbk", "gb18030"):
        try:
            return pd.read_csv(path, encoding=encoding)
        except UnicodeDecodeError as exc:
            last_error = exc
            continue
    raise ValueError(f"无法读取 CSV 文件: {path}") from last_error


def _read_table(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        return _clean_columns(_read_csv(path))
    if path.suffix.lower() in {".xlsx", ".xls"}:
        return _clean_columns(pd.read_excel(path))
    raise ValueError(f"暂不支持的文件类型: {path.suffix}")


def _pick_first_column(frame: pd.DataFrame, candidates: Sequence[str]) -> str | None:
    lowered = {str(col).strip().lower(): col for col in frame.columns}
    for candidate in candidates:
        matched = lowered.get(candidate.strip().lower())
        if matched is not None:
            return matched
    return None


def _series_from_candidates(
    frame: pd.DataFrame,
    candidates: Sequence[str],
    *,
    default: object = np.nan,
) -> pd.Series:
    column = _pick_first_column(frame, candidates)
    if column is None:
        return pd.Series([default] * len(frame), index=frame.index)
    return frame[column]


def _sum_numeric_candidates(frame: pd.DataFrame, candidates: Sequence[str]) -> pd.Series:
    available = [column for column in candidates if column in frame.columns]
    if not available:
        return pd.Series([np.nan] * len(frame), index=frame.index, dtype=float)

    numeric = frame[available].apply(pd.to_numeric, errors="coerce")
    return numeric.sum(axis=1, min_count=1)


def _first_non_null(series: pd.Series):
    non_null = series.dropna()
    if non_null.empty:
        return np.nan

    for value in non_null:
        if isinstance(value, str) and not value.strip():
            continue
        return value
    return non_null.iloc[0]


def _collapse_by_student(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        return frame

    frame = frame.copy()
    frame = frame[frame["student_id"].notna()].copy()
    if frame.empty:
        return frame

    return frame.groupby("student_id", as_index=False).agg(_first_non_null)


def _normalize_probability(series: pd.Series) -> pd.Series:
    numeric = pd.to_numeric(series, errors="coerce")
    if numeric.notna().sum() == 0:
        return numeric

    min_value = numeric.min(skipna=True)
    max_value = numeric.max(skipna=True)
    if pd.isna(min_value) or pd.isna(max_value):
        return numeric
    if float(max_value) == float(min_value):
        return pd.Series(
            np.where(numeric.notna(), 0.5, np.nan),
            index=series.index,
            dtype=float,
        )
    return (numeric - min_value) / (max_value - min_value)


def _normalize_risk_label(series: pd.Series) -> pd.Series:
    mapping = {
        "1": 1,
        "0": 0,
        "高风险": 1,
        "风险": 1,
        "预警": 1,
        "是": 1,
        "true": 1,
        "y": 1,
        "yes": 1,
        "低风险": 0,
        "正常": 0,
        "安全": 0,
        "否": 0,
        "false": 0,
        "n": 0,
        "no": 0,
    }
    values = series.astype(str).str.strip().str.lower()
    values = values.replace({"nan": np.nan, "none": np.nan, "": np.nan})
    normalized = values.map(mapping)
    numeric = pd.to_numeric(values, errors="coerce")
    return normalized.where(normalized.notna(), numeric)


def _normalize_cluster_value(value):
    if pd.isna(value):
        return np.nan
    text = str(value).strip()
    if not text:
        return np.nan
    if text.isdigit():
        return int(text)
    return text


def _ensure_student_id(frame: pd.DataFrame, candidates: Sequence[str]) -> pd.DataFrame:
    student_id = _series_from_candidates(frame, candidates)
    normalized = _normalize_student_id(student_id)
    result = frame.copy()
    result["student_id"] = normalized
    return result[result["student_id"].notna()].copy()


def _prepare_feature_table(feature_path: str | Path | None = None) -> pd.DataFrame:
    path = _first_existing_path(feature_path, DEFAULT_FEATURE_CANDIDATES)
    if path is None:
        raise FileNotFoundError(
            "未找到特征表，请提供 feature_table.csv 或确保 train_features_final.csv 存在。"
        )

    frame = _ensure_student_id(
        _read_table(path),
        ["student_id", "学号", "XH", "XSBH", "LOGIN_NAME", "SID"],
    )

    study_time = _series_from_candidates(frame, ["study_time", "学习时长", "总学习时长"])
    if study_time.isna().all():
        study_time = _sum_numeric_candidates(frame, ["视频学习时长", "直播学习时长", "拓展学习时长"])
    if study_time.isna().all():
        study_time = _series_from_candidates(frame, ["上网时长"])

    feature_view = pd.DataFrame(
        {
            "student_id": frame["student_id"],
            "name": _series_from_candidates(frame, ["name", "姓名", "XM"]),
            "college": _series_from_candidates(
                frame, ["college", "学院", "院系", "XSM", "DEPARTMENT_NAME", "YX", "DEPARTMENT"]
            ),
            "major": _series_from_candidates(
                frame, ["major", "专业", "ZYM", "MAJOR_NAME", "ZY", "MAJOR"]
            ),
            "study_time": study_time,
            "library_count": _series_from_candidates(
                frame, ["library_count", "图书馆次数", "图书馆访问次数", "进馆次数", "library_visit_count"]
            ),
            "consume_avg": _series_from_candidates(
                frame,
                [
                    "consume_avg",
                    "平均消费",
                    "消费均值",
                    "月均消费",
                    "食堂消费均值",
                    "一卡通消费均值",
                ],
            ),
            "night_net_ratio": _series_from_candidates(
                frame, ["night_net_ratio", "夜间上网比例", "夜间占比", "night_ratio"]
            ),
            "study_index": _series_from_candidates(frame, ["study_index", "学习指数"]),
            "self_discipline_index": _series_from_candidates(
                frame, ["self_discipline_index", "自律指数"]
            ),
            "health_index": _series_from_candidates(frame, ["health_index", "健康指数"]),
            "risk_index": _series_from_candidates(frame, ["risk_index", "风险指数"]),
            "development_index": _series_from_candidates(
                frame, ["development_index", "综合发展指数"]
            ),
            "performance_level": _series_from_candidates(
                frame, ["performance_level", "表现档次", "综合表现", "performance_label"]
            ),
        }
    )

    numeric_columns = [
        "study_time",
        "library_count",
        "consume_avg",
        "night_net_ratio",
        "study_index",
        "self_discipline_index",
        "health_index",
        "risk_index",
        "development_index",
    ]
    feature_view[numeric_columns] = feature_view[numeric_columns].apply(
        pd.to_numeric, errors="coerce"
    )
    return _collapse_by_student(feature_view)


def _prepare_model_result(model_path: str | Path | None = None) -> pd.DataFrame:
    path = _first_existing_path(model_path, DEFAULT_MODEL_CANDIDATES)
    if path is None:
        raise FileNotFoundError(
            "未找到模型结果，请提供 model_result.csv 或确保 model_outputs/student_labels_and_clusters.csv 存在。"
        )

    frame = _ensure_student_id(
        _read_table(path),
        ["student_id", "学号", "XH", "XSBH", "LOGIN_NAME", "SID"],
    )

    model_view = pd.DataFrame(
        {
            "student_id": frame["student_id"],
            "risk_prob": _series_from_candidates(
                frame,
                ["risk_prob", "风险概率", "风险分数", "risk_score", "risk_probability"],
            ),
            "risk_label": _series_from_candidates(frame, ["risk_label", "风险标签", "risk_tag"]),
            "cluster": _series_from_candidates(
                frame,
                ["cluster", "聚类类别", "学生画像类别", "cluster_label", "group_cluster"],
            ),
            "performance_level": _series_from_candidates(
                frame, ["performance_level", "表现档次", "performance_label"]
            ),
        }
    )

    model_view["risk_prob"] = pd.to_numeric(model_view["risk_prob"], errors="coerce")
    model_view["risk_label"] = _normalize_risk_label(model_view["risk_label"])
    model_view["cluster"] = model_view["cluster"].apply(_normalize_cluster_value)
    return _collapse_by_student(model_view)


def _prepare_info_source(path: Path, *, include_name: bool = True) -> pd.DataFrame:
    frame = _ensure_student_id(
        _read_table(path),
        ["student_id", "学号", "XH", "XSBH", "LOGIN_NAME", "SID"],
    )

    info_view = pd.DataFrame(
        {
            "student_id": frame["student_id"],
            "name": _series_from_candidates(frame, ["name", "姓名", "XM"]) if include_name else "",
            "college": _series_from_candidates(
                frame, ["college", "学院", "院系", "XSM", "DEPARTMENT_NAME", "YX", "DEPARTMENT"]
            ),
            "major": _series_from_candidates(
                frame, ["major", "专业", "ZYM", "MAJOR_NAME", "ZY", "MAJOR"]
            ),
        }
    )
    return _collapse_by_student(info_view)


def _prepare_student_info(info_path: str | Path | None = None) -> pd.DataFrame:
    sources: list[pd.DataFrame] = []

    primary_path = _first_existing_path(info_path, DEFAULT_INFO_CANDIDATES)
    if primary_path is not None:
        sources.append(_prepare_info_source(primary_path, include_name=True))

    for candidate in DEFAULT_INFO_ENRICH_CANDIDATES:
        if candidate.exists():
            sources.append(_prepare_info_source(candidate, include_name=False))

    if not sources:
        return pd.DataFrame(columns=["student_id", "name", "college", "major"])

    merged = sources[0]
    for source in sources[1:]:
        merged = merged.merge(source, on="student_id", how="outer", suffixes=("", "_extra"))
        for column in ("name", "college", "major"):
            extra_column = f"{column}_extra"
            if extra_column in merged.columns:
                merged[column] = merged[column].combine_first(merged[extra_column])
                merged = merged.drop(columns=[extra_column])

    return _collapse_by_student(merged)


def _finalize_master_table(master: pd.DataFrame) -> pd.DataFrame:
    result = master.copy()

    if "risk_prob" not in result.columns:
        result["risk_prob"] = np.nan
    if result["risk_prob"].isna().all() and "risk_index" in result.columns:
        result["risk_prob"] = _normalize_probability(result["risk_index"])
    elif "risk_index" in result.columns:
        result["risk_prob"] = result["risk_prob"].combine_first(
            _normalize_probability(result["risk_index"])
        )

    if "risk_label" not in result.columns:
        result["risk_label"] = np.nan
    result["risk_label"] = _normalize_risk_label(result["risk_label"])
    if result["risk_label"].isna().all() and result["risk_prob"].notna().any():
        inferred_label = pd.Series(
            np.where(result["risk_prob"].notna(), (result["risk_prob"] >= 0.5).astype(int), np.nan),
            index=result.index,
        )
        result["risk_label"] = inferred_label
    elif result["risk_prob"].notna().any():
        inferred_label = pd.Series(
            np.where(result["risk_prob"].notna(), (result["risk_prob"] >= 0.5).astype(int), np.nan),
            index=result.index,
        )
        result["risk_label"] = result["risk_label"].combine_first(inferred_label)

    if "cluster" in result.columns:
        result["cluster"] = result["cluster"].apply(_normalize_cluster_value)
    else:
        result["cluster"] = np.nan

    for column in ("name", "college", "major", "performance_level"):
        if column in result.columns:
            result[column] = result[column].replace({np.nan: ""}).astype(str).str.strip()
            result[column] = result[column].replace({"nan": "", "None": ""})

    for column in ("study_time", "library_count", "consume_avg", "night_net_ratio", "risk_prob"):
        result[column] = pd.to_numeric(result[column], errors="coerce")

    if "risk_prob" in result.columns:
        result["risk_prob"] = result["risk_prob"].clip(lower=0, upper=1)

    if "night_net_ratio" in result.columns:
        ratio = result["night_net_ratio"]
        if ratio.dropna().gt(1).mean() > 0.5:
            result["night_net_ratio"] = ratio / 100.0
        result["night_net_ratio"] = result["night_net_ratio"].clip(lower=0, upper=1)

    ordered = MASTER_COLUMNS + [col for col in OPTIONAL_COLUMNS if col in result.columns]
    for column in ordered:
        if column not in result.columns:
            result[column] = np.nan

    return result[ordered].sort_values("student_id").reset_index(drop=True)


def build_analysis_master_table(
    feature_path: str | Path | None = None,
    model_path: str | Path | None = None,
    info_path: str | Path | None = None,
    output_path: str | Path = DEFAULT_MASTER_PATH,
) -> pd.DataFrame:
    feature_table = _prepare_feature_table(feature_path)
    model_result = _prepare_model_result(model_path)
    student_info = _prepare_student_info(info_path)

    master = feature_table.merge(model_result, on="student_id", how="outer", suffixes=("", "_model"))
    master = master.merge(student_info, on="student_id", how="left", suffixes=("", "_info"))

    for column in ("name", "college", "major", "performance_level"):
        info_column = f"{column}_info"
        model_column = f"{column}_model"
        if info_column in master.columns:
            master[column] = master[column].combine_first(master[info_column])
            master = master.drop(columns=[info_column])
        if model_column in master.columns:
            master[column] = master[column].combine_first(master[model_column])
            master = master.drop(columns=[model_column])

    finalized = _finalize_master_table(master)

    output = Path(output_path)
    if not output.is_absolute():
        output = PROJECT_ROOT / output
    output.parent.mkdir(parents=True, exist_ok=True)
    finalized.to_csv(output, index=False, encoding="utf-8-sig")
    return finalized


def load_analysis_master(
    master_path: str | Path = DEFAULT_MASTER_PATH,
    *,
    rebuild_if_missing: bool = True,
) -> pd.DataFrame:
    path = Path(master_path)
    if not path.is_absolute():
        path = PROJECT_ROOT / path

    if path.exists():
        return _clean_columns(_read_csv(path))

    if not rebuild_if_missing:
        raise FileNotFoundError(f"未找到总分析表: {path}")
    return build_analysis_master_table(output_path=path)


def ensure_analysis_master_table(master_path: str | Path = DEFAULT_MASTER_PATH) -> pd.DataFrame:
    return load_analysis_master(master_path=master_path, rebuild_if_missing=True)


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="构建学生行为分析总分析表。")
    parser.add_argument("--feature-path", dest="feature_path", help="feature_table.csv 路径")
    parser.add_argument("--model-path", dest="model_path", help="model_result.csv 路径")
    parser.add_argument("--info-path", dest="info_path", help="student_info.csv 路径")
    parser.add_argument(
        "--output-path",
        dest="output_path",
        default=str(DEFAULT_MASTER_PATH),
        help="analysis_master.csv 输出路径",
    )
    return parser


def main() -> None:
    args = _build_parser().parse_args()
    master = build_analysis_master_table(
        feature_path=args.feature_path,
        model_path=args.model_path,
        info_path=args.info_path,
        output_path=args.output_path,
    )
    print(f"analysis_master.csv 构建完成，共 {len(master)} 条学生记录。")


if __name__ == "__main__":
    main()
