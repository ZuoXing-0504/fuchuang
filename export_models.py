import os
import json
import warnings
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score, f1_score, recall_score, precision_score,
    roc_auc_score, r2_score, mean_absolute_error, mean_squared_error
)
from sklearn.cluster import KMeans
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    ExtraTreesClassifier, ExtraTreesRegressor
)
from sklearn.linear_model import LogisticRegression

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "train_features_final.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.2

ID_COL = "student_id"
TARGET_MAIN = "综合成绩"

OPTIONAL_EXCLUDE = {
    "出门次数",
    "出入比",
    "直播学习时长",
    "上网变异系数",
    "锻炼变异系数",
    "图书馆_门禁活跃比",
    "投入产出平衡指数",
    "学习娱乐平衡指数",
}

DROP_ALWAYS = {ID_COL}

TASK_EXCLUDE = {
    "performance_classification": {
        "综合成绩", "学业潜力指数", "综合发展指数", "学习指数",
        "成绩变化代理指数"
    },
    "risk_classification": {
        "综合成绩", "作业平均分", "测验平均分", "上网时长", "夜间次数",
        "图书馆次数", "作业完成次数", "学习指数", "作业执行力指数",
        "线上积极性指数", "风险指数"
    },
    "score_regression": set(),
    "change_trend_classification": {
        "综合成绩", "考试平均分", "测验平均分", "作业平均分",
        "成绩变化代理指数"
    },
    "scholarship_classification": {
        "奖学金次数", "奖学金金额", "学业潜力指数", "综合发展指数"
    },
    "health_classification": {
        "体测分", "健康指数"
    },
}

feature_schema = {}
category_schema = {}


def make_performance_label(series: pd.Series) -> pd.Series:
    valid = series.dropna()
    q1 = valid.quantile(0.33)
    q2 = valid.quantile(0.67)

    def f(x):
        if pd.isna(x):
            return np.nan
        if x <= q1:
            return "低表现"
        elif x <= q2:
            return "中表现"
        return "高表现"

    return series.apply(f)


def make_risk_label(frame: pd.DataFrame) -> pd.Series:
    score = pd.Series(0, index=frame.index, dtype=float)

    def low_by_quantile(col, q=0.3, weight=1.0):
        if col not in frame.columns:
            return
        thr = frame[col].dropna().quantile(q)
        score.loc[frame[col] <= thr] += weight

    def high_by_quantile(col, q=0.7, weight=1.0):
        if col not in frame.columns:
            return
        thr = frame[col].dropna().quantile(q)
        score.loc[frame[col] >= thr] += weight

    low_by_quantile("综合成绩", 0.3, 2.0)
    low_by_quantile("作业平均分", 0.3, 1.5)
    low_by_quantile("测验平均分", 0.3, 1.0)

    high_by_quantile("上网时长", 0.7, 1.2)
    high_by_quantile("夜间次数", 0.7, 1.0)
    low_by_quantile("图书馆次数", 0.3, 1.2)
    low_by_quantile("作业完成次数", 0.3, 1.2)
    low_by_quantile("学习指数", 0.3, 1.0)
    low_by_quantile("作业执行力指数", 0.3, 1.0)
    low_by_quantile("线上积极性指数", 0.3, 1.0)

    return (score >= 4).astype(int)


def build_feature_columns(frame: pd.DataFrame, exclude_targets=None, use_optional_exclude=False, task_name=None):
    if exclude_targets is None:
        exclude_targets = set()
    exclude = set(exclude_targets) | DROP_ALWAYS
    if use_optional_exclude:
        exclude |= OPTIONAL_EXCLUDE
    if task_name in TASK_EXCLUDE:
        exclude |= TASK_EXCLUDE[task_name]
    return [c for c in frame.columns if c not in exclude]


def encode_categories_with_mapping(X: pd.DataFrame, task_name: str):
    """
    按训练数据生成类别映射，并保存到 category_schema
    """
    X = X.copy()
    mappings = {}

    for c in X.columns:
        if not pd.api.types.is_numeric_dtype(X[c]):
            s = X[c].astype(str).fillna("缺失")
            uniq = sorted(s.unique().tolist())
            mapping = {v: i for i, v in enumerate(uniq)}
            X[c] = s.map(mapping).astype(int)
            mappings[c] = mapping

    category_schema[task_name] = mappings
    return X


def prepare_feature_matrix(frame: pd.DataFrame, feature_cols, task_name: str):
    X = frame[feature_cols].copy()

    use_cols = []
    for c in feature_cols:
        if pd.api.types.is_numeric_dtype(X[c]) or c in ["性别", "民族", "政治面貌", "学院", "专业"]:
            use_cols.append(c)
    X = X[use_cols]

    # 先做类别编码，并记录映射
    X = encode_categories_with_mapping(X, task_name)

    # 再做长尾处理
    long_tail_cols = [c for c in [
        "上网时长", "月均上网时长", "跑步次数", "锻炼次数", "奖学金金额",
        "视频学习时长", "线上访问量", "图书馆次数", "门禁次数",
        "作业提交次数", "作业完成次数", "讨论数", "回帖数", "社团次数", "竞赛次数"
    ] if c in X.columns]

    for c in long_tail_cols:
        X[c] = np.log1p(pd.to_numeric(X[c], errors="coerce").fillna(0).clip(lower=0))

    numeric_cols = X.select_dtypes(include=[np.number]).columns
    for c in numeric_cols:
        X[c] = pd.to_numeric(X[c], errors="coerce")

    X[numeric_cols] = X[numeric_cols].replace([np.inf, -np.inf], np.nan)

    for c in numeric_cols:
        X[c] = X[c].clip(lower=-1e10, upper=1e10)

    return X


def make_preprocessor(frame: pd.DataFrame, feature_cols):
    numeric_cols = [c for c in feature_cols if pd.api.types.is_numeric_dtype(frame[c])]
    categorical_cols = [c for c in feature_cols if c not in numeric_cols]

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_cols),
            ("cat", categorical_transformer, categorical_cols),
        ],
        remainder="drop"
    )
    return preprocessor


def fit_best_binary(X, y):
    candidates = {
        "logistic": LogisticRegression(max_iter=2000, class_weight="balanced", random_state=RANDOM_STATE),
        "rf": RandomForestClassifier(
            n_estimators=500, max_depth=None, min_samples_split=4, min_samples_leaf=2,
            class_weight="balanced", n_jobs=-1, random_state=RANDOM_STATE
        ),
        "extratrees": ExtraTreesClassifier(
            n_estimators=500, max_depth=None, min_samples_split=4, min_samples_leaf=2,
            class_weight="balanced", n_jobs=-1, random_state=RANDOM_STATE
        ),
    }

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    preprocessor = make_preprocessor(X_train, X_train.columns.tolist())
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    best_name = None
    best_model = None
    best_auc = -1
    best_metrics = None

    for name, model in candidates.items():
        model.fit(X_train_p, y_train)
        y_pred = model.predict(X_test_p)
        y_prob = model.predict_proba(X_test_p)[:, 1]
        auc = roc_auc_score(y_test, y_prob)
        if auc > best_auc:
            best_auc = auc
            best_name = name
            best_model = model
            best_metrics = {
                "auc": float(auc),
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "f1": float(f1_score(y_test, y_pred)),
                "recall": float(recall_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred)),
            }

    return best_name, best_model, preprocessor, best_metrics


def fit_best_multiclass(X, y):
    candidates = {
        "logistic": LogisticRegression(max_iter=3000, random_state=RANDOM_STATE),
        "rf": RandomForestClassifier(
            n_estimators=500, max_depth=None, min_samples_split=4, min_samples_leaf=2,
            class_weight="balanced", n_jobs=-1, random_state=RANDOM_STATE
        ),
        "extratrees": ExtraTreesClassifier(
            n_estimators=500, max_depth=None, min_samples_split=4, min_samples_leaf=2,
            class_weight="balanced", n_jobs=-1, random_state=RANDOM_STATE
        ),
    }

    classes = np.unique(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    preprocessor = make_preprocessor(X_train, X_train.columns.tolist())
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    best_name = None
    best_model = None
    best_score = -1
    best_metrics = None

    for name, model in candidates.items():
        model.fit(X_train_p, y_train)
        y_pred = model.predict(X_test_p)
        y_prob = model.predict_proba(X_test_p)
        y_true_bin = pd.get_dummies(y_test).reindex(columns=classes, fill_value=0).values
        auc = roc_auc_score(y_true_bin, y_prob, average="macro", multi_class="ovr")
        if auc > best_score:
            best_score = auc
            best_name = name
            best_model = model
            best_metrics = {
                "macro_auc": float(auc),
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "macro_f1": float(f1_score(y_test, y_pred, average="macro")),
                "macro_recall": float(recall_score(y_test, y_pred, average="macro")),
                "macro_precision": float(precision_score(y_test, y_pred, average="macro")),
            }

    return best_name, best_model, preprocessor, classes.tolist(), best_metrics


def fit_best_regressor(X, y):
    candidates = {
        "rf_reg": RandomForestRegressor(
            n_estimators=500, min_samples_split=4, min_samples_leaf=2,
            n_jobs=-1, random_state=RANDOM_STATE
        ),
        "extratrees_reg": ExtraTreesRegressor(
            n_estimators=500, min_samples_split=4, min_samples_leaf=2,
            n_jobs=-1, random_state=RANDOM_STATE
        ),
    }

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    preprocessor = make_preprocessor(X_train, X_train.columns.tolist())
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    best_name = None
    best_model = None
    best_r2 = -1e9
    best_metrics = None

    for name, model in candidates.items():
        model.fit(X_train_p, y_train)
        y_pred = model.predict(X_test_p)
        r2 = r2_score(y_test, y_pred)
        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_model = model
            best_metrics = {
                "r2": float(r2),
                "mae": float(mean_absolute_error(y_test, y_pred)),
                "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            }

    return best_name, best_model, preprocessor, best_metrics


def save_model_package(filename, obj):
    path = os.path.join(MODEL_DIR, filename)
    joblib.dump(obj, path)
    print(f"💾 已保存: {path}")


def main():
    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"找不到文件: {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)
    print("✅ 已读取数据:", df.shape)

    if TARGET_MAIN in df.columns:
        df["表现档次"] = make_performance_label(df[TARGET_MAIN])
    else:
        df["表现档次"] = np.nan

    df["风险标签"] = make_risk_label(df)

    cluster_name_map = {
        "0": "自律均衡型",
        "1": "低活跃预警型",
        "2": "线上学习投入型",
        "3": "高绩效全面发展型"
    }

    # 1. 风险模型
    print("\n========== 导出风险识别模型 ==========")
    task_name = "risk_classification"
    task_df = df.copy()
    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={"风险标签", "表现档次", TARGET_MAIN, "学生画像类别"},
        use_optional_exclude=True,
        task_name=task_name
    )
    X = prepare_feature_matrix(task_df, feature_cols, task_name)
    y = task_df["风险标签"].copy()
    feature_schema[task_name] = list(X.columns)
    best_name, best_model, preprocessor, metrics = fit_best_binary(X, y)
    save_model_package("risk_model.joblib", {
        "model": best_model,
        "preprocessor": preprocessor,
        "feature_columns": list(X.columns),
        "category_mappings": category_schema.get(task_name, {}),
        "task_name": task_name,
        "best_model_name": best_name,
        "metrics": metrics
    })

    # 2. 奖学金模型
    if "奖学金次数" in df.columns:
        print("\n========== 导出奖学金模型 ==========")
        task_name = "scholarship_classification"
        task_df = df.copy()
        task_df["奖学金获得标签"] = (task_df["奖学金次数"].fillna(0) > 0).astype(int)
        feature_cols = build_feature_columns(
            task_df,
            exclude_targets={"奖学金获得标签", "奖学金金额", "奖学金次数", TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
            use_optional_exclude=True,
            task_name=task_name
        )
        X = prepare_feature_matrix(task_df, feature_cols, task_name)
        y = task_df["奖学金获得标签"].copy()
        feature_schema[task_name] = list(X.columns)
        best_name, best_model, preprocessor, metrics = fit_best_binary(X, y)
        save_model_package("scholarship_model.joblib", {
            "model": best_model,
            "preprocessor": preprocessor,
            "feature_columns": list(X.columns),
            "category_mappings": category_schema.get(task_name, {}),
            "task_name": task_name,
            "best_model_name": best_name,
            "metrics": metrics
        })

    # 3. 学业表现模型
    if "表现档次" in df.columns and df["表现档次"].notna().sum() > 0:
        print("\n========== 导出学业表现模型 ==========")
        task_name = "performance_classification"
        task_df = df[df["表现档次"].notna()].copy()
        feature_cols = build_feature_columns(
            task_df,
            exclude_targets={"表现档次", "风险标签", TARGET_MAIN, "学生画像类别"},
            use_optional_exclude=True,
            task_name=task_name
        )
        X = prepare_feature_matrix(task_df, feature_cols, task_name)
        y = task_df["表现档次"].copy()
        feature_schema[task_name] = list(X.columns)
        best_name, best_model, preprocessor, classes, metrics = fit_best_multiclass(X, y)
        save_model_package("performance_model.joblib", {
            "model": best_model,
            "preprocessor": preprocessor,
            "feature_columns": list(X.columns),
            "category_mappings": category_schema.get(task_name, {}),
            "classes": classes,
            "task_name": task_name,
            "best_model_name": best_name,
            "metrics": metrics
        })

    # 4. 健康模型
    if "体测分" in df.columns and df["体测分"].notna().sum() > 0:
        print("\n========== 导出健康分类模型 ==========")
        task_name = "health_classification"
        task_df = df[df["体测分"].notna()].copy()
        q1 = task_df["体测分"].quantile(0.33)
        q2 = task_df["体测分"].quantile(0.67)

        def make_health_label(x):
            if x <= q1:
                return "低健康"
            elif x <= q2:
                return "中健康"
            return "高健康"

        task_df["健康档次"] = task_df["体测分"].apply(make_health_label)
        feature_cols = build_feature_columns(
            task_df,
            exclude_targets={"健康档次", "体测分", TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
            use_optional_exclude=True,
            task_name=task_name
        )
        X = prepare_feature_matrix(task_df, feature_cols, task_name)
        y = task_df["健康档次"].copy()
        feature_schema[task_name] = list(X.columns)
        best_name, best_model, preprocessor, classes, metrics = fit_best_multiclass(X, y)
        save_model_package("health_model.joblib", {
            "model": best_model,
            "preprocessor": preprocessor,
            "feature_columns": list(X.columns),
            "category_mappings": category_schema.get(task_name, {}),
            "classes": classes,
            "task_name": task_name,
            "best_model_name": best_name,
            "metrics": metrics
        })

    # 5. 成绩变化趋势模型
    need_cols = [c for c in ["综合成绩", "考试平均分", "测验平均分", "作业平均分"] if c in df.columns]
    if len(need_cols) == 4:
        print("\n========== 导出成绩变化趋势模型 ==========")
        task_name = "change_trend_classification"
        task_df = df.dropna(subset=need_cols).copy()
        task_df["成绩变化指数"] = (
            0.5 * task_df["考试平均分"] +
            0.3 * task_df["测验平均分"] +
            0.2 * task_df["作业平均分"] -
            task_df["综合成绩"]
        )

        q1 = task_df["成绩变化指数"].quantile(0.33)
        q2 = task_df["成绩变化指数"].quantile(0.67)

        def make_change_label(x):
            if x <= q1:
                return "下降"
            elif x <= q2:
                return "稳定"
            return "上升"

        task_df["成绩变化趋势"] = task_df["成绩变化指数"].apply(make_change_label)
        feature_cols = build_feature_columns(
            task_df,
            exclude_targets={
                "成绩变化趋势", "成绩变化指数",
                "综合成绩", "考试平均分", "测验平均分", "作业平均分",
                "表现档次", "风险标签", "学生画像类别"
            },
            use_optional_exclude=True,
            task_name=task_name
        )
        X = prepare_feature_matrix(task_df, feature_cols, task_name)
        y = task_df["成绩变化趋势"].copy()
        feature_schema[task_name] = list(X.columns)
        best_name, best_model, preprocessor, classes, metrics = fit_best_multiclass(X, y)
        save_model_package("change_trend_model.joblib", {
            "model": best_model,
            "preprocessor": preprocessor,
            "feature_columns": list(X.columns),
            "category_mappings": category_schema.get(task_name, {}),
            "classes": classes,
            "task_name": task_name,
            "best_model_name": best_name,
            "metrics": metrics
        })

    # 6. 综合成绩回归模型
    if TARGET_MAIN in df.columns and df[TARGET_MAIN].notna().sum() > 0:
        print("\n========== 导出综合成绩回归模型 ==========")
        task_name = "score_regression"
        task_df = df[df[TARGET_MAIN].notna()].copy()
        feature_cols = build_feature_columns(
            task_df,
            exclude_targets={TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
            use_optional_exclude=True,
            task_name=task_name
        )
        X = prepare_feature_matrix(task_df, feature_cols, task_name)
        y = task_df[TARGET_MAIN].copy()
        feature_schema[task_name] = list(X.columns)
        best_name, best_model, preprocessor, metrics = fit_best_regressor(X, y)
        save_model_package("score_regression_model.joblib", {
            "model": best_model,
            "preprocessor": preprocessor,
            "feature_columns": list(X.columns),
            "category_mappings": category_schema.get(task_name, {}),
            "task_name": task_name,
            "best_model_name": best_name,
            "metrics": metrics
        })

    # 7. 聚类模型
    print("\n========== 导出聚类模型 ==========")
    cluster_candidates = [
        "上网时长", "月均上网时长", "跑步次数", "锻炼次数", "体测分", "BMI", "肺活量",
        "视频学习时长", "测验平均分", "作业平均分", "考试平均分",
        "作业提交次数", "作业完成次数", "自律指数", "学习稳定性指数"
    ]
    cluster_features = [c for c in cluster_candidates if c in df.columns]
    cluster_df = df[[ID_COL] + cluster_features].copy()
    cluster_X = cluster_df[cluster_features].copy().select_dtypes(include=[np.number])

    for c in [x for x in [
        "上网时长", "月均上网时长", "跑步次数", "锻炼次数",
        "视频学习时长", "线上访问量", "图书馆次数", "门禁次数"
    ] if x in cluster_X.columns]:
        cluster_X[c] = np.log1p(cluster_X[c].clip(lower=0))

    cluster_X = cluster_X.replace([np.inf, -np.inf], np.nan)
    cluster_X = cluster_X.clip(lower=-1e10, upper=1e10)

    imp = SimpleImputer(strategy="median")
    scl = StandardScaler()
    cluster_X_imputed = imp.fit_transform(cluster_X)
    cluster_X_scaled = scl.fit_transform(cluster_X_imputed)

    kmeans = KMeans(n_clusters=4, random_state=RANDOM_STATE, n_init=10)
    kmeans.fit(cluster_X_scaled)

    save_model_package("cluster_model.joblib", {
        "model": kmeans,
        "imputer": imp,
        "scaler": scl,
        "feature_columns": list(cluster_X.columns),
        "cluster_name_map": cluster_name_map
    })

    with open(os.path.join(MODEL_DIR, "feature_schema.json"), "w", encoding="utf-8") as f:
        json.dump(feature_schema, f, ensure_ascii=False, indent=2)

    with open(os.path.join(MODEL_DIR, "category_schema.json"), "w", encoding="utf-8") as f:
        json.dump(category_schema, f, ensure_ascii=False, indent=2)

    with open(os.path.join(MODEL_DIR, "cluster_name_map.json"), "w", encoding="utf-8") as f:
        json.dump(cluster_name_map, f, ensure_ascii=False, indent=2)

    print(f"💾 已保存: {os.path.join(MODEL_DIR, 'feature_schema.json')}")
    print(f"💾 已保存: {os.path.join(MODEL_DIR, 'category_schema.json')}")
    print(f"💾 已保存: {os.path.join(MODEL_DIR, 'cluster_name_map.json')}")
    print("\n✅ 模型导出完成")


if __name__ == "__main__":
    main()