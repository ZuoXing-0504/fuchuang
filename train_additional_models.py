import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score


BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "our project" / "train_features_final.csv"
MODEL_DIR = BASE_DIR / "ml" / "saved_models"
FEATURE_SCHEMA_PATH = MODEL_DIR / "feature_schema.json"
CATEGORY_SCHEMA_PATH = MODEL_DIR / "category_schema.json"

RANDOM_STATE = 42


def load_frame() -> pd.DataFrame:
    return pd.read_csv(DATA_PATH)


def load_json(path: Path, default):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, value):
    with path.open("w", encoding="utf-8") as f:
        json.dump(value, f, ensure_ascii=False, indent=2)


def build_category_mappings(df: pd.DataFrame, feature_columns):
    mappings = load_json(CATEGORY_SCHEMA_PATH, {})
    result = {}
    for column in feature_columns:
        if column not in df.columns:
            continue
        if pd.api.types.is_numeric_dtype(df[column]):
            continue
        base_mapping = mappings.get("performance_classification", {}).get(column)
        if base_mapping:
            result[column] = base_mapping
            continue
        values = (
            df[column]
            .fillna("缺失")
            .astype(str)
            .replace({"nan": "缺失", "None": "缺失"})
            .sort_values()
            .unique()
            .tolist()
        )
        result[column] = {value: idx for idx, value in enumerate(values)}
    return result


def apply_category_mapping(df: pd.DataFrame, category_mappings):
    mapped = df.copy()
    for column, mapping in category_mappings.items():
        if column in mapped.columns:
            mapped[column] = mapped[column].fillna("缺失").astype(str).map(mapping).fillna(-1).astype(int)
    return mapped


def align_features(df: pd.DataFrame, feature_columns, category_mappings):
    frame = df[feature_columns].copy()
    frame = apply_category_mapping(frame, category_mappings)
    for column in frame.columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    long_tail_cols = [
        "上网时长",
        "月均上网时长",
        "跑步次数",
        "锻炼次数",
        "奖学金金额",
        "视频学习时长",
        "图书馆次数",
        "门禁次数",
        "作业提交次数",
        "作业完成次数",
        "讨论数",
        "回帖数",
        "社团次数",
        "竞赛次数",
    ]
    for column in long_tail_cols:
        if column in frame.columns:
            frame[column] = np.log1p(frame[column].fillna(0).clip(lower=0))
    frame = frame.replace([np.inf, -np.inf], np.nan)
    return frame


def make_bucket_label(series: pd.Series, low_label: str, mid_label: str, high_label: str):
    q1 = series.quantile(0.33)
    q2 = series.quantile(0.67)

    def mapper(value):
        if value <= q1:
            return low_label
        if value <= q2:
            return mid_label
        return high_label

    return series.apply(mapper)


def choose_feature_columns(df: pd.DataFrame, target_columns):
    exclude = {"student_id"} | set(target_columns)
    return [column for column in df.columns if column not in exclude]


def train_multiclass_task(df: pd.DataFrame, task_name: str, target_column: str, labels):
    feature_columns = choose_feature_columns(df, {target_column})
    category_mappings = build_category_mappings(df, feature_columns)
    X = align_features(df, feature_columns, category_mappings)
    y = df[target_column].copy()

    imputer = SimpleImputer(strategy="median")
    X_imp = imputer.fit_transform(X)

    model = RandomForestClassifier(
        n_estimators=320,
        max_depth=None,
        random_state=RANDOM_STATE,
        n_jobs=1,
        class_weight="balanced_subsample",
    )
    model.fit(X_imp, y)
    pred = model.predict(X_imp)
    metrics = {
        "accuracy": float(accuracy_score(y, pred)),
        "macro_f1": float(f1_score(y, pred, average="macro")),
    }

    pkg = {
        "model": model,
        "preprocessor": imputer,
        "feature_columns": feature_columns,
        "category_mappings": category_mappings,
        "classes": labels,
        "task_name": task_name,
        "best_model_name": "RandomForestClassifier",
        "metrics": metrics,
    }
    joblib.dump(pkg, MODEL_DIR / f"{task_name}.joblib")
    return feature_columns


def main():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    df = load_frame()

    learn_df = df[df["学习指数"].notna()].copy()
    learn_df["学习投入档次"] = make_bucket_label(learn_df["学习指数"], "低投入", "中投入", "高投入")
    learn_features = train_multiclass_task(
        learn_df,
        "learning_engagement_model",
        "学习投入档次",
        ["低投入", "中投入", "高投入"],
    )

    dev_df = df[df["综合发展指数"].notna()].copy()
    dev_df["综合发展档次"] = make_bucket_label(dev_df["综合发展指数"], "低发展", "中发展", "高发展")
    dev_features = train_multiclass_task(
        dev_df,
        "development_model",
        "综合发展档次",
        ["低发展", "中发展", "高发展"],
    )

    feature_schema = load_json(FEATURE_SCHEMA_PATH, {})
    feature_schema["learning_engagement_classification"] = learn_features
    feature_schema["development_classification"] = dev_features
    save_json(FEATURE_SCHEMA_PATH, feature_schema)

    print("learning_engagement_model.joblib created")
    print("development_model.joblib created")


if __name__ == "__main__":
    main()
