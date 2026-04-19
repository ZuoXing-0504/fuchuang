import os
import warnings
import numpy as np
import pandas as pd

from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score
)
from sklearn.preprocessing import StandardScaler, LabelEncoder, label_binarize
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score, f1_score, recall_score, precision_score,
    classification_report, mean_absolute_error, mean_squared_error,
    r2_score, silhouette_score, roc_auc_score
)
from sklearn.cluster import KMeans
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    ExtraTreesClassifier, ExtraTreesRegressor
)
from sklearn.linear_model import LogisticRegression
from sklearn.inspection import permutation_importance

warnings.filterwarnings("ignore")

# =========================
# 路径配置（绝对路径，避免 model_outputs 不存在）
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "train_features_final.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "model_outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

RANDOM_STATE = 42
TEST_SIZE = 0.2
N_SPLITS = 5

# =========================
# 1. 读数据
# =========================
if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"找不到文件: {DATA_FILE}")

df = pd.read_csv(DATA_FILE)
print("✅ 已读取数据:", df.shape)

# =========================
# 2. 基础配置
# =========================
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

for c in df.columns:
    if c == ID_COL:
        df[c] = df[c].astype(str)

# =========================
# 3. 标签设计
# =========================
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


if TARGET_MAIN in df.columns:
    df["表现档次"] = make_performance_label(df[TARGET_MAIN])
else:
    df["表现档次"] = np.nan

df["风险标签"] = make_risk_label(df)

# =========================
# 4. 任务级排除映射（去泄漏）
# =========================
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
    "learning_engagement_classification": {
        "学习指数", "线上积极性指数"
    },
    "development_classification": {
        "综合发展指数", "学业潜力指数", "社交指数"
    },
}

# =========================
# 5. 特征工具
# =========================
def build_feature_columns(frame: pd.DataFrame, exclude_targets=None, use_optional_exclude=False, task_name=None):
    if exclude_targets is None:
        exclude_targets = set()
    exclude = set(exclude_targets) | DROP_ALWAYS
    if use_optional_exclude:
        exclude = exclude | OPTIONAL_EXCLUDE
    if task_name in TASK_EXCLUDE:
        exclude = exclude | TASK_EXCLUDE[task_name]
    return [c for c in frame.columns if c not in exclude]


def prepare_feature_matrix(frame: pd.DataFrame, feature_cols):
    X = frame[feature_cols].copy()

    use_cols = []
    for c in feature_cols:
        if pd.api.types.is_numeric_dtype(X[c]) or c in ["性别", "民族", "政治面貌", "学院", "专业"]:
            use_cols.append(c)
    X = X[use_cols]

    for c in X.columns:
        if not pd.api.types.is_numeric_dtype(X[c]):
            X[c] = X[c].astype(str)
            le = LabelEncoder()
            X[c] = le.fit_transform(X[c])

    long_tail_cols = [c for c in [
        "上网时长", "月均上网时长", "跑步次数", "锻炼次数", "奖学金金额",
        "视频学习时长", "线上访问量", "图书馆次数", "门禁次数",
        "作业提交次数", "作业完成次数", "讨论数", "回帖数", "社团次数", "竞赛次数"
    ] if c in X.columns]

    for c in long_tail_cols:
        X[c] = np.log1p(X[c].clip(lower=0))

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


# =========================
# 6. 评估函数
# =========================
def evaluate_binary_classifier(y_true, y_pred, y_prob):
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "f1": f1_score(y_true, y_pred),
        "recall": recall_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred),
        "auc": roc_auc_score(y_true, y_prob) if y_prob is not None else np.nan,
    }


def evaluate_multiclass_classifier(y_true, y_pred, y_prob, classes):
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "macro_f1": f1_score(y_true, y_pred, average="macro"),
        "macro_recall": recall_score(y_true, y_pred, average="macro"),
        "macro_precision": precision_score(y_true, y_pred, average="macro"),
        "macro_auc_ovr": np.nan
    }

    try:
        if y_prob is not None:
            y_true_bin = label_binarize(y_true, classes=classes)
            if y_prob.shape[1] == len(classes):
                metrics["macro_auc_ovr"] = roc_auc_score(
                    y_true_bin,
                    y_prob,
                    average="macro",
                    multi_class="ovr"
                )
    except Exception:
        pass

    return metrics


def evaluate_regressor(y_true, y_pred):
    return {
        "mae": mean_absolute_error(y_true, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_true, y_pred)),
        "r2": r2_score(y_true, y_pred)
    }


# =========================
# 7. 模型池
# =========================
def get_binary_models():
    return {
        "logistic": LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=RANDOM_STATE
        ),
        "rf": RandomForestClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            n_jobs=-1,
            random_state=RANDOM_STATE
        ),
        "extratrees": ExtraTreesClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            n_jobs=-1,
            random_state=RANDOM_STATE
        ),
    }


def get_multiclass_models():
    return {
        "logistic": LogisticRegression(
            max_iter=3000,
            random_state=RANDOM_STATE
        ),
        "rf": RandomForestClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            n_jobs=-1,
            random_state=RANDOM_STATE
        ),
        "extratrees": ExtraTreesClassifier(
            n_estimators=500,
            max_depth=None,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight="balanced",
            n_jobs=-1,
            random_state=RANDOM_STATE
        ),
    }


def get_regressors():
    return {
        "rf_reg": RandomForestRegressor(
            n_estimators=500,
            min_samples_split=4,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=RANDOM_STATE
        ),
        "extratrees_reg": ExtraTreesRegressor(
            n_estimators=500,
            min_samples_split=4,
            min_samples_leaf=2,
            n_jobs=-1,
            random_state=RANDOM_STATE
        ),
    }


# =========================
# 8. 模型选择函数
# =========================
def choose_best_binary_model(X, y, task_name):
    print(f"\n>>>> {task_name}：开始多模型对比（二分类，按 AUC 选最优）")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    preprocessor = make_preprocessor(X_train, X_train.columns.tolist())
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    cv = StratifiedKFold(n_splits=N_SPLITS, shuffle=True, random_state=RANDOM_STATE)

    results = []
    best_model_name = None
    best_model = None
    best_auc = -1

    for name, model in get_binary_models().items():
        try:
            cv_auc = cross_val_score(
                model, X_train_p, y_train,
                cv=cv,
                scoring="roc_auc"
            ).mean()

            model.fit(X_train_p, y_train)
            y_pred = model.predict(X_test_p)

            if hasattr(model, "predict_proba"):
                y_prob = model.predict_proba(X_test_p)[:, 1]
            elif hasattr(model, "decision_function"):
                scores = model.decision_function(X_test_p)
                y_prob = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8)
            else:
                y_prob = y_pred.astype(float)

            metrics = evaluate_binary_classifier(y_test, y_pred, y_prob)
            metrics["cv_auc"] = cv_auc
            metrics["model"] = name
            results.append(metrics)

            print(
                f"{name:<12} | CV-AUC={cv_auc:.4f} | "
                f"Test-AUC={metrics['auc']:.4f} | "
                f"F1={metrics['f1']:.4f} | Recall={metrics['recall']:.4f}"
            )

            if metrics["auc"] > best_auc:
                best_auc = metrics["auc"]
                best_model_name = name
                best_model = model

        except Exception as e:
            print(f"{name:<12} | 失败: {e}")

    if best_model is None:
        raise RuntimeError(f"{task_name} 没有可用模型")

    best_model.fit(X_train_p, y_train)
    y_pred = best_model.predict(X_test_p)

    if hasattr(best_model, "predict_proba"):
        y_prob = best_model.predict_proba(X_test_p)[:, 1]
    elif hasattr(best_model, "decision_function"):
        scores = best_model.decision_function(X_test_p)
        y_prob = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8)
    else:
        y_prob = y_pred.astype(float)

    best_metrics = evaluate_binary_classifier(y_test, y_pred, y_prob)
    best_metrics["model"] = best_model_name

    print(f"✅ {task_name} 最优模型: {best_model_name} | AUC={best_metrics['auc']:.4f}")
    print(classification_report(y_test, y_pred))

    try:
        imp = permutation_importance(best_model, X_test_p, y_test, n_repeats=5, random_state=RANDOM_STATE)
        importance_df = pd.DataFrame({
            "feature": X.columns,
            "importance": imp.importances_mean[:len(X.columns)]
        }).sort_values("importance", ascending=False)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        importance_df.to_csv(
            os.path.join(OUTPUT_DIR, f"{task_name}_importance.csv"),
            index=False,
            encoding="utf-8-sig"
        )
    except Exception:
        pass

    results_df = pd.DataFrame(results)
    if not results_df.empty:
        results_df = results_df.sort_values("auc", ascending=False)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        results_df.to_csv(
            os.path.join(OUTPUT_DIR, f"{task_name}_model_compare.csv"),
            index=False,
            encoding="utf-8-sig"
        )

    return {
        "best_model_name": best_model_name,
        "best_metrics": best_metrics,
        "all_results": results
    }


def choose_best_multiclass_model(X, y, task_name):
    print(f"\n>>>> {task_name}：开始多模型对比（多分类，按 Macro-AUC 选最优）")

    classes = np.unique(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )

    preprocessor = make_preprocessor(X_train, X_train.columns.tolist())
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    results = []
    best_model_name = None
    best_model = None
    best_score = -1

    for name, model in get_multiclass_models().items():
        try:
            model.fit(X_train_p, y_train)
            y_pred = model.predict(X_test_p)
            y_prob = model.predict_proba(X_test_p) if hasattr(model, "predict_proba") else None

            metrics = evaluate_multiclass_classifier(y_test, y_pred, y_prob, classes)
            metrics["model"] = name
            results.append(metrics)

            print(
                f"{name:<12} | Accuracy={metrics['accuracy']:.4f} | "
                f"Macro-F1={metrics['macro_f1']:.4f} | "
                f"Macro-AUC={metrics['macro_auc_ovr']:.4f}"
            )

            score_for_select = metrics["macro_auc_ovr"]
            if pd.isna(score_for_select):
                score_for_select = metrics["macro_f1"]

            if score_for_select > best_score:
                best_score = score_for_select
                best_model_name = name
                best_model = model

        except Exception as e:
            print(f"{name:<12} | 失败: {e}")

    if best_model is None:
        raise RuntimeError(f"{task_name} 没有可用模型")

    best_model.fit(X_train_p, y_train)
    y_pred = best_model.predict(X_test_p)
    y_prob = best_model.predict_proba(X_test_p) if hasattr(best_model, "predict_proba") else None

    best_metrics = evaluate_multiclass_classifier(y_test, y_pred, y_prob, classes)
    best_metrics["model"] = best_model_name

    print(f"✅ {task_name} 最优模型: {best_model_name}")
    print(classification_report(y_test, y_pred))

    try:
        imp = permutation_importance(best_model, X_test_p, y_test, n_repeats=5, random_state=RANDOM_STATE)
        importance_df = pd.DataFrame({
            "feature": X.columns,
            "importance": imp.importances_mean[:len(X.columns)]
        }).sort_values("importance", ascending=False)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        importance_df.to_csv(
            os.path.join(OUTPUT_DIR, f"{task_name}_importance.csv"),
            index=False,
            encoding="utf-8-sig"
        )
    except Exception:
        pass

    results_df = pd.DataFrame(results)
    if not results_df.empty:
        sort_col = "macro_auc_ovr" if "macro_auc_ovr" in results_df.columns else "macro_f1"
        results_df = results_df.sort_values(sort_col, ascending=False)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        results_df.to_csv(
            os.path.join(OUTPUT_DIR, f"{task_name}_model_compare.csv"),
            index=False,
            encoding="utf-8-sig"
        )

    return {
        "best_model_name": best_model_name,
        "best_metrics": best_metrics,
        "all_results": results
    }


def choose_best_regressor(X, y, task_name):
    print(f"\n>>>> {task_name}：开始多模型对比（回归，按 R² 选最优）")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    preprocessor = make_preprocessor(X_train, X_train.columns.tolist())
    X_train_p = preprocessor.fit_transform(X_train)
    X_test_p = preprocessor.transform(X_test)

    results = []
    best_model_name = None
    best_model = None
    best_r2 = -999

    for name, model in get_regressors().items():
        try:
            model.fit(X_train_p, y_train)
            y_pred = model.predict(X_test_p)
            metrics = evaluate_regressor(y_test, y_pred)
            metrics["model"] = name
            results.append(metrics)

            print(
                f"{name:<14} | MAE={metrics['mae']:.4f} | "
                f"RMSE={metrics['rmse']:.4f} | R2={metrics['r2']:.4f}"
            )

            if metrics["r2"] > best_r2:
                best_r2 = metrics["r2"]
                best_model_name = name
                best_model = model

        except Exception as e:
            print(f"{name:<14} | 失败: {e}")

    if best_model is None:
        raise RuntimeError(f"{task_name} 没有可用模型")

    best_model.fit(X_train_p, y_train)
    y_pred = best_model.predict(X_test_p)
    best_metrics = evaluate_regressor(y_test, y_pred)
    best_metrics["model"] = best_model_name

    print(f"✅ {task_name} 最优模型: {best_model_name} | R2={best_metrics['r2']:.4f}")

    results_df = pd.DataFrame(results)
    if not results_df.empty:
        results_df = results_df.sort_values("r2", ascending=False)
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        results_df.to_csv(
            os.path.join(OUTPUT_DIR, f"{task_name}_model_compare.csv"),
            index=False,
            encoding="utf-8-sig"
        )

    return {
        "best_model_name": best_model_name,
        "best_metrics": best_metrics,
        "all_results": results
    }


# =========================
# 9. 学生画像聚类
# =========================
print("\n========== 一、学生画像聚类 ==========")
CLUSTER_CANDIDATES = [
    "上网时长", "月均上网时长", "跑步次数", "锻炼次数", "体测分", "BMI", "肺活量",
    "视频学习时长", "测验平均分", "作业平均分", "考试平均分",
    "作业提交次数", "作业完成次数", "自律指数", "学习稳定性指数"
]
CLUSTER_FEATURES = [c for c in CLUSTER_CANDIDATES if c in df.columns]

if len(CLUSTER_FEATURES) >= 5:
    cluster_df = df[[ID_COL] + CLUSTER_FEATURES].copy()
    cluster_X = cluster_df[CLUSTER_FEATURES].copy()
    cluster_X = cluster_X.select_dtypes(include=[np.number]).copy()

    for c in [x for x in [
        "上网时长", "月均上网时长", "跑步次数", "锻炼次数",
        "视频学习时长", "线上访问量", "图书馆次数", "门禁次数"
    ] if x in cluster_X.columns]:
        cluster_X[c] = np.log1p(cluster_X[c].clip(lower=0))

    cluster_X = cluster_X.replace([np.inf, -np.inf], np.nan)
    cluster_X = cluster_X.clip(lower=-1e10, upper=1e10)

    imp = SimpleImputer(strategy="median")
    scl = StandardScaler()
    cluster_X2 = scl.fit_transform(imp.fit_transform(cluster_X))

    kmeans = KMeans(n_clusters=4, random_state=RANDOM_STATE, n_init=10)
    cluster_labels = kmeans.fit_predict(cluster_X2)
    df["学生画像类别"] = cluster_labels

    sil = silhouette_score(cluster_X2, cluster_labels)
    print(f"✅ KMeans 完成，类别数=4，轮廓系数={sil:.4f}")

    cluster_profile = df.groupby("学生画像类别")[cluster_X.columns].mean(numeric_only=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    cluster_profile.to_csv(os.path.join(OUTPUT_DIR, "cluster_profile.csv"), encoding="utf-8-sig")
    print("📁 已输出: model_outputs/cluster_profile.csv")
else:
    print("⚠️ 聚类特征不足，跳过")


# =========================
# 10. 学业表现分类
# =========================
print("\n========== 二、学业表现分类 ==========")
if "表现档次" in df.columns and df["表现档次"].notna().sum() > 0:
    task_df = df[df["表现档次"].notna()].copy()
    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={"表现档次", "风险标签", TARGET_MAIN, "学生画像类别"},
        use_optional_exclude=True,
        task_name="performance_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["表现档次"].copy()
    performance_result = choose_best_multiclass_model(X, y, "performance_classification")
else:
    print("⚠️ 学业表现标签不足，跳过")


# =========================
# 11. 风险学生识别
# =========================
print("\n========== 三、风险学生识别 ==========")
if "风险标签" in df.columns and df["风险标签"].notna().sum() > 0:
    task_df = df.copy()
    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={"风险标签", "表现档次", TARGET_MAIN, "学生画像类别"},
        use_optional_exclude=True,
        task_name="risk_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["风险标签"].copy()
    risk_result = choose_best_binary_model(X, y, "risk_classification")
else:
    print("⚠️ 风险标签不足，跳过")


# =========================
# 12. 综合成绩预测
# =========================
print("\n========== 四、综合成绩预测 ==========")
if TARGET_MAIN in df.columns and df[TARGET_MAIN].notna().sum() > 0:
    task_df = df[df[TARGET_MAIN].notna()].copy()
    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
        use_optional_exclude=True,
        task_name="score_regression"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df[TARGET_MAIN].copy()
    score_reg_result = choose_best_regressor(X, y, "score_regression")
else:
    print("⚠️ 综合成绩标签不足，跳过")


# =========================
# 13. 成绩变化趋势预测
# =========================
print("\n========== 五、成绩变化趋势预测 ==========")
need_cols = [c for c in ["综合成绩", "考试平均分", "测验平均分", "作业平均分"] if c in df.columns]
if len(need_cols) == 4:
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
        task_name="change_trend_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["成绩变化趋势"].copy()
    change_result = choose_best_multiclass_model(X, y, "change_trend_classification")
else:
    print("⚠️ 成绩变化趋势构造所需字段不足，跳过")


# =========================
# 14. 奖学金获得概率预测
# =========================
print("\n========== 六、奖学金获得概率预测 ==========")
if "奖学金次数" in df.columns:
    task_df = df.copy()
    task_df["奖学金获得标签"] = (task_df["奖学金次数"].fillna(0) > 0).astype(int)

    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={"奖学金获得标签", "奖学金金额", "奖学金次数", TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
        use_optional_exclude=True,
        task_name="scholarship_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["奖学金获得标签"].copy()
    scholarship_result = choose_best_binary_model(X, y, "scholarship_classification")
else:
    print("⚠️ 奖学金字段不足，跳过")


# =========================
# 15. 健康水平分类
# =========================
print("\n========== 七、健康水平分类 ==========")
if "体测分" in df.columns and df["体测分"].notna().sum() > 0:
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
        task_name="health_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["健康档次"].copy()
    health_result = choose_best_multiclass_model(X, y, "health_classification")
else:
    print("⚠️ 体测分不足，跳过")


# =========================
# 16. 学习投入水平分类
# =========================
print("\n========== 八、学习投入水平分类 ==========")
if "学习指数" in df.columns and df["学习指数"].notna().sum() > 0:
    task_df = df[df["学习指数"].notna()].copy()

    q1 = task_df["学习指数"].quantile(0.33)
    q2 = task_df["学习指数"].quantile(0.67)

    def make_learn_label(x):
        if x <= q1:
            return "低投入"
        elif x <= q2:
            return "中投入"
        return "高投入"

    task_df["学习投入档次"] = task_df["学习指数"].apply(make_learn_label)

    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={"学习投入档次", "学习指数", TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
        use_optional_exclude=True,
        task_name="learning_engagement_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["学习投入档次"].copy()
    learn_result = choose_best_multiclass_model(X, y, "learning_engagement_classification")
else:
    print("⚠️ 学习指数不足，跳过")


# =========================
# 17. 综合发展水平分类
# =========================
print("\n========== 九、综合发展水平分类 ==========")
if "综合发展指数" in df.columns and df["综合发展指数"].notna().sum() > 0:
    task_df = df[df["综合发展指数"].notna()].copy()

    q1 = task_df["综合发展指数"].quantile(0.33)
    q2 = task_df["综合发展指数"].quantile(0.67)

    def make_dev_label(x):
        if x <= q1:
            return "低发展"
        elif x <= q2:
            return "中发展"
        return "高发展"

    task_df["发展档次"] = task_df["综合发展指数"].apply(make_dev_label)

    feature_cols = build_feature_columns(
        task_df,
        exclude_targets={"发展档次", "综合发展指数", TARGET_MAIN, "表现档次", "风险标签", "学生画像类别"},
        use_optional_exclude=True,
        task_name="development_classification"
    )
    X = prepare_feature_matrix(task_df, feature_cols)
    y = task_df["发展档次"].copy()
    dev_result = choose_best_multiclass_model(X, y, "development_classification")
else:
    print("⚠️ 综合发展指数不足，跳过")


# =========================
# 18. 输出学生标签
# =========================
out_cols = [c for c in [ID_COL, "表现档次", "风险标签", "学生画像类别"] if c in df.columns]
if out_cols:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    df[out_cols].to_csv(
        os.path.join(OUTPUT_DIR, "student_labels_and_clusters.csv"),
        index=False,
        encoding="utf-8-sig"
    )
    print("📁 已输出: model_outputs/student_labels_and_clusters.csv")

print("\n✅ 所有建模流程执行完成")