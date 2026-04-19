import os
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")


def load_model_package(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"找不到模型文件: {path}")
    return joblib.load(path)


def load_json(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"找不到配置文件: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


feature_schema = load_json("feature_schema.json")
category_schema = load_json("category_schema.json")
cluster_name_map = load_json("cluster_name_map.json")

risk_pkg = load_model_package("risk_model.joblib")
scholarship_pkg = load_model_package("scholarship_model.joblib")
performance_pkg = load_model_package("performance_model.joblib")
health_pkg = load_model_package("health_model.joblib")
change_trend_pkg = load_model_package("change_trend_model.joblib")
score_reg_pkg = load_model_package("score_regression_model.joblib")
cluster_pkg = load_model_package("cluster_model.joblib")


def apply_category_mapping(df: pd.DataFrame, category_mappings: dict):
    df = df.copy()

    for col, mapping in category_mappings.items():
        if col in df.columns:
            df[col] = df[col].astype(str).map(mapping).fillna(-1).astype(int)

    return df


def align_features(input_dict, feature_columns, category_mappings=None):
    df = pd.DataFrame([input_dict])

    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    df = df[feature_columns].copy()

    if category_mappings:
        df = apply_category_mapping(df, category_mappings)

    # 长尾字段处理，必须和训练阶段一致
    long_tail_cols = [c for c in [
        "上网时长", "月均上网时长", "跑步次数", "锻炼次数", "奖学金金额",
        "视频学习时长", "线上访问量", "图书馆次数", "门禁次数",
        "作业提交次数", "作业完成次数", "讨论数", "回帖数", "社团次数", "竞赛次数"
    ] if c in df.columns]

    for c in long_tail_cols:
        df[c] = np.log1p(pd.to_numeric(df[c], errors="coerce").fillna(0).clip(lower=0))

    for c in df.columns:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    num_cols = df.select_dtypes(include=[np.number]).columns
    df[num_cols] = df[num_cols].replace([np.inf, -np.inf], np.nan)
    df[num_cols] = df[num_cols].fillna(0)

    return df


def predict_binary(pkg, input_dict, positive_label_name=None):
    feature_columns = pkg["feature_columns"]
    preprocessor = pkg["preprocessor"]
    model = pkg["model"]
    category_mappings = pkg.get("category_mappings", {})

    X = align_features(input_dict, feature_columns, category_mappings)
    Xp = preprocessor.transform(X)

    prob = float(model.predict_proba(Xp)[0][1])
    pred = int(model.predict(Xp)[0])

    result = {
        "pred_label": pred,
        "prob": prob
    }

    if positive_label_name == "risk":
        if prob >= 0.8:
            result["risk_level"] = "高风险"
        elif prob >= 0.5:
            result["risk_level"] = "中风险"
        else:
            result["risk_level"] = "低风险"

    return result


def predict_multiclass(pkg, input_dict):
    feature_columns = pkg["feature_columns"]
    preprocessor = pkg["preprocessor"]
    model = pkg["model"]
    classes = pkg["classes"]
    category_mappings = pkg.get("category_mappings", {})

    X = align_features(input_dict, feature_columns, category_mappings)
    Xp = preprocessor.transform(X)

    pred = model.predict(Xp)[0]
    prob = model.predict_proba(Xp)[0]

    prob_map = {str(classes[i]): float(prob[i]) for i in range(len(classes))}
    return {
        "pred_label": str(pred),
        "prob_map": prob_map
    }


def predict_regression(pkg, input_dict):
    feature_columns = pkg["feature_columns"]
    preprocessor = pkg["preprocessor"]
    model = pkg["model"]
    category_mappings = pkg.get("category_mappings", {})

    X = align_features(input_dict, feature_columns, category_mappings)
    Xp = preprocessor.transform(X)

    value = float(model.predict(Xp)[0])
    return {"pred_value": value}


def predict_cluster(pkg, input_dict):
    feature_columns = pkg["feature_columns"]
    imputer = pkg["imputer"]
    scaler = pkg["scaler"]
    model = pkg["model"]
    name_map = pkg["cluster_name_map"]

    X = align_features(input_dict, feature_columns, category_mappings=None)
    Xi = imputer.transform(X)
    Xs = scaler.transform(Xi)

    cluster_id = int(model.predict(Xs)[0])
    return {
        "cluster_id": cluster_id,
        "cluster_name": name_map.get(str(cluster_id), f"类别{cluster_id}")
    }


def predict_all(input_dict):
    result = {}

    result["risk"] = predict_binary(risk_pkg, input_dict, positive_label_name="risk")
    result["scholarship"] = predict_binary(scholarship_pkg, input_dict)
    result["performance"] = predict_multiclass(performance_pkg, input_dict)
    result["health"] = predict_multiclass(health_pkg, input_dict)
    result["change_trend"] = predict_multiclass(change_trend_pkg, input_dict)
    result["score_regression"] = predict_regression(score_reg_pkg, input_dict)
    result["cluster"] = predict_cluster(cluster_pkg, input_dict)

    return result


if __name__ == "__main__":
    demo_student = {
        "上网时长": 2200,
        "图书馆次数": 35,
        "跑步次数": 180,
        "锻炼次数": 90,
        "体测分": 78,
        "英语成绩": 500,
        "综合成绩": 72,
        "学习指数": 68,
        "自律指数": 72,
        "健康指数": 75,
        "社交指数": 40,
        "视频学习时长": 120,
        "测验平均分": 76,
        "作业平均分": 82,
        "考试平均分": 74,
        "作业提交次数": 12,
        "作业完成次数": 11,
        "作业执行力指数": 70,
        "线上积极性指数": 66,
        "综合发展指数": 73,
        "学业潜力指数": 71,
        "性别": "男",
        "学院": "电子工程学院",
        "专业": "电子信息工程"
    }

    output = predict_all(demo_student)
    print(json.dumps(output, ensure_ascii=False, indent=2))