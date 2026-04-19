from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import ExtraTreesClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent
TRAIN_FEATURES_PATH = BASE_DIR / "our project" / "train_features_final.csv"
CET_PATH = BASE_DIR / "our project" / "data" / "\u56db\u516d\u7ea7\u6210\u7ee9.xlsx"
MODEL_DIR = BASE_DIR / "ml" / "saved_models"
OUTPUT_DIR = BASE_DIR / "our project" / "model_outputs"
FEATURE_SCHEMA_PATH = MODEL_DIR / "feature_schema.json"
RANDOM_STATE = 42

STUDENT_ID = "student_id"
CATEGORY_COLUMNS = [
    "\u6027\u522b",
    "\u6c11\u65cf",
    "\u653f\u6cbb\u9762\u8c8c",
    "\u5b66\u9662",
    "\u4e13\u4e1a",
]
LONG_TAIL_COLUMNS = [
    "\u4e0a\u7f51\u65f6\u957f",
    "\u6708\u5747\u4e0a\u7f51\u65f6\u957f",
    "\u8dd1\u6b65\u6b21\u6570",
    "\u953b\u70bc\u6b21\u6570",
    "\u5956\u5b66\u91d1\u91d1\u989d",
    "\u89c6\u9891\u5b66\u4e60\u65f6\u957f",
    "\u56fe\u4e66\u9986\u6b21\u6570",
    "\u95e8\u7981\u6b21\u6570",
    "\u4f5c\u4e1a\u63d0\u4ea4\u6b21\u6570",
    "\u4f5c\u4e1a\u5b8c\u6210\u6b21\u6570",
    "\u8ba8\u8bba\u6570",
    "\u56de\u5e16\u6570",
    "\u793e\u56e2\u6b21\u6570",
    "\u7ade\u8d5b\u6b21\u6570",
]

LEARNING_INDEX = "\u5b66\u4e60\u6307\u6570"
DEVELOPMENT_INDEX = "\u7efc\u5408\u53d1\u5c55\u6307\u6570"
HEALTH_SCORE = "\u4f53\u6d4b\u5206"
HEALTH_INDEX = "\u5065\u5eb7\u6307\u6570"

LABELS_LEARNING = ["\u4f4e\u6295\u5165", "\u4e2d\u6295\u5165", "\u9ad8\u6295\u5165"]
LABELS_DEVELOPMENT = ["\u4f4e\u53d1\u5c55", "\u4e2d\u53d1\u5c55", "\u9ad8\u53d1\u5c55"]
LABELS_HEALTH = ["\u4f4e\u5065\u5eb7", "\u4e2d\u5065\u5eb7", "\u9ad8\u5065\u5eb7"]

CET_LEVEL_COL = "KS_YYJB"
CET_STUDENT_COL = "KS_XH"
CET_SCORE_COL = "KS_CJ"
CET_EXCLUDE_COLUMNS = {
    STUDENT_ID,
    "\u82f1\u8bed\u6210\u7ee9",
    "\u82f1\u8bed\u5e73\u5747\u5206",
    "\u82f1\u8bed\u8003\u8bd5\u6b21\u6570",
    "\u82f1\u8bed\u6210\u7ee9\u6ce2\u52a8",
}

HEALTH_DIRECT_COLUMNS = {
    HEALTH_SCORE,
    HEALTH_INDEX,
    "\u8010\u529b\u9879\u76ee\u6210\u7ee9",
    "\u529b\u91cf\u9879\u76ee\u6210\u7ee9",
    "\u953b\u70bc_\u4f53\u6d4b\u6bd4",
}


def load_json(path: Path, default: Any):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path: Path, value: Any) -> None:
    with path.open("w", encoding="utf-8") as file:
        json.dump(value, file, ensure_ascii=False, indent=2)


def make_bucket_label(series: pd.Series, labels: list[str]) -> pd.Series:
    q1 = series.quantile(0.33)
    q2 = series.quantile(0.67)

    def mapper(value: float) -> str:
        if value <= q1:
            return labels[0]
        if value <= q2:
            return labels[1]
        return labels[2]

    return series.apply(mapper)


def build_category_mappings(df: pd.DataFrame, feature_columns: list[str]) -> dict[str, dict[str, int]]:
    mappings: dict[str, dict[str, int]] = {}
    for column in feature_columns:
        if column not in df.columns:
            continue
        if pd.api.types.is_numeric_dtype(df[column]) and column not in CATEGORY_COLUMNS:
            continue
        values = (
            df[column]
            .fillna("missing")
            .astype(str)
            .replace({"nan": "missing", "None": "missing"})
            .sort_values()
            .unique()
            .tolist()
        )
        mappings[column] = {value: idx for idx, value in enumerate(values)}
    return mappings


def apply_category_mapping(df: pd.DataFrame, category_mappings: dict[str, dict[str, int]]) -> pd.DataFrame:
    mapped = df.copy()
    for column, mapping in category_mappings.items():
        if column in mapped.columns:
            mapped[column] = mapped[column].fillna("missing").astype(str).map(mapping).fillna(-1).astype(int)
    return mapped


def align_features(df: pd.DataFrame, feature_columns: list[str], category_mappings: dict[str, dict[str, int]]) -> pd.DataFrame:
    frame = df[feature_columns].copy()
    frame = apply_category_mapping(frame, category_mappings)
    for column in frame.columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    for column in LONG_TAIL_COLUMNS:
        if column in frame.columns:
            frame[column] = np.log1p(frame[column].fillna(0).clip(lower=0))
    frame = frame.replace([np.inf, -np.inf], np.nan)
    return frame


def build_binary_models() -> dict[str, Any]:
    return {
        "logistic": LogisticRegression(max_iter=3000, class_weight="balanced", random_state=RANDOM_STATE),
        "rf": RandomForestClassifier(
            n_estimators=400,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced_subsample",
            n_jobs=1,
            random_state=RANDOM_STATE,
        ),
        "extratrees": ExtraTreesClassifier(
            n_estimators=400,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced_subsample",
            n_jobs=1,
            random_state=RANDOM_STATE,
        ),
    }


def build_multiclass_models() -> dict[str, Any]:
    base_rf = RandomForestClassifier(
        n_estimators=260,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        n_jobs=1,
        random_state=RANDOM_STATE,
    )
    base_et = ExtraTreesClassifier(
        n_estimators=260,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        n_jobs=1,
        random_state=RANDOM_STATE,
    )
    return {
        "logistic": LogisticRegression(
            max_iter=3000,
            class_weight="balanced",
            random_state=RANDOM_STATE,
        ),
        "rf_calibrated": CalibratedClassifierCV(base_rf, method="sigmoid", cv=3),
        "extratrees_calibrated": CalibratedClassifierCV(base_et, method="sigmoid", cv=3),
    }


def evaluate_binary(y_true: pd.Series, y_pred: np.ndarray, y_prob: np.ndarray) -> dict[str, float]:
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "auc": float(roc_auc_score(y_true, y_prob)),
        "pr_auc": float(average_precision_score(y_true, y_prob)),
        "cv_auc": float(roc_auc_score(y_true, y_prob)),
    }


def evaluate_multiclass(y_true: pd.Series, y_pred: np.ndarray, y_prob: np.ndarray, classes: list[str]) -> dict[str, float]:
    y_bin = pd.get_dummies(y_true).reindex(columns=classes, fill_value=0).to_numpy()
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "macro_precision": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "macro_recall": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "macro_f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "macro_auc_ovr": float(roc_auc_score(y_bin, y_prob, average="macro", multi_class="ovr")),
    }


def extract_importance(model: Any, feature_columns: list[str]) -> pd.DataFrame:
    estimator = model
    if hasattr(model, "calibrated_classifiers_") and model.calibrated_classifiers_:
        estimator = model.calibrated_classifiers_[0].estimator
    if hasattr(estimator, "feature_importances_"):
        values = np.asarray(estimator.feature_importances_, dtype=float)
    elif hasattr(estimator, "coef_"):
        coef = np.asarray(estimator.coef_, dtype=float)
        values = np.abs(coef).mean(axis=0)
    else:
        values = np.zeros(len(feature_columns), dtype=float)
    frame = pd.DataFrame({"feature": feature_columns, "importance": values})
    return frame.sort_values("importance", ascending=False)


def train_binary_task(df: pd.DataFrame, target_column: str, task_key: str) -> dict[str, Any]:
    feature_columns = [column for column in df.columns if column not in {target_column, STUDENT_ID}]
    category_mappings = build_category_mappings(df, feature_columns)
    X = align_features(df, feature_columns, category_mappings)
    y = df[target_column].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    imputer = SimpleImputer(strategy="median")
    X_train_imp = imputer.fit_transform(X_train)
    X_test_imp = imputer.transform(X_test)

    rows = []
    best_name = None
    best_model = None
    best_metrics = None
    for model_name, model in build_binary_models().items():
        fitted = clone(model)
        fitted.fit(X_train_imp, y_train)
        pred = fitted.predict(X_test_imp)
        prob = fitted.predict_proba(X_test_imp)[:, 1]
        metrics = evaluate_binary(y_test, pred, prob)
        rows.append({"model": model_name, **metrics})
        if best_metrics is None or metrics["auc"] > best_metrics["auc"]:
            best_metrics = metrics
            best_name = model_name
            best_model = fitted

    compare_df = pd.DataFrame(rows).sort_values(["auc", "f1"], ascending=[False, False])
    compare_df.to_csv(OUTPUT_DIR / f"{task_key}_classification_model_compare.csv", index=False, encoding="utf-8-sig")

    importance_df = extract_importance(best_model, feature_columns)
    importance_df.to_csv(OUTPUT_DIR / f"{task_key}_classification_importance.csv", index=False, encoding="utf-8-sig")

    pkg = {
        "model": best_model,
        "preprocessor": imputer,
        "feature_columns": feature_columns,
        "category_mappings": category_mappings,
        "best_model_name": best_name,
        "metrics": best_metrics,
        "task_name": task_key,
    }
    joblib.dump(pkg, MODEL_DIR / f"{task_key}_model.joblib")
    return {"feature_columns": feature_columns, "category_mappings": category_mappings}


def train_multiclass_task(
    df: pd.DataFrame,
    target_column: str,
    task_key: str,
    classes: list[str],
    excluded_columns: set[str] | None = None,
) -> dict[str, Any]:
    blocked = set(excluded_columns or set()) | {target_column, STUDENT_ID}
    feature_columns = [column for column in df.columns if column not in blocked]
    category_mappings = build_category_mappings(df, feature_columns)
    X = align_features(df, feature_columns, category_mappings)
    y = df[target_column].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    imputer = SimpleImputer(strategy="median")
    X_train_imp = imputer.fit_transform(X_train)
    X_test_imp = imputer.transform(X_test)

    rows = []
    best_name = None
    best_model = None
    best_metrics = None
    for model_name, model in build_multiclass_models().items():
        fitted = clone(model)
        fitted.fit(X_train_imp, y_train)
        pred = fitted.predict(X_test_imp)
        prob = fitted.predict_proba(X_test_imp)
        metrics = evaluate_multiclass(y_test, pred, prob, classes)
        rows.append({"model": model_name, **metrics})
        if best_metrics is None or (
            metrics["macro_f1"], metrics["accuracy"], metrics["macro_auc_ovr"]
        ) > (
            best_metrics["macro_f1"], best_metrics["accuracy"], best_metrics["macro_auc_ovr"]
        ):
            best_metrics = metrics
            best_name = model_name
            best_model = fitted

    compare_df = pd.DataFrame(rows).sort_values(
        ["macro_f1", "accuracy", "macro_auc_ovr"], ascending=[False, False, False]
    )
    compare_df.to_csv(OUTPUT_DIR / f"{task_key}_classification_model_compare.csv", index=False, encoding="utf-8-sig")

    importance_df = extract_importance(best_model, feature_columns)
    importance_df.to_csv(OUTPUT_DIR / f"{task_key}_classification_importance.csv", index=False, encoding="utf-8-sig")

    pkg = {
        "model": best_model,
        "preprocessor": imputer,
        "feature_columns": feature_columns,
        "category_mappings": category_mappings,
        "classes": classes,
        "best_model_name": best_name,
        "metrics": best_metrics,
        "task_name": task_key,
    }
    joblib.dump(pkg, MODEL_DIR / f"{task_key}_model.joblib")
    return {"feature_columns": feature_columns, "category_mappings": category_mappings}


def build_cet_dataset(level_code: int) -> pd.DataFrame:
    features = pd.read_csv(TRAIN_FEATURES_PATH)
    if "passed" in features.columns:
        features = features.drop(columns=["passed"])
    cet = pd.read_excel(CET_PATH)
    level_rows = cet.loc[cet[CET_LEVEL_COL] == level_code, [CET_STUDENT_COL, CET_SCORE_COL]].copy()
    level_rows[CET_SCORE_COL] = pd.to_numeric(level_rows[CET_SCORE_COL], errors="coerce")
    agg = level_rows.groupby(CET_STUDENT_COL, as_index=False)[CET_SCORE_COL].max()
    agg["passed"] = (agg[CET_SCORE_COL] >= 425).astype(int)

    merged = features.merge(agg, left_on=STUDENT_ID, right_on=CET_STUDENT_COL, how="inner")
    keep_columns = [
        column
        for column in merged.columns
        if column not in CET_EXCLUDE_COLUMNS | {CET_STUDENT_COL, CET_SCORE_COL, "passed"}
    ]
    return merged[keep_columns + ["passed"]].copy()


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    feature_df = pd.read_csv(TRAIN_FEATURES_PATH)
    feature_schema = load_json(FEATURE_SCHEMA_PATH, {})

    learning_df = feature_df[feature_df[LEARNING_INDEX].notna()].copy()
    learning_df["learning_label"] = make_bucket_label(learning_df[LEARNING_INDEX], LABELS_LEARNING)
    learning_artifacts = train_multiclass_task(
        learning_df,
        target_column="learning_label",
        task_key="learning_engagement",
        classes=LABELS_LEARNING,
        excluded_columns={LEARNING_INDEX},
    )
    feature_schema["learning_engagement_classification"] = learning_artifacts["feature_columns"]

    development_df = feature_df[feature_df[DEVELOPMENT_INDEX].notna()].copy()
    development_df["development_label"] = make_bucket_label(development_df[DEVELOPMENT_INDEX], LABELS_DEVELOPMENT)
    development_artifacts = train_multiclass_task(
        development_df,
        target_column="development_label",
        task_key="development",
        classes=LABELS_DEVELOPMENT,
        excluded_columns={DEVELOPMENT_INDEX},
    )
    feature_schema["development_classification"] = development_artifacts["feature_columns"]

    health_df = feature_df[feature_df[HEALTH_SCORE].notna()].copy()
    health_df["health_label"] = make_bucket_label(health_df[HEALTH_SCORE], LABELS_HEALTH)
    health_artifacts = train_multiclass_task(
        health_df,
        target_column="health_label",
        task_key="health",
        classes=LABELS_HEALTH,
        excluded_columns=HEALTH_DIRECT_COLUMNS,
    )
    feature_schema["health_classification"] = health_artifacts["feature_columns"]

    cet4_df = build_cet_dataset(level_code=2)
    cet4_artifacts = train_binary_task(cet4_df, target_column="passed", task_key="cet4")
    feature_schema["cet4_classification"] = cet4_artifacts["feature_columns"]

    cet6_df = build_cet_dataset(level_code=1)
    cet6_artifacts = train_binary_task(cet6_df, target_column="passed", task_key="cet6")
    feature_schema["cet6_classification"] = cet6_artifacts["feature_columns"]

    save_json(FEATURE_SCHEMA_PATH, feature_schema)
    print("retuned health / learning_engagement / development / cet4 / cet6 models created")


if __name__ == "__main__":
    main()
