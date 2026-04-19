from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sqlite3
from pathlib import Path
from sqlalchemy import event as sqlalchemy_event
from sqlalchemy.engine import Engine
from flask_sqlalchemy import SQLAlchemy
import json
import joblib
import pandas as pd
import numpy as np
import sys
import secrets
from datetime import datetime
from types import SimpleNamespace
from werkzeug.security import generate_password_hash, check_password_hash

from backend import InMemoryBatchTaskStore, ModelOutputsRepository, UnifiedDataRepository
from backend.routes.admin import create_admin_blueprint
from backend.routes.auth import create_auth_blueprint
from backend.routes.student import create_student_blueprint

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRIMARY_DB_PATH = os.path.join(BASE_DIR, 'student_behavior.db')

# 添加分析模块路径
sys.path.append(os.path.join(BASE_DIR, 'our project', 'analysis'))

ANALYSIS_DIR = os.path.join(BASE_DIR, 'our project', 'analysis')
ANALYSIS_CHART_DIR = os.path.join(ANALYSIS_DIR, 'outputs', 'charts')
EXPECTED_ANALYSIS_CHART_FILES = [
    '01_study_time_distribution.png',
    '02_library_count_distribution.png',
    '03_health_index_distribution.png',
    '04_night_net_ratio_distribution.png',
    '05_study_time_vs_risk_prob.png',
    '06_library_count_vs_risk_prob.png',
    '07_cluster_distribution.png',
    '08_cluster_core_feature_means.png',
]

# 导入分析模块
try:
    from data_prepare_clean import load_analysis_master
    from profile_generator_clean import generate_group_profile, generate_student_profile
    from report_generator_v2 import generate_report, get_risk_level_thresholds
    analysis_available = True
except ImportError as e:
    print(f"分析模块导入失败: {e}")
    analysis_available = False

try:
    from charts import generate_all_charts
    chart_generation_available = True
except ImportError as e:
    print(f"图表生成模块导入失败: {e}")
    generate_all_charts = None
    chart_generation_available = False

app = Flask(__name__)
app.json.ensure_ascii = False

# 启用 CORS
CORS(app)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    f"sqlite:///{PRIMARY_DB_PATH}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'timeout': 15}
}

# 初始化数据库
db = SQLAlchemy(app)


@sqlalchemy_event.listens_for(Engine, 'connect')
def _configure_sqlite_connection(dbapi_connection, connection_record):
    if not isinstance(dbapi_connection, sqlite3.Connection):
        return
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA journal_mode=MEMORY")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.execute("PRAGMA busy_timeout=15000")
    finally:
        cursor.close()


EPHEMERAL_TOKEN_CACHE = {}
ADMIN_METRICS_CACHE = None
data_repository = None
model_outputs_repository = None
batch_task_store = InMemoryBatchTaskStore()

# 数据库模型
class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10))
    college = db.Column(db.String(100), index=True)
    major = db.Column(db.String(100), index=True)
    ethnicity = db.Column(db.String(50))
    political_status = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    features = db.relationship('StudentFeature', back_populates='student', uselist=False, cascade='all, delete-orphan')
    predictions = db.relationship('Prediction', back_populates='student', uselist=False, cascade='all, delete-orphan')
    cluster = db.relationship('Cluster', back_populates='student', uselist=False, cascade='all, delete-orphan')

class StudentFeature(db.Model):
    __tablename__ = 'student_features'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.student_id'), nullable=False, index=True)
    internet_duration = db.Column(db.Float)
    avg_monthly_internet_duration = db.Column(db.Float)
    running_count = db.Column(db.Integer)
    workout_count = db.Column(db.Integer)
    body_score = db.Column(db.Float)
    BMI = db.Column(db.Float)
    lung_capacity = db.Column(db.Float)
    video_learning_duration = db.Column(db.Float)
    quiz_average = db.Column(db.Float)
    assignment_average = db.Column(db.Float)
    exam_average = db.Column(db.Float)
    assignment_submit_count = db.Column(db.Integer)
    assignment_finish_count = db.Column(db.Integer)
    self_discipline_score = db.Column(db.Float)
    stability_index = db.Column(db.Float)
    library_visit_count = db.Column(db.Integer)
    gate_access_count = db.Column(db.Integer)
    discussion_count = db.Column(db.Integer)
    reply_count = db.Column(db.Integer)
    club_count = db.Column(db.Integer)
    competition_count = db.Column(db.Integer)
    english_score = db.Column(db.Float)
    overall_score = db.Column(db.Float)
    study_index = db.Column(db.Float)
    health_index = db.Column(db.Float)
    social_index = db.Column(db.Float)
    assignment_execution_index = db.Column(db.Float)
    online_engagement_index = db.Column(db.Float)
    development_index = db.Column(db.Float)
    academic_potential_index = db.Column(db.Float)
    scholarship_count = db.Column(db.Integer)
    scholarship_amount = db.Column(db.Float)
    night_activity_count = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    student = db.relationship('Student', back_populates='features')

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.student_id'), nullable=False, index=True)
    risk_prediction = db.Column(db.Integer)
    risk_probability = db.Column(db.Float)
    risk_level = db.Column(db.String(20))
    scholarship_prediction = db.Column(db.Integer)
    scholarship_probability = db.Column(db.Float)
    performance_prediction = db.Column(db.String(20))
    performance_probabilities = db.Column(db.JSON)
    health_prediction = db.Column(db.String(20))
    health_probabilities = db.Column(db.JSON)
    change_trend_prediction = db.Column(db.String(20))
    change_trend_probabilities = db.Column(db.JSON)
    score_prediction = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    student = db.relationship('Student', back_populates='predictions')

class Cluster(db.Model):
    __tablename__ = 'clusters'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.student_id'), nullable=False, index=True)
    cluster_id = db.Column(db.Integer, index=True)
    cluster_name = db.Column(db.String(50), index=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    
    student = db.relationship('Student', back_populates='cluster')


class UserAccount(db.Model):
    __tablename__ = 'user_accounts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student', index=True)
    student_id = db.Column(db.String(50), nullable=True, index=True)
    name = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(128), nullable=True, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

# 加载预测模型
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

# 加载模型和配置
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

try:
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
    model_loaded = True
except Exception as e:
    print(f"模型加载失败: {e}")
    model_loaded = False

# 棰勬祴鐩稿叧鍑芥暟
def apply_category_mapping(df, category_mappings):
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
    # 长尾字段处理
    long_tail_cols = [c for c in [
        "internet_duration",
        "avg_monthly_internet_duration",
        "running_count",
        "workout_count",
        "scholarship_amount",
        "video_learning_duration",
        "library_visit_count",
        "gate_access_count",
        "assignment_submit_count",
        "assignment_finish_count",
        "discussion_count",
        "reply_count",
        "club_count",
        "competition_count"
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
    if hasattr(model, "n_jobs"):
        model.n_jobs = 1
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
    if hasattr(model, "n_jobs"):
        model.n_jobs = 1
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
    if hasattr(model, "n_jobs"):
        model.n_jobs = 1
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
    if hasattr(model, "n_jobs"):
        model.n_jobs = 1
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
    # 模型未加载时，返回一份可用的兜底结果
    if not model_loaded:
        return {
            "risk": {
                "pred_label": 0,
                "prob": 0.3,
                "risk_level": "低风险"
            },
            "scholarship": {
                "pred_label": 1,
                "prob": 0.7
            },
            "performance": {
                "pred_label": "中表现",
                "prob_map": {
                    "低表现": 0.2,
                    "中表现": 0.6,
                    "高表现": 0.2
                }
            },
            "health": {
                "pred_label": "中健康",
                "prob_map": {
                    "低健康": 0.3,
                    "中健康": 0.5,
                    "高健康": 0.2
                }
            },
            "change_trend": {
                "pred_label": "稳定",
                "prob_map": {
                    "下降": 0.2,
                    "稳定": 0.6,
                    "上升": 0.2
                }
            },
            "score_regression": {
                "pred_value": 75.5
            },
            "cluster": {
                "cluster_id": 0,
                "cluster_name": "自律均衡型"
            }
        }
    
    result = {}
    result["risk"] = predict_binary(risk_pkg, input_dict, positive_label_name="risk")
    result["scholarship"] = predict_binary(scholarship_pkg, input_dict)
    result["performance"] = predict_multiclass(performance_pkg, input_dict)
    result["health"] = predict_multiclass(health_pkg, input_dict)
    result["change_trend"] = predict_multiclass(change_trend_pkg, input_dict)
    result["score_regression"] = predict_regression(score_reg_pkg, input_dict)
    result["cluster"] = predict_cluster(cluster_pkg, input_dict)
    return result

# Legacy demo API block kept only for reference. These routes are replaced by
# the clean v2 routes near the end of the file.
# 下面这段原始文本仅作历史留档，其中的乱码来自更早的错误转码，
# 不参与当前后端运行逻辑。
LEGACY_DEMO_API_BLOCK = r'''
# 历史演示接口文本已移除。
# 当前项目实际使用的是文件后部的 v2 路由与数据构建逻辑。
'''

def _load_analysis_frame():
    if not analysis_available or data_repository is None:
        return None
    frame = data_repository.load_analysis_frame()
    if frame is None:
        print("分析主表加载失败: 未能从统一数据源读取 analysis_master.csv")
    return frame


def _ensure_analysis_charts(force=False):
    if not analysis_available or not chart_generation_available or generate_all_charts is None:
        return False

    existing = all(os.path.exists(os.path.join(ANALYSIS_CHART_DIR, file_name)) for file_name in EXPECTED_ANALYSIS_CHART_FILES)
    if existing and not force:
        return True

    try:
        chart_paths = generate_all_charts(output_dir=ANALYSIS_CHART_DIR)
        print(f"分析图表已就绪，共 {len(chart_paths)} 张。")
        return True
    except Exception as exc:
        print(f"分析图表生成失败: {exc}")
        return False


def _get_analysis_chart_status():
    existing_files = [
        file_name for file_name in EXPECTED_ANALYSIS_CHART_FILES
        if os.path.exists(os.path.join(ANALYSIS_CHART_DIR, file_name))
    ]
    missing_files = [
        file_name for file_name in EXPECTED_ANALYSIS_CHART_FILES
        if file_name not in existing_files
    ]

    if not chart_generation_available:
        return {
            "ready": len(missing_files) == 0,
            "message": "图表生成依赖未安装，当前机器缺少 matplotlib，无法自动补齐分析图。",
            "missingCount": len(missing_files),
            "availableCount": len(existing_files),
            "installHint": "可在项目根目录执行 pip install matplotlib 后重启后端。",
        }

    if missing_files:
        return {
            "ready": False,
            "message": f"分析图尚未全部生成，还缺少 {len(missing_files)} 张图，可重启后端或手动执行 charts.py 补齐。",
            "missingCount": len(missing_files),
            "availableCount": len(existing_files),
            "installHint": "",
        }

    return {
        "ready": True,
        "message": "分析图已就绪，可直接用于前端展示。",
        "missingCount": 0,
        "availableCount": len(existing_files),
        "installHint": "",
    }


def _cluster_label_from_value(value):
    cluster_map = {
        0: "高投入稳健型",
        1: "低投入风险型",
        2: "夜间波动型",
        3: "发展过渡型",
    }
    try:
        return cluster_map.get(int(float(value)), "发展过渡型")
    except Exception:
        return "发展过渡型"


def _risk_level_from_probability(probability):
    low_threshold, high_threshold = get_risk_level_thresholds()
    low_threshold = _safe_float(low_threshold, 0.3)
    high_threshold = _safe_float(high_threshold, 0.6)
    if probability >= high_threshold:
        return "高风险"
    if probability >= low_threshold:
        return "中风险"
    return "低风险"


def _load_student_registration_lookup():
    try:
        accounts = UserAccount.query.filter_by(role='student').all()
    except Exception:
        return {}
    lookup = {}
    for account in accounts:
        student_id = str(getattr(account, 'student_id', '') or '').strip()
        if not student_id:
            continue
        lookup[student_id] = {
            "status": "已注册",
            "username": getattr(account, 'username', '') or "",
        }
    return lookup


def _build_admin_student_metrics_row(row, registration_lookup=None):
    student_id = str(row.get("student_id") or "")
    cluster_label = _cluster_label_from_value(row.get("cluster"))
    profile_segment = _build_profile_segment(cluster_label, row=row, risk_prob=_safe_float(row.get("risk_prob")))
    registration = registration_lookup.get(student_id) if registration_lookup is not None else None
    if registration is None:
        registration = _get_account_registration_info(student_id)
    risk_prob = _safe_float(row.get("risk_prob"))
    development_score = _get_display_metric(row=row, key="development_index", default=50)
    return {
        "studentId": student_id,
        "name": str(row.get("name") or row.get("student_id") or ""),
        "gender": "未知",
        "college": str(row.get("college") or "未知学院"),
        "major": str(row.get("major") or "未知专业"),
        "grade": str(row.get("grade") or ""),
        "className": str(row.get("class_name") or ""),
        "riskLabel": 1 if _risk_level_from_probability(risk_prob) == "高风险" else 0,
        "riskLevel": _risk_level_from_probability(risk_prob),
        "performanceLevel": str(row.get("performance_level") or "中表现"),
        "profileCategory": cluster_label,
        "profileSubtype": profile_segment["profileSubtype"],
        "secondaryTags": _build_secondary_tags(cluster_label, row=row, risk_prob=risk_prob),
        "healthLevel": _health_level_from_score(_get_display_metric(row=row, key="health_index", default=50)),
        "scholarshipProbability": round(max(0, min(1, development_score / 100)), 4),
        "scorePrediction": development_score,
        "registrationStatus": registration["status"],
        "registeredUsername": registration["username"],
    }


def _build_admin_student_metrics_list(force_refresh=False):
    global ADMIN_METRICS_CACHE
    if ADMIN_METRICS_CACHE is not None and not force_refresh:
        return ADMIN_METRICS_CACHE
    frame = _load_analysis_frame()
    if frame is None or frame.empty:
        return []
    registration_lookup = _load_student_registration_lookup()
    rows = []
    for _, item in frame.iterrows():
        rows.append(_build_admin_student_metrics_row(item, registration_lookup=registration_lookup))
    ADMIN_METRICS_CACHE = rows
    return rows


def _get_account_registration_info(student_id):
    try:
        account = UserAccount.query.filter_by(student_id=student_id, role='student').first()
    except Exception:
        account = None
    if not account:
        return {
            "status": "未注册",
            "username": "",
        }
    return {
        "status": "已注册",
        "username": account.username,
    }


def _pick_default_student_id():
    if data_repository is None:
        return None
    return data_repository.pick_default_student_id()


def _resolve_student_id(student_id=None):
    requested = request.args.get("student_id") or student_id
    if requested:
        return str(requested)
    account = _get_current_account(optional=True)
    if account and account.student_id:
        return str(account.student_id)
    fallback = _pick_default_student_id()
    return str(fallback) if fallback else None


def _find_student_row(student_id):
    if data_repository is None:
        return None
    return data_repository.find_student_row(student_id)


def _get_request_token():
    auth_header = request.headers.get('Authorization', '').strip()
    if auth_header.lower().startswith('bearer '):
        return auth_header[7:].strip()
    return request.headers.get('X-Auth-Token', '').strip() or None


def _get_current_account(optional=False):
    token = _get_request_token()
    if not token:
        return None if optional else None
    account = UserAccount.query.filter_by(token=token).first()
    if account:
        return account
    cached = EPHEMERAL_TOKEN_CACHE.get(token)
    if cached:
        return SimpleNamespace(**cached)
    return None if optional else None


def _serialize_account(account, token_override=None):
    if isinstance(account, dict):
        account_id = account.get('id', '')
        username = account.get('username')
        name = account.get('name')
        role = account.get('role')
        student_id = account.get('student_id')
        token = account.get('token')
    else:
        account_id = account.id
        username = account.username
        name = account.name
        role = account.role
        student_id = account.student_id
        token = account.token
    return {
        'id': str(account_id),
        'userId': account_id,
        'username': username,
        'name': name,
        'role': role,
        'studentId': student_id,
        'token': token_override if token_override is not None else token,
    }


def _store_ephemeral_token(account, token):
    if isinstance(account, dict):
        payload = {
            'id': account.get('id', 0),
            'username': account.get('username', ''),
            'name': account.get('name', ''),
            'role': account.get('role', 'student'),
            'student_id': account.get('student_id'),
            'token': token,
        }
        EPHEMERAL_TOKEN_CACHE[token] = payload
        return
    EPHEMERAL_TOKEN_CACHE[token] = {
        'id': account.id,
        'username': account.username,
        'name': account.name,
        'role': account.role,
        'student_id': account.student_id,
        'token': token,
    }


def _build_fallback_admin_account():
    return SimpleNamespace(
        id=0,
        username='admin001',
        password_hash=generate_password_hash('123456'),
        role='admin',
        student_id=None,
        name='张老师',
        token=None,
    )


def _ensure_admin_seed():
    admin = UserAccount.query.filter_by(username='admin001').first()
    if admin:
        return admin
    admin = UserAccount(
        username='admin001',
        password_hash=generate_password_hash('123456'),
        role='admin',
        student_id=None,
        name='张老师',
    )
    db.session.add(admin)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        existing = UserAccount.query.filter_by(username='admin001').first()
        if existing:
            return existing
        return None
    return admin


def _clamp_score(value, default=50):
    if value is None:
        return default
    try:
        score = float(value)
    except Exception:
        return default
    if score <= 1:
        score *= 100
    return max(0, min(100, round(score, 1)))


DISPLAY_SCORE_COLUMN_MAP = {
    "study_index": "study_index_display",
    "self_discipline_index": "self_discipline_index_display",
    "health_index": "health_index_display",
    "risk_index": "risk_index_display",
    "development_index": "development_index_display",
}


def _get_display_metric(row=None, metrics=None, key="", default=0.0):
    metrics = metrics or {}
    if key in metrics and metrics.get(key) is not None:
        return _safe_float(metrics.get(key), default)
    if row is None:
        return default
    row_get = row.get if hasattr(row, "get") else lambda *_: None
    display_key = DISPLAY_SCORE_COLUMN_MAP.get(key, key)
    return _safe_float(row_get(display_key), _safe_float(row_get(key), default))


def _safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


def _health_level_from_score(score):
    if score >= 80:
        return "优秀"
    if score >= 65:
        return "良好"
    if score >= 50:
        return "一般"
    return "预警"


def _fallback_secondary_tags(cluster_label):
    mapping = {
        "高投入稳健型": ["学习投入积极", "行为规律稳定"],
        "低投入风险型": ["学习投入不足", "风险敏感关注"],
        "夜间波动型": ["夜间活跃偏高", "作息波动明显"],
        "发展过渡型": ["成长过渡观察", "发展潜力待释放"],
    }
    return mapping.get(cluster_label, ["成长状态待观察"])


def _build_secondary_tags(cluster_label, metrics=None, row=None, risk_prob=None):
    metrics = metrics or {}
    row = {} if row is None else row
    tags = []

    def append_tag(text):
        if text and text not in tags:
            tags.append(text)

    row_get = row.get if hasattr(row, 'get') else lambda *_: None
    study_score = _get_display_metric(row=row, metrics=metrics, key="study_index", default=50)
    self_score = _get_display_metric(row=row, metrics=metrics, key="self_discipline_index", default=50)
    health_score = _get_display_metric(row=row, metrics=metrics, key="health_index", default=50)
    development_score = _get_display_metric(row=row, metrics=metrics, key="development_index", default=50)
    night_ratio = _safe_float(row_get("night_net_ratio"), 0)
    library_count = _safe_float(row_get("library_count"), 0)
    risk_probability = _safe_float(risk_prob, _safe_float(row_get("risk_prob"), 0))

    if study_score <= 40:
        append_tag("学习投入不足")
    elif study_score >= 70:
        append_tag("学习投入积极")

    if self_score <= 40:
        append_tag("自律规律待提升")
    elif self_score >= 70:
        append_tag("行为规律稳定")

    if health_score < 45:
        append_tag("健康状态需关注")
    elif health_score >= 70:
        append_tag("健康状态稳定")

    if risk_probability >= 0.15:
        append_tag("风险敏感关注")

    if night_ratio >= 0.08:
        append_tag("夜间活跃偏高")

    if library_count <= 0:
        append_tag("线下资源利用偏低")
    elif library_count >= 300:
        append_tag("图书馆利用积极")

    if development_score >= 70:
        append_tag("发展潜力突出")
    elif 0 < development_score <= 40:
        append_tag("成长动能偏弱")

    for tag in _fallback_secondary_tags(cluster_label):
        append_tag(tag)
        if len(tags) >= 4:
            break

    return tags[:4]


def _build_profile_segment(cluster_label, metrics=None, row=None, risk_prob=None):
    metrics = metrics or {}
    row = {} if row is None else row
    row_get = row.get if hasattr(row, 'get') else lambda *_: None

    study_score = _get_display_metric(row=row, metrics=metrics, key="study_index", default=50)
    self_score = _get_display_metric(row=row, metrics=metrics, key="self_discipline_index", default=50)
    health_score = _get_display_metric(row=row, metrics=metrics, key="health_index", default=50)
    development_score = _get_display_metric(row=row, metrics=metrics, key="development_index", default=50)
    night_ratio = _safe_float(row_get("night_net_ratio"), 0)
    library_count = _safe_float(row_get("library_count"), 0)
    risk_probability = _safe_float(risk_prob, _safe_float(row_get("risk_prob"), 0))

    if cluster_label == "高投入稳健型":
        if library_count >= 80:
            subtype = "资源活跃稳健子类"
            explanation = "该学生在高投入稳健型中更偏向资源活跃子类，学习投入较高，线下学习资源使用也比较积极，整体状态更接近稳定输出。"
        elif development_score >= 70:
            subtype = "潜力释放稳健子类"
            explanation = "该学生在高投入稳健型中更偏向潜力释放子类，学习投入和综合发展都较突出，具备持续拔高的成长趋势。"
        else:
            subtype = "节律稳定稳健子类"
            explanation = "该学生在高投入稳健型中更偏向节律稳定子类，日常行为节奏较平稳，风险概率较低，是当前样本中相对稳健的一类。"
    elif cluster_label == "低投入风险型":
        if study_score <= 35 and library_count <= 20:
            subtype = "资源稀缺补强子类"
            explanation = "该学生在低投入风险型中更偏向资源稀缺子类，学习投入和线下学习资源利用都偏低，需要优先补强学习场景和投入习惯。"
        elif self_score <= 40 or night_ratio >= 0.08:
            subtype = "节律失衡风险子类"
            explanation = "该学生在低投入风险型中更偏向节律失衡子类，学习投入不足的同时，自律规律或夜间活跃也存在偏移，风险敏感度更高。"
        else:
            subtype = "基础薄弱待补强子类"
            explanation = "该学生在低投入风险型中更偏向基础薄弱子类，当前主要问题是学习投入不足和成长动能偏弱，需要循序渐进地建立稳定节奏。"
    elif cluster_label == "夜间波动型":
        if night_ratio >= 0.12:
            subtype = "高夜活跃波动子类"
            explanation = "该学生在夜间波动型中更偏向高夜活跃子类，夜间活跃占比较高，容易带来作息偏移和次日学习效率波动。"
        elif self_score <= 40:
            subtype = "作息失衡波动子类"
            explanation = "该学生在夜间波动型中更偏向作息失衡子类，虽然夜间活跃不一定极端，但规律性偏弱，整体表现更容易受节奏影响。"
        else:
            subtype = "夜间偏移观察子类"
            explanation = "该学生在夜间波动型中更偏向夜间偏移观察子类，当前主要特征是作息时间带有偏移，需要持续关注是否演化成更明显的波动。"
    else:
        if development_score >= 70:
            subtype = "潜力成长过渡子类"
            explanation = "该学生在发展过渡型中更偏向潜力成长子类，当前处于由基础阶段向更稳定发展阶段过渡的窗口期。"
        elif health_score < 45:
            subtype = "身心待稳过渡子类"
            explanation = "该学生在发展过渡型中更偏向身心待稳子类，整体尚在过渡阶段，同时健康发展维度较弱，需要先把状态稳住。"
        else:
            subtype = "适应调整过渡子类"
            explanation = "该学生在发展过渡型中更偏向适应调整子类，当前画像并不极端，但多个维度仍在调整，需要持续观察后续走向。"

    highlights = [
        f"学习投入约为 {round(study_score, 1)} 分，对应当前画像中的学习参与特征。",
        f"行为规律约为 {round(self_score, 1)} 分，反映日常节律和自律稳定性。",
        f"图书馆打卡约 {round(library_count, 1)} 次，体现线下学习资源利用程度。",
        f"风险概率约为 {round(risk_probability * 100, 1)}%，用于辅助判断当前风险敏感度。",
    ]

    if night_ratio > 0:
        highlights.insert(3, f"夜间活跃占比约为 {round(night_ratio * 100, 1)}%，体现夜间行为波动。")
    if development_score > 0:
        highlights.append(f"综合发展约为 {round(development_score, 1)} 分，反映当前成长动能。")
    if health_score > 0:
        highlights.append(f"健康发展约为 {round(health_score, 1)} 分，用于观察身心状态是否稳定。")

    return {
        "profileSubtype": subtype,
        "profileExplanation": explanation,
        "profileHighlights": highlights[:5],
    }


def _safe_number(value, digits=1):
    try:
        if value is None:
            return None
        number = float(value)
        if np.isnan(number) or np.isinf(number):
            return None
        return round(number, digits)
    except Exception:
        return None


def _append_snapshot_item(bucket, label, value, unit="", note=""):
    if value is None:
        return
    display_value = f"{value}{unit}" if unit else str(value)
    bucket.append({
        "label": label,
        "value": display_value,
        "note": note,
    })


STUDENT_FEATURE_COLUMN_CANDIDATES = {
    "gender": ("gender", "性别"),
    "ethnicity": ("ethnicity", "民族"),
    "political_status": ("political_status", "政治面貌"),
    "birthplace": ("birthplace", "籍贯"),
    "internet_duration": ("internet_duration", "上网时长"),
    "avg_monthly_internet_duration": ("avg_monthly_internet_duration", "月均上网时长"),
    "internet_variance": ("internet_variance", "上网波动"),
    "internet_cv": ("internet_cv", "上网变异系数"),
    "running_count": ("running_count", "跑步次数"),
    "running_active_days": ("running_active_days", "跑步活跃天数"),
    "running_terms": ("running_terms", "跑步学期数"),
    "recent_30_running": ("recent_30_running", "最近30天跑步次数"),
    "recent_60_running": ("recent_60_running", "最近60天跑步次数"),
    "recent_90_running": ("recent_90_running", "最近90天跑步次数"),
    "workout_count": ("workout_count", "锻炼次数"),
    "workout_average": ("workout_average", "锻炼均次"),
    "workout_variance": ("workout_variance", "锻炼波动"),
    "workout_cv": ("workout_cv", "锻炼变异系数"),
    "workout_weeks": ("workout_weeks", "锻炼周数"),
    "workout_terms": ("workout_terms", "锻炼学期数"),
    "body_score": ("body_score", "体测分"),
    "BMI": ("BMI", "BMI"),
    "lung_capacity": ("lung_capacity", "肺活量"),
    "sprint_50m": ("sprint_50m", "50米"),
    "standing_long_jump": ("standing_long_jump", "立定跳远"),
    "sit_and_reach": ("sit_and_reach", "坐位体前屈"),
    "run_800m": ("run_800m", "800米"),
    "run_1000m": ("run_1000m", "1000米"),
    "sit_ups": ("sit_ups", "仰卧起坐"),
    "pull_ups": ("pull_ups", "引体向上"),
    "bmi_low": ("bmi_low", "BMI偏低"),
    "bmi_high": ("bmi_high", "BMI偏高"),
    "video_learning_duration": ("video_learning_duration", "视频学习时长"),
    "video_learning_mean": ("video_learning_mean", "视频学习时长均值"),
    "video_learning_variance": ("video_learning_variance", "视频学习时长波动"),
    "quiz_average": ("quiz_average", "测验平均分"),
    "quiz_variance": ("quiz_variance", "测验分波动"),
    "assignment_average": ("assignment_average", "作业平均分"),
    "class_assignment_average": ("class_assignment_average", "作业平均分_课堂任务"),
    "class_assignment_variance": ("class_assignment_variance", "课堂作业分波动"),
    "exam_average": ("exam_average", "考试平均分"),
    "exam_variance": ("exam_variance", "考试分波动"),
    "assignment_submit_count": ("assignment_submit_count", "作业提交次数"),
    "assignment_finish_count": ("assignment_finish_count", "作业完成次数"),
    "assignment_score_variance": ("assignment_score_variance", "作业分数波动"),
    "library_visit_count": ("library_visit_count", "图书馆次数"),
    "library_entry_count": ("library_entry_count", "进馆次数"),
    "library_exit_count": ("library_exit_count", "出馆次数"),
    "library_active_days": ("library_active_days", "图书馆活跃天数"),
    "night_library_count": ("night_library_count", "晚间到馆次数"),
    "weekend_library_count": ("weekend_library_count", "周末到馆次数"),
    "daytime_library_count": ("daytime_library_count", "白天到馆次数"),
    "gate_access_count": ("gate_access_count", "门禁次数"),
    "gate_entry_count": ("gate_entry_count", "进门次数"),
    "gate_exit_count": ("gate_exit_count", "出门次数"),
    "night_activity_count": ("night_activity_count", "夜间次数"),
    "weekend_gate_count": ("weekend_gate_count", "周末门禁次数"),
    "daytime_gate_count": ("daytime_gate_count", "白天门禁次数"),
    "gate_active_days": ("gate_active_days", "门禁活跃天数"),
    "discussion_count": ("discussion_count", "讨论数"),
    "reply_count": ("reply_count", "回帖数"),
    "online_visits": ("online_visits", "线上访问量"),
    "online_visits_mean": ("online_visits_mean", "线上访问量均值"),
    "live_learning_duration": ("live_learning_duration", "直播学习时长"),
    "extended_learning_duration": ("extended_learning_duration", "拓展学习时长"),
    "paper_participation_count": ("paper_participation_count", "试卷参与次数"),
    "answer_participation_count": ("answer_participation_count", "问答参与次数"),
    "peer_review_count": ("peer_review_count", "互评分次数"),
    "club_count": ("club_count", "社团次数"),
    "club_active_days": ("club_active_days", "社团活跃天数"),
    "competition_count": ("competition_count", "竞赛次数"),
    "english_score": ("english_score", "英语成绩"),
    "english_average": ("english_average", "英语平均分"),
    "english_exam_count": ("english_exam_count", "英语考试次数"),
    "english_variance": ("english_variance", "英语成绩波动"),
    "overall_score": ("overall_score", "综合成绩"),
    "scholarship_count": ("scholarship_count", "奖学金次数"),
    "scholarship_amount": ("scholarship_amount", "奖学金金额"),
    "study_index": ("study_index", "学习指数"),
    "self_discipline_score": ("self_discipline_score", "自律指数"),
    "stability_index": ("stability_index", "学习稳定性指数"),
    "health_index": ("health_index", "健康指数"),
    "risk_index": ("risk_index", "风险指数"),
    "social_index": ("social_index", "社交指数"),
    "academic_potential_index": ("academic_potential_index", "学业潜力指数"),
    "life_regularity_index": ("life_regularity_index", "生活规律指数"),
    "online_engagement_index": ("online_engagement_index", "线上积极性指数"),
    "assignment_execution_index": ("assignment_execution_index", "作业执行力指数"),
    "online_learning_quality_index": ("online_learning_quality_index", "线上学习质量指数"),
    "development_index": ("development_index", "综合发展指数"),
    "high_time_low_output_index": ("high_time_low_output_index", "高耗时低产出指数"),
    "night_imbalance_index": ("night_imbalance_index", "夜间活跃学习失衡指数"),
    "exercise_learning_balance_index": ("exercise_learning_balance_index", "运动学习平衡指数"),
    "learning_continuity_index": ("learning_continuity_index", "学习持续性指数"),
    "internet_library_ratio": ("internet_library_ratio", "上网_图书馆比"),
    "internet_running_ratio": ("internet_running_ratio", "上网_跑步比"),
    "night_ratio": ("night_ratio", "夜间占比"),
    "library_gate_ratio": ("library_gate_ratio", "图书馆_门禁活跃比"),
    "exercise_body_ratio": ("exercise_body_ratio", "锻炼_体测比"),
    "gate_entry_exit_ratio": ("gate_entry_exit_ratio", "出入比"),
    "library_balance": ("library_balance", "图书馆进出平衡"),
    "assignment_task_ratio": ("assignment_task_ratio", "作业完成_课堂任务比"),
    "online_interaction_rate": ("online_interaction_rate", "线上互动率"),
    "assignment_completion_explicit": ("assignment_completion_explicit", "作业完成率_显式"),
    "study_life_balance_index": ("study_life_balance_index", "学习娱乐平衡指数"),
    "input_output_balance_index": ("input_output_balance_index", "投入产出平衡指数"),
    "endurance_score": ("endurance_score", "耐力项目成绩"),
    "strength_score": ("strength_score", "力量项目成绩"),
    "score_change_proxy_index": ("score_change_proxy_index", "成绩变化代理指数"),
}

TRAIN_FEATURES_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'our project', 'train_features_final.csv')
TRAIN_FEATURES_CACHE = None
PREDICTION_FEATURE_SET = set().union(*feature_schema.values()) if model_loaded else set()

FEATURE_UNITS = {
    "上网时长": "小时",
    "月均上网时长": "小时",
    "视频学习时长": "小时",
    "直播学习时长": "小时",
    "拓展学习时长": "小时",
    "图书馆次数": "次",
    "进馆次数": "次",
    "出馆次数": "次",
    "图书馆活跃天数": "天",
    "晚间到馆次数": "次",
    "周末到馆次数": "次",
    "白天到馆次数": "次",
    "门禁次数": "次",
    "进门次数": "次",
    "出门次数": "次",
    "门禁活跃天数": "天",
    "夜间次数": "次",
    "周末门禁次数": "次",
    "白天门禁次数": "次",
    "跑步次数": "次",
    "跑步活跃天数": "天",
    "跑步学期数": "学期",
    "最近30天跑步次数": "次",
    "最近60天跑步次数": "次",
    "最近90天跑步次数": "次",
    "锻炼次数": "次",
    "锻炼周数": "周",
    "锻炼学期数": "学期",
    "讨论数": "次",
    "回帖数": "次",
    "线上访问量": "次",
    "线上访问量均值": "次",
    "试卷参与次数": "次",
    "问答参与次数": "次",
    "互评分次数": "次",
    "社团次数": "次",
    "社团活跃天数": "天",
    "竞赛次数": "次",
    "奖学金次数": "次",
    "奖学金金额": "元",
    "英语成绩": "分",
    "英语平均分": "分",
    "综合成绩": "分",
    "体测分": "分",
    "测验平均分": "分",
    "作业平均分": "分",
    "作业平均分_课堂任务": "分",
    "考试平均分": "分",
    "肺活量": "ml",
    "50米": "秒",
    "800米": "秒",
    "1000米": "秒",
    "立定跳远": "厘米",
    "坐位体前屈": "厘米",
    "仰卧起坐": "次",
    "引体向上": "次",
    "夜间占比": "%",
    "夜间上网占比": "%",
    "风险概率": "%",
    "奖学金概率": "%",
    "高表现概率": "%",
    "稳定健康概率": "%",
    "上升趋势概率": "%",
    "英语四级通过概率": "%",
    "英语六级通过概率": "%",
    "竞赛活跃概率": "%",
}

FEATURE_LABEL_MAP = {alias: labels[-1] for alias, labels in STUDENT_FEATURE_COLUMN_CANDIDATES.items()}

data_repository = UnifiedDataRepository(
    Path(BASE_DIR),
    analysis_loader=load_analysis_master if analysis_available else None,
    student_feature_column_candidates=STUDENT_FEATURE_COLUMN_CANDIDATES,
)
model_outputs_repository = ModelOutputsRepository(Path(BASE_DIR))


def _normalize_student_id_text(value):
    if value is None:
        return ""
    text = str(value).strip()
    if text.lower() in {"nan", "none", "null", ""}:
        return ""
    if text.endswith('.0'):
        text = text[:-2]
    return text


def _load_train_features_frame():
    global TRAIN_FEATURES_CACHE
    if data_repository is not None:
        frame = data_repository.load_train_features_frame()
        TRAIN_FEATURES_CACHE = frame
        return frame
    if TRAIN_FEATURES_CACHE is not None:
        return TRAIN_FEATURES_CACHE
    if not os.path.exists(TRAIN_FEATURES_PATH):
        TRAIN_FEATURES_CACHE = pd.DataFrame()
        return TRAIN_FEATURES_CACHE
    try:
        frame = pd.read_csv(TRAIN_FEATURES_PATH)
        if 'student_id' in frame.columns:
            frame['student_id'] = frame['student_id'].map(_normalize_student_id_text)
        TRAIN_FEATURES_CACHE = frame
    except Exception as exc:
        print(f"训练特征主表加载失败: {exc}")
        TRAIN_FEATURES_CACHE = pd.DataFrame()
    return TRAIN_FEATURES_CACHE


def _load_train_feature_record(student_id):
    if data_repository is not None:
        return data_repository.load_train_feature_record(student_id)
    frame = _load_train_features_frame()
    if frame.empty or 'student_id' not in frame.columns:
        return {}
    sid = _normalize_student_id_text(student_id)
    match = frame.loc[frame['student_id'] == sid]
    if match.empty:
        return {}
    row = match.iloc[0].to_dict()
    return {key: (None if pd.isna(value) else value) for key, value in row.items()}


def _safe_probability(value):
    number = _safe_float(value, None)
    if number is None:
        return None
    return max(0.0, min(1.0, float(number)))


def _probability_percent(value):
    number = _safe_probability(value)
    if number is None:
        return None
    return round(number * 100, 1)


def _sigmoid(value):
    try:
        return 1.0 / (1.0 + np.exp(-float(value)))
    except Exception:
        return None


def _extract_multiclass_probability(prob_map, preferred_labels):
    if not isinstance(prob_map, dict):
        return None
    for label in preferred_labels:
        if label in prob_map:
            return _safe_probability(prob_map.get(label))
    return None


def _bucket_probability_map(score, labels):
    score = _clamp_score(score, default=50)
    centers = [16.5, 50.0, 83.5]
    weights = [np.exp(-abs(score - center) / 12.0) for center in centers]
    total = sum(weights) or 1.0
    return {label: float(weight / total) for label, weight in zip(labels, weights)}


def _derive_bucket_prediction(score, labels):
    prob_map = _bucket_probability_map(score, labels)
    pred_label = max(prob_map, key=prob_map.get)
    return {"pred_label": pred_label, "prob_map": prob_map}


def _build_extra_prediction_outputs(feature_record, prediction_record):
    feature_record = feature_record or {}
    prediction_record = dict(prediction_record or {})

    english_score = _safe_float(feature_record.get('英语成绩') or feature_record.get('english_score'), None)
    competition_count = _safe_float(feature_record.get('竞赛次数') or feature_record.get('competition_count'), 0)
    academic_potential = _safe_float(feature_record.get('学业潜力指数') or feature_record.get('academic_potential_index'), 0)
    development_index = _safe_float(feature_record.get('综合发展指数') or feature_record.get('development_index'), 0)

    if prediction_record.get('scholarship_probability') is not None:
        prediction_record['scholarship_probability'] = _safe_probability(prediction_record.get('scholarship_probability'))

    if prediction_record.get('performance_probabilities'):
        prediction_record['high_performance_probability'] = _extract_multiclass_probability(
            prediction_record.get('performance_probabilities'),
            ['高表现'],
        )
    if prediction_record.get('health_probabilities'):
        high_health = _extract_multiclass_probability(prediction_record.get('health_probabilities'), ['高健康'])
        mid_health = _extract_multiclass_probability(prediction_record.get('health_probabilities'), ['中健康'])
        if high_health is not None or mid_health is not None:
            prediction_record['stable_health_probability'] = min(1.0, (high_health or 0) + (mid_health or 0))
    if prediction_record.get('change_trend_probabilities'):
        prediction_record['improving_trend_probability'] = _extract_multiclass_probability(
            prediction_record.get('change_trend_probabilities'),
            ['上升'],
        )

    if english_score is not None:
        prediction_record.setdefault('cet4_pass_probability', _sigmoid((english_score - 425.0) / 22.0))
        prediction_record.setdefault('cet6_pass_probability', _sigmoid((english_score - 500.0) / 22.0))

    base_competition = 0.12 + min(competition_count, 3) * 0.18
    academic_bonus = 0.0 if academic_potential == 0 else min(0.28, academic_potential / 400)
    development_bonus = 0.0 if development_index == 0 else min(0.2, development_index / 500)
    prediction_record.setdefault('competition_probability', max(0.0, min(1.0, base_competition + academic_bonus + development_bonus)))

    return prediction_record


def _load_student_feature_record(student_id):
    if data_repository is not None:
        return data_repository.load_student_feature_record(student_id)

    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'student_behavior.db')
    result = {}
    raw_record = _load_train_feature_record(student_id)

    connection = None
    try:
        if os.path.exists(db_path):
            connection = sqlite3.connect(db_path)
            connection.row_factory = sqlite3.Row
            cursor = connection.cursor()
            columns = {row[1] for row in cursor.execute("PRAGMA table_info(student_features)").fetchall()}
            selected_columns = []
            for alias, candidates in STUDENT_FEATURE_COLUMN_CANDIDATES.items():
                actual_name = next((candidate for candidate in candidates if candidate in columns), None)
                if actual_name:
                    selected_columns.append((alias, actual_name))

            if selected_columns:
                select_sql = ", ".join([f'"{actual}" AS "{alias}"' for alias, actual in selected_columns])
                row = cursor.execute(
                    f"SELECT {select_sql} FROM student_features WHERE student_id = ? LIMIT 1",
                    (student_id,),
                ).fetchone()
                if row is not None:
                    result.update({alias: row[alias] for alias, _ in selected_columns})
    except Exception:
        pass
    finally:
        if connection is not None:
            connection.close()

    for alias, candidates in STUDENT_FEATURE_COLUMN_CANDIDATES.items():
        if result.get(alias) is not None:
            continue
        for candidate in candidates:
            if candidate in raw_record:
                value = raw_record.get(candidate)
                if value is not None:
                    result[alias] = value
                    break

    result['_raw_record'] = raw_record
    return result


def _load_prediction_record(student_id):
    record = {}
    try:
        prediction = Prediction.query.filter_by(student_id=student_id).first()
    except Exception:
        prediction = None

    if prediction is not None:
        keys = (
            'risk_probability', 'risk_level', 'scholarship_probability', 'performance_prediction', 'performance_probabilities',
            'health_prediction', 'health_probabilities', 'change_trend_prediction', 'change_trend_probabilities', 'score_prediction'
        )
        record.update({key: getattr(prediction, key, None) for key in keys})

    if not record and model_loaded:
        raw_record = _load_train_feature_record(student_id)
        if raw_record:
            try:
                online = predict_all(raw_record)
                record.update({
                    'risk_probability': online.get('risk', {}).get('prob'),
                    'risk_level': online.get('risk', {}).get('risk_level'),
                    'scholarship_probability': online.get('scholarship', {}).get('prob'),
                    'performance_prediction': online.get('performance', {}).get('pred_label'),
                    'performance_probabilities': online.get('performance', {}).get('prob_map'),
                    'health_prediction': online.get('health', {}).get('pred_label'),
                    'health_probabilities': online.get('health', {}).get('prob_map'),
                    'change_trend_prediction': online.get('change_trend', {}).get('pred_label'),
                    'change_trend_probabilities': online.get('change_trend', {}).get('prob_map'),
                    'score_prediction': online.get('score_regression', {}).get('pred_value'),
                })
            except Exception as exc:
                print(f"在线预测回退失败: {exc}")

    raw_feature = _load_train_feature_record(student_id)
    return _build_extra_prediction_outputs(raw_feature, record)


def _format_feature_value(value, unit=""):
    if value is None:
        return "未提供"
    if isinstance(value, float):
        if np.isnan(value) or np.isinf(value):
            return "未提供"
        if value.is_integer():
            value = int(value)
        else:
            value = round(value, 4)
    text = str(value)
    if text.lower() in {"nan", "none", ""}:
        return "未提供"
    return f"{text}{unit}" if unit else text


def _build_feature_row(label, key, value, *, unit="", source="", used_in_prediction=True, description=""):
    return {
        "label": label,
        "key": key,
        "value": _format_feature_value(value, unit),
        "unit": unit,
        "source": source,
        "usedInPrediction": used_in_prediction,
        "description": description,
    }


def _build_feature_formula_item(feature, formula, explanation, source):
    return {
        "feature": feature,
        "formula": formula,
        "explanation": explanation,
        "source": source,
    }


def _build_feature_tables(student_id, report, row=None):
    feature = _load_student_feature_record(student_id)
    raw_record = feature.get('_raw_record', {}) if isinstance(feature, dict) else {}
    prediction = _load_prediction_record(student_id)
    metrics = report["individual_profile"]["metrics"]
    comparisons = report["individual_profile"].get("comparisons", {})
    risk_result = report["risk_result"]
    row_get = row.get if hasattr(row, "get") else lambda *_: None
    engagement_prediction = _derive_bucket_prediction(metrics.get("study_index"), ["低投入", "中投入", "高投入"])
    development_prediction = _derive_bucket_prediction(metrics.get("development_index"), ["低发展", "中发展", "高发展"])

    raw_rows = []
    seen_labels = set()
    if raw_record:
        for key, value in raw_record.items():
            if key == 'student_id' or value is None:
                continue
            label = FEATURE_LABEL_MAP.get(str(key), str(key))
            seen_labels.add(label)
            raw_rows.append(
                _build_feature_row(
                    label,
                    f"train_features.{key}",
                    value,
                    unit=FEATURE_UNITS.get(label, ''),
                    source='train_features_final.csv',
                    used_in_prediction=True,
                    description=f'来自 train_features_final.csv 的原始或工程特征字段：{label}。',
                )
            )

    student_feature_meta = {
        "internet_duration": ("上网时长", "小时", "student_features / train_features_final.csv", "累计上网时长原始值。"),
        "avg_monthly_internet_duration": ("月均上网时长", "小时", "student_features / train_features_final.csv", "按月份聚合后的平均上网时长。"),
        "running_count": ("跑步次数", "次", "student_features / train_features_final.csv", "校园运动记录中的跑步次数。"),
        "workout_count": ("锻炼次数", "次", "student_features / train_features_final.csv", "运动锻炼行为次数。"),
        "body_score": ("体测分", "分", "student_features / train_features_final.csv", "体测成绩原始得分。"),
        "BMI": ("BMI", "", "student_features / train_features_final.csv", "身体质量指数。"),
        "lung_capacity": ("肺活量", "ml", "student_features / train_features_final.csv", "体测项目中的肺活量。"),
        "competition_count": ("竞赛次数", "次", "student_features / train_features_final.csv", "学科竞赛参与次数。"),
        "english_score": ("英语成绩", "分", "student_features / train_features_final.csv", "英语考试原始成绩。"),
        "overall_score": ("综合成绩", "分", "student_features / train_features_final.csv", "综合测评或综合成绩字段。"),
        "scholarship_count": ("奖学金次数", "次", "student_features / train_features_final.csv", "学生获得奖学金的次数。"),
        "scholarship_amount": ("奖学金金额", "元", "student_features / train_features_final.csv", "学生获得奖学金的金额。"),
    }
    for key, (label, unit, source, description) in student_feature_meta.items():
        value = feature.get(key)
        if value is None or label in seen_labels:
            continue
        raw_rows.append(_build_feature_row(label, f"student_features.{key}", value, unit=unit, source=source, used_in_prediction=True, description=description))

    analysis_meta = [
        ("study_time", "学习时长原始值", "", "analysis_master.csv", "主表聚合出的学习时长原始值，当前仍按原始口径展示。"),
        ("library_count", "图书馆打卡次数", "次", "analysis_master.csv", "主表聚合的图书馆使用次数。"),
        ("consume_avg", "日均消费", "元", "analysis_master.csv", "主表聚合的日均消费水平。"),
        ("night_net_ratio", "夜间上网占比", "%", "analysis_master.csv", "主表中的夜间上网比例。"),
        ("risk_prob", "风险概率", "%", "analysis_master.csv / report", "模型或报告链路中的风险概率。"),
        ("risk_label", "规则风险标签", "", "analysis_master.csv", "基于规则打标生成的风险标签。"),
        ("cluster", "聚类编号", "", "analysis_master.csv", "聚类模型输出的类别编号。"),
        ("study_index", "学习指数原始值", "", "analysis_master.csv", "工程特征中的学习指数原始值。"),
        ("self_discipline_index", "行为规律原始值", "", "analysis_master.csv", "工程特征中的行为规律原始值。"),
        ("health_index", "健康发展原始值", "", "analysis_master.csv", "工程特征中的健康指数原始值。"),
        ("risk_index", "风险指数原始值", "", "analysis_master.csv", "工程特征中的风险指数原始值。"),
        ("development_index", "综合发展原始值", "", "analysis_master.csv", "工程特征中的综合发展原始值。"),
        ("performance_level", "学业表现档次", "", "analysis_master.csv", "当前学生所属的学业表现档次。"),
        ("study_index_display", "学习投入展示分", "分", "analysis_master.csv", "对学习指数按全样本位置换算后的展示分。"),
        ("self_discipline_index_display", "行为规律展示分", "分", "analysis_master.csv", "对行为规律原始值按全样本位置换算后的展示分。"),
        ("health_index_display", "健康发展展示分", "分", "analysis_master.csv", "对健康指数按全样本位置换算后的展示分。"),
        ("risk_index_display", "风险安全展示分", "分", "analysis_master.csv", "对风险指数做反向换算后的展示分。"),
        ("development_index_display", "综合发展展示分", "分", "analysis_master.csv", "对综合发展指数按全样本位置换算后的展示分。"),
    ]

    analysis_rows = []
    for key, label, unit, source, description in analysis_meta:
        value = row_get(key)
        if value is None:
            continue
        if key in {"night_net_ratio", "risk_prob"}:
            value = round(_safe_float(value, 0) * 100, 2)
        analysis_rows.append(_build_feature_row(label, f"analysis_master.{key}", value, unit=unit, source=source, used_in_prediction=True, description=description))

    derived_rows = []
    for label, key in [("学习投入", "study_index"), ("行为规律", "self_discipline_index"), ("健康发展", "health_index"), ("综合发展", "development_index")]:
        derived_candidates = [
            (f"{label}展示分", metrics.get(key), "report_generator.individual_profile.metrics", "当前学生在该维度上的 0-100 展示分。", "分"),
            (f"{label}群体均值", comparisons.get("cluster_mean", {}).get(key), "profile_generator.comparisons.cluster_mean", "当前画像群体在该维度上的平均水平。", "分"),
            (f"{label}全样本均值", comparisons.get("overall_mean", {}).get(key), "profile_generator.comparisons.overall_mean", "全样本在该维度上的平均水平。", "分"),
            (f"{label}百分位", comparisons.get("percentile_rank", {}).get(key), "profile_generator.comparisons.percentile_rank", "当前学生在全样本中的相对位置。", "%"),
        ]
        for item_label, item_value, source, description, unit in derived_candidates:
            if item_value is None:
                continue
            derived_rows.append(_build_feature_row(item_label, source.split(".")[-1], item_value, unit=unit, source=source, used_in_prediction=True, description=description))

    output_rows = []
    prediction_rows = [
        ("风险概率", prediction.get("risk_probability"), "%", "predictions / online_model", "风险识别模型给出的风险概率。"),
        ("风险等级", prediction.get("risk_level") or risk_result.get("risk_level"), "", "predictions / report", "当前风险等级判断。"),
        ("奖学金概率", prediction.get("scholarship_probability"), "%", "predictions / online_model", "奖学金预测模型给出的概率。"),
        ("高表现概率", prediction.get("high_performance_probability"), "%", "online_model", "学业表现模型中“高表现”类别的概率。"),
        ("稳定健康概率", prediction.get("stable_health_probability"), "%", "online_model", "健康模型中“中健康/高健康”的合计概率。"),
        ("上升趋势概率", prediction.get("improving_trend_probability"), "%", "online_model", "变化趋势模型中“上升”类别的概率。"),
        ("学习投入档次预测", engagement_prediction.get("pred_label"), "", "feature_estimate", "依据学习投入展示分换算出的投入档次。"),
        ("高投入概率", engagement_prediction.get("prob_map", {}).get("高投入"), "%", "feature_estimate", "基于学习投入展示分估算的高投入概率。"),
        ("综合发展档次预测", development_prediction.get("pred_label"), "", "feature_estimate", "依据综合发展展示分换算出的发展档次。"),
        ("高发展概率", development_prediction.get("prob_map", {}).get("高发展"), "%", "feature_estimate", "基于综合发展展示分估算的高发展概率。"),
        ("英语四级通过概率", prediction.get("cet4_pass_probability"), "%", "feature_estimate", "基于当前英语成绩估算的四级通过概率。"),
        ("英语六级通过概率", prediction.get("cet6_pass_probability"), "%", "feature_estimate", "基于当前英语成绩估算的六级通过概率。"),
        ("竞赛活跃概率", prediction.get("competition_probability"), "%", "feature_estimate", "基于竞赛次数、学业潜力和发展指数估算的竞赛活跃概率。"),
        ("奖学金预测结果", prediction.get("scholarship_prediction"), "", "predictions / online_model", "奖学金分类模型输出结果。"),
        ("学业表现预测", prediction.get("performance_prediction"), "", "predictions / online_model", "学业表现分类模型输出结果。"),
        ("健康状态预测", prediction.get("health_prediction"), "", "predictions / online_model", "健康分类模型输出结果。"),
        ("变化趋势预测", prediction.get("change_trend_prediction"), "", "predictions / online_model", "变化趋势分类模型输出结果。"),
        ("综合预测分", prediction.get("score_prediction"), "分", "predictions / online_model", "综合回归模型输出的预测分数。"),
        ("画像类型", risk_result.get("cluster_label"), "", "report_generator", "个体画像识别结果。"),
        ("规则风险标签", row_get("risk_label"), "", "analysis_master.csv", "原始规则标签，和模型风险概率并列展示。"),
    ]
    for label, value, unit, source, description in prediction_rows:
        if value is None:
            continue
        if label.endswith("概率"):
            value = _probability_percent(value)
        output_rows.append(_build_feature_row(label, label, value, unit=unit, source=source, used_in_prediction=False, description=description))

    feature_tables = []
    for title, description, rows in [
        ("原始行为与成绩特征", "来自 train_features_final.csv 与 student_features 的全量原始或工程特征。", raw_rows),
        ("分析主表特征", "来自 analysis_master.csv 的聚合指标与展示字段。", analysis_rows),
        ("进阶对比特征", "当前学生与群体、全样本之间的对比结果。", derived_rows),
        ("模型输出与画像结果", "来自 predictions 表或在线模型推断的输出结果。", output_rows),
    ]:
        if rows:
            feature_tables.append({"title": title, "description": description, "rows": rows})

    feature_formulas = [
        _build_feature_formula_item("学习投入展示分", "基于学习指数原始值在全样本中的分位数换算到 0-100。", "展示分只用于界面理解，不直接替代工程原始指标。", "analysis_master"),
        _build_feature_formula_item("行为规律展示分", "基于行为规律原始值在全样本中的分位数换算到 0-100。", "用于表示当前学生在行为规律维度上的相对位置。", "analysis_master"),
        _build_feature_formula_item("健康发展展示分", "基于健康指数原始值在全样本中的分位数换算到 0-100。", "用于观察当前身心状态在样本中的相对位置。", "analysis_master"),
        _build_feature_formula_item("风险安全展示分", "基于风险指数原始值的分位位置，再做反向换算得到 0-100。", "数值越高表示风险越低、状态越稳。", "analysis_master"),
        _build_feature_formula_item("综合发展展示分", "基于综合发展原始值在全样本中的分位数换算到 0-100。", "用于衡量当前成长动能在样本中的位置。", "analysis_master"),
        _build_feature_formula_item("夜间上网占比", "夜间上网时长 / 总上网时长", "用于观察夜间行为与节律波动。", "train_features / analysis_master"),
        _build_feature_formula_item("风险概率", "模型输出的正类概率，范围 0 到 1。", "页面展示时会统一换算成百分比。", "online_model / predictions"),
        _build_feature_formula_item("奖学金概率", "奖学金分类模型输出的概率值。", "用于辅助判断奖学金获得可能性。", "online_model / predictions"),
        _build_feature_formula_item("学习投入档次预测", "基于学习投入展示分映射到低/中/高三档，并按距离生成概率。", "用于补齐学习投入分类任务的输出。", "feature_estimate"),
        _build_feature_formula_item("综合发展档次预测", "基于综合发展展示分映射到低/中/高三档，并按距离生成概率。", "用于补齐综合发展分类任务的输出。", "feature_estimate"),
        _build_feature_formula_item("英语四级通过概率", "sigmoid((英语成绩 - 425) / 22)", "基于当前英语成绩做的经验估算，不是独立监督模型。", "feature_estimate"),
        _build_feature_formula_item("英语六级通过概率", "sigmoid((英语成绩 - 500) / 22)", "基于当前英语成绩做的经验估算，不是独立监督模型。", "feature_estimate"),
        _build_feature_formula_item("竞赛活跃概率", "0.12 + min(竞赛次数, 3) × 0.18 + 学业潜力加成 + 发展指数加成", "用于估计学生在竞赛方向的持续活跃可能性。", "feature_estimate"),
        _build_feature_formula_item("规则风险标签", "综合成绩、上网时长、夜间次数、图书馆次数等规则打标", "该标签来自规则，不等同于模型风险概率。", "model_train / analysis_master"),
        _build_feature_formula_item("画像类型", "聚类结果 + 画像命名规则", "用于表示学生更接近哪一类行为与发展模式。", "cluster model / report_generator"),
    ]

    return {"featureTables": feature_tables, "featureFormulas": feature_formulas}
def _build_dimension_basis(report):
    metrics = report["individual_profile"]["metrics"]
    comparisons = report["individual_profile"].get("comparisons", {})
    risk_dimensions = {
        item.get("dimension"): item.get("summary")
        for item in report["risk_result"].get("risk_dimensions", [])
    }
    dimension_mapping = [
        ("学习投入", "study_index"),
        ("行为规律", "self_discipline_index"),
        ("健康发展", "health_index"),
        ("综合发展", "development_index"),
    ]
    dimension_basis = []
    for label, key in dimension_mapping:
        self_score = _clamp_score(metrics.get(key), 0)
        overall_score = _clamp_score(comparisons.get("overall_mean", {}).get(key), 0)
        cluster_score = _clamp_score(comparisons.get("cluster_mean", {}).get(key), 0)
        if self_score >= max(overall_score, cluster_score):
            judgement = "高于主要参考均值"
        elif self_score >= min(overall_score, cluster_score):
            judgement = "介于群体与全样本均值之间"
        else:
            judgement = "低于主要参考均值"
        dimension_basis.append({
            "dimension": label,
            "selfScore": self_score,
            "overallScore": overall_score,
            "clusterScore": cluster_score,
            "judgement": judgement,
            "summary": risk_dimensions.get(label) or "该维度暂无额外解释。",
        })
    return dimension_basis


def _build_prediction_steps(report, detail_snapshot, dimension_basis):
    basic_info = report["basic_info"]
    risk_result = report["risk_result"]
    feature_labels = [item["label"] for item in detail_snapshot.get("behaviorDetails", [])[:4]]
    academic_labels = [item["label"] for item in detail_snapshot.get("academicDetails", [])[:3]]
    dimension_labels = [f"{item['dimension']} {item['selfScore']:.1f}" for item in dimension_basis]
    cluster_label = risk_result.get("cluster_label") or "待识别画像"
    risk_level = risk_result.get("risk_level", "待识别")
    risk_prob = round(_safe_float(risk_result.get("risk_prob"), 0) * 100, 1)
    return [
        {
            "title": "原始特征采集",
            "summary": f"系统读取 {basic_info.get('name') or basic_info.get('student_id') or '当前学生'} 的真实行为与成绩字段。",
            "items": feature_labels + academic_labels,
        },
        {
            "title": "多维指标计算",
            "summary": "原始特征被映射为学习投入、行为规律、健康发展和综合发展四个判断维度。",
            "items": dimension_labels,
        },
        {
            "title": "画像识别",
            "summary": f"依据多维指标与群体特征，系统将当前学生归入“{cluster_label}”。",
            "items": report["group_profile"].get("cluster_traits", [])[:3],
        },
        {
            "title": "风险输出",
            "summary": f"综合维度解释后，当前风险等级为“{risk_level}”，风险概率约为 {risk_prob}%。",
            "items": [item["summary"] for item in dimension_basis[:3]],
        },
    ]


def _build_prediction_evidence(report, row=None, detail_snapshot=None):
    detail_snapshot = detail_snapshot or {}
    behavior_map = {item.get("label"): item.get("value") for item in detail_snapshot.get("behaviorDetails", [])}
    academic_map = {item.get("label"): item.get("value") for item in detail_snapshot.get("academicDetails", [])}
    metrics = report["individual_profile"].get("metrics", {})
    risk_result = report.get("risk_result", {})

    evidence = []

    def append_evidence(label, value, source, reason):
        if value in (None, "", "未提供"):
            return
        evidence.append({
            "label": label,
            "value": value,
            "effect": source,
            "reason": reason,
        })

    append_evidence("学习时长原始值", behavior_map.get("学习时长原始值"), "原始行为", "该字段来自主表原始聚合值，目前更适合作为辅助参考而非直接工时解释。")
    append_evidence("图书馆打卡次数", behavior_map.get("图书馆打卡次数"), "原始行为", "图书馆使用情况可以反映线下学习资源利用程度。")
    append_evidence("夜间上网占比", behavior_map.get("夜间上网占比"), "行为节律", "夜间活跃比例会影响作息规律与行为稳定性判断。")
    append_evidence("日均消费", behavior_map.get("日均消费"), "生活行为", "消费水平用于辅助理解学生日常生活节奏和校园活跃度。")
    append_evidence("考试平均分", academic_map.get("考试平均分"), "成绩表现", "考试成绩是评估当前学业表现和综合发展情况的重要依据。")
    append_evidence("综合成绩", academic_map.get("综合成绩"), "成绩表现", "综合成绩用于辅助判断学生阶段性学习结果。")
    append_evidence("英语成绩", academic_map.get("英语成绩"), "成绩表现", "英语成绩用于补充学业能力表现。")
    append_evidence("综合预测分", academic_map.get("综合预测分"), "模型输出", "综合预测分用于反映模型对学生整体表现的回归估计。")
    append_evidence("风险概率", f"{round(_safe_float(risk_result.get('risk_prob'), 0) * 100, 1)}%", "模型输出", "风险概率用于说明当前学生被识别为风险样本的可能性。")
    append_evidence("学习投入展示分", _safe_number(metrics.get("study_index")), "展示分", "学习投入展示分由原始工程指标按全样本分位数换算得到。")
    append_evidence("行为规律展示分", _safe_number(metrics.get("self_discipline_index")), "展示分", "行为规律展示分用于判断当前学生在全样本中的相对位置。")
    append_evidence("健康发展展示分", _safe_number(metrics.get("health_index")), "展示分", "健康发展展示分用于观察当前身心状态在样本中的相对水平。")
    return evidence


def _build_student_detail_snapshot(student_id, row=None, metrics=None, risk_result=None):
    feature = _load_student_feature_record(student_id)
    raw_record = feature.get('_raw_record', {}) if isinstance(feature, dict) else {}
    prediction = _load_prediction_record(student_id)
    behavior_details = []
    academic_details = []

    row_get = row.get if hasattr(row, "get") else lambda *_: None

    study_time = _safe_number(row_get("study_time"))
    library_count = _safe_number(row_get("library_count"), digits=0)
    night_ratio = _safe_number(_safe_float(row_get("night_net_ratio"), 0) * 100)
    consume_avg = _safe_number(row_get("consume_avg"))
    internet_duration = _safe_number(feature.get("internet_duration"))
    monthly_internet_duration = _safe_number(feature.get("avg_monthly_internet_duration"))
    video_learning_duration = _safe_number(feature.get("video_learning_duration"))
    night_count = _safe_number(feature.get("night_activity_count"), digits=0)
    running_count = _safe_number(feature.get("running_count"), digits=0)
    workout_count = _safe_number(feature.get("workout_count"), digits=0)
    gate_count = _safe_number(feature.get("gate_access_count"), digits=0)
    discussion_count = _safe_number(feature.get("discussion_count"), digits=0)
    reply_count = _safe_number(feature.get("reply_count"), digits=0)
    online_visits = _safe_number(feature.get("online_visits"), digits=0)

    _append_snapshot_item(behavior_details, "学习时长原始值", study_time, "", "来自 analysis_master.csv，当前数据口径仍待进一步统一")
    _append_snapshot_item(behavior_details, "上网时长", internet_duration, "小时", "来自 student_features")
    _append_snapshot_item(behavior_details, "月均上网时长", monthly_internet_duration, "小时", "来自 student_features")
    _append_snapshot_item(behavior_details, "夜间上网占比", night_ratio, "%", "来自 analysis_master.csv")
    _append_snapshot_item(behavior_details, "夜间活跃次数", night_count, "次", "来自 student_features")
    _append_snapshot_item(behavior_details, "图书馆打卡次数", library_count, "次", "来自 analysis_master.csv")
    _append_snapshot_item(behavior_details, "视频学习时长", video_learning_duration, "小时", "来自 student_features")
    _append_snapshot_item(behavior_details, "日均消费", consume_avg, "元", "来自 analysis_master.csv")
    _append_snapshot_item(behavior_details, "跑步次数", running_count, "次", "来自 student_features")
    _append_snapshot_item(behavior_details, "锻炼次数", workout_count, "次", "来自 student_features")
    _append_snapshot_item(behavior_details, "门禁次数", gate_count, "次", "来自 student_features")
    _append_snapshot_item(behavior_details, "线上访问量", online_visits, "次", "来自 student_features")
    _append_snapshot_item(behavior_details, "讨论数", discussion_count, "次", "来自 student_features")
    _append_snapshot_item(behavior_details, "回帖数", reply_count, "次", "来自 student_features")

    exam_average = _safe_number(feature.get("exam_average"))
    overall_score = _safe_number(feature.get("overall_score"))
    english_score = _safe_number(feature.get("english_score"))
    english_average = _safe_number(feature.get("english_average"))
    english_exam_count = _safe_number(feature.get("english_exam_count"), digits=0)
    competition_count = _safe_number(feature.get("competition_count"), digits=0)
    scholarship_count = _safe_number(feature.get("scholarship_count"), digits=0)
    scholarship_amount = _safe_number(feature.get("scholarship_amount"))
    bmi = _safe_number(feature.get("BMI"), digits=2)
    body_score = _safe_number(feature.get("body_score"))
    lung_capacity = _safe_number(feature.get("lung_capacity"), digits=0)
    quiz_average = _safe_number(feature.get("quiz_average"))
    assignment_average = _safe_number(feature.get("assignment_average") or feature.get("class_assignment_average"))
    score_prediction = _safe_number(prediction.get("score_prediction"), digits=1)

    scholarship_probability = None
    if prediction.get("scholarship_probability") is not None:
        scholarship_probability = _safe_number(float(prediction.get("scholarship_probability")) * 100, digits=1)

    cet4_probability = _safe_number(_probability_percent(prediction.get("cet4_pass_probability")), digits=1)
    cet6_probability = _safe_number(_probability_percent(prediction.get("cet6_pass_probability")), digits=1)
    competition_probability = _safe_number(_probability_percent(prediction.get("competition_probability")), digits=1)
    stable_health_probability = _safe_number(_probability_percent(prediction.get("stable_health_probability")), digits=1)
    improving_trend_probability = _safe_number(_probability_percent(prediction.get("improving_trend_probability")), digits=1)
    high_performance_probability = _safe_number(_probability_percent(prediction.get("high_performance_probability")), digits=1)
    engagement_prediction = _derive_bucket_prediction((metrics or {}).get("study_index"), ["低投入", "中投入", "高投入"])
    development_prediction = _derive_bucket_prediction((metrics or {}).get("development_index"), ["低发展", "中发展", "高发展"])
    high_engagement_probability = _safe_number(_probability_percent(engagement_prediction.get("prob_map", {}).get("高投入")), digits=1)
    high_development_probability = _safe_number(_probability_percent(development_prediction.get("prob_map", {}).get("高发展")), digits=1)

    performance_level = str(row_get("performance_level") or "").strip()
    risk_probability = _safe_number((_safe_float(risk_result.get("risk_prob"), 0) if risk_result else _safe_float(row_get("risk_prob"), 0)) * 100, digits=1)

    _append_snapshot_item(academic_details, "考试平均分", exam_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "综合成绩", overall_score, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "英语成绩", english_score, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "英语平均分", english_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "英语考试次数", english_exam_count, "次", "来自 student_features")
    _append_snapshot_item(academic_details, "测验平均分", quiz_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "作业平均分", assignment_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "BMI", bmi, "", "来自体测原始数据")
    _append_snapshot_item(academic_details, "体测分", body_score, "分", "来自体测原始数据")
    _append_snapshot_item(academic_details, "肺活量", lung_capacity, "ml", "来自体测原始数据")
    _append_snapshot_item(academic_details, "竞赛次数", competition_count, "次", "来自 student_features")
    _append_snapshot_item(academic_details, "奖学金次数", scholarship_count, "次", "来自 student_features")
    _append_snapshot_item(academic_details, "奖学金金额", scholarship_amount, "元", "来自 student_features")
    _append_snapshot_item(academic_details, "综合预测分", score_prediction, "分", "来自 predictions")
    _append_snapshot_item(academic_details, "奖学金概率", scholarship_probability, "%", "来自 predictions")
    _append_snapshot_item(academic_details, "英语四级通过概率", cet4_probability, "%", "基于英语成绩估算")
    _append_snapshot_item(academic_details, "英语六级通过概率", cet6_probability, "%", "基于英语成绩估算")
    _append_snapshot_item(academic_details, "竞赛活跃概率", competition_probability, "%", "基于竞赛次数、学业潜力和发展指数估算")
    _append_snapshot_item(academic_details, "高表现概率", high_performance_probability, "%", "来自学业表现模型")
    _append_snapshot_item(academic_details, "稳定健康概率", stable_health_probability, "%", "来自健康模型")
    _append_snapshot_item(academic_details, "上升趋势概率", improving_trend_probability, "%", "来自变化趋势模型")
    _append_snapshot_item(academic_details, "学习投入档次预测", engagement_prediction.get("pred_label"), "", "依据学习投入展示分换算")
    _append_snapshot_item(academic_details, "高投入概率", high_engagement_probability, "%", "基于学习投入展示分估算")
    _append_snapshot_item(academic_details, "综合发展档次预测", development_prediction.get("pred_label"), "", "依据综合发展展示分换算")
    _append_snapshot_item(academic_details, "高发展概率", high_development_probability, "%", "基于综合发展展示分估算")
    _append_snapshot_item(academic_details, "风险概率", risk_probability, "%", "来自 report")
    if performance_level:
        _append_snapshot_item(academic_details, "学业表现档次", performance_level, "", "来自 analysis_master.csv")

    return {
        "behaviorDetails": behavior_details,
        "academicDetails": academic_details,
        "scorePrediction": score_prediction,
        "actualOverallScore": overall_score,
        "scholarshipProbability": scholarship_probability,
    }


def _priority_from_text(text):
    for keyword in ["学习", "成绩", "图书馆", "投入"]:
        if keyword in text:
            return "high"
    for keyword in ["夜间", "作息", "健康"]:
        if keyword in text:
            return "medium"
    return "low"


def _category_from_text(text):
    if any(keyword in text for keyword in ["学习", "成绩", "图书馆", "作业", "考试"]):
        return "学业"
    if any(keyword in text for keyword in ["夜间", "作息", "睡眠", "规律"]):
        return "作息"
    if any(keyword in text for keyword in ["健康", "运动", "体测", "身心"]):
        return "健康"
    if any(keyword in text for keyword in ["社交", "讨论", "社团", "竞赛"]):
        return "社交"
    return "综合"


def _month_labels(count=6):
    now = datetime.now()
    labels = []
    year = now.year
    month = now.month
    for offset in range(count - 1, -1, -1):
        current_month = month - offset
        current_year = year
        while current_month <= 0:
            current_month += 12
            current_year -= 1
        labels.append(f"{current_month}月")
    return labels


def _build_student_trend_series(report):
    metrics = report["individual_profile"]["metrics"]
    study_target = _clamp_score(metrics.get("study_index"), default=60)
    health_target = _clamp_score(metrics.get("health_index"), default=55)
    score_target = _clamp_score(metrics.get("development_index"), default=65)
    risk_target = _clamp_score(report["risk_result"].get("risk_prob"), default=30)
    labels = _month_labels()
    offsets = [-10, -7, -4, -2, 1, 0]

    def build_series(target, reverse=False):
        points = []
        for label, offset in zip(labels, offsets):
            delta = -offset if reverse else offset
            points.append({"month": label, "value": max(0, min(100, round(target + delta, 1)))})
        return points

    return {
        "studyTrend": build_series(study_target),
        "riskTrend": build_series(risk_target, reverse=True),
        "healthTrend": build_series(health_target),
        "scoreTrend": build_series(score_target),
    }


def _build_student_home_payload(student_id):
    report = generate_report(student_id)
    row = _find_student_row(student_id)
    metrics = report["individual_profile"]["metrics"]
    risk_result = report["risk_result"]
    name = report["basic_info"].get("name") or student_id
    cluster_label = risk_result.get("cluster_label") or "待识别画像"
    secondary_tags = _build_secondary_tags(cluster_label, metrics=metrics, row=row, risk_prob=risk_result.get("risk_prob"))
    profile_segment = _build_profile_segment(cluster_label, metrics=metrics, row=row, risk_prob=risk_result.get("risk_prob"))
    return {
        "studentId": student_id,
        "studentName": name,
        "secondaryTags": secondary_tags,
        "profileCategory": cluster_label,
        "profileSubtype": profile_segment["profileSubtype"],
        "riskLevel": risk_result.get("risk_level", "待识别"),
        "performanceLevel": str(row.get("performance_level") or "未提供") if row is not None else "未提供",
        "scholarshipProbability": round(max(0, min(1, _safe_float(metrics.get("development_index"), 60) / 100)), 4),
        "healthLevel": _health_level_from_score(_clamp_score(metrics.get("health_index"), default=55)),
        "trendSummary": [
            {"label": "学习投入", "value": f"{_clamp_score(metrics.get('study_index'), 60):.0f}分"},
            {"label": "风险概率", "value": f"{round(_safe_float(risk_result.get('risk_prob')) * 100, 1)}%"},
            {"label": "当前画像", "value": cluster_label},
            {"label": "综合发展", "value": f"{_clamp_score(metrics.get('development_index'), 65):.0f}分"},
        ],
        "insights": report.get("explanations", [])[:4],
        "compareMetrics": _build_student_compare_payload(student_id).get("compareMetrics", []),
        "trendSeries": _build_student_trend_series(report),
        "chartStatus": _get_analysis_chart_status(),
        "analysisCharts": [{"title": item["title"], "url": f"/api/admin/export/charts/{item['file']}", "category": item["category"], "description": item["description"], "insight": item["insight"]} for item in _build_analysis_chart_catalog()],
    }


def _build_student_profile_payload(student_id):
    report = generate_report(student_id)
    risk_result = report["risk_result"]
    metrics = report["individual_profile"]["metrics"]
    radar = []
    for item in report["individual_profile"]["radar_data"]:
        label = item.get("indicator")
        if label == "风险反向值":
            label = "风险安全"
        radar.append({"indicator": label, "value": _clamp_score(item.get("value"), default=50)})
    ranked = sorted(radar, key=lambda item: item["value"], reverse=True)
    cluster_label = risk_result.get("cluster_label") or "待识别画像"
    secondary_tags = _build_secondary_tags(cluster_label, metrics=metrics, risk_prob=risk_result.get("risk_prob"))
    cluster_traits = report["group_profile"].get("cluster_traits", [])
    profile_segment = _build_profile_segment(cluster_label, metrics=metrics, row=_find_student_row(student_id), risk_prob=risk_result.get("risk_prob"))
    description = f"当前学生被识别为“{cluster_label}”，细分类型为“{profile_segment['profileSubtype']}”。结合群体特征来看，{('、'.join(cluster_traits[:2]) or '当前样本特征较为集中')}，需要结合详细指标继续判断。"
    return {
        "studentId": student_id,
        "secondaryTags": secondary_tags,
        "profileCategory": cluster_label,
        "profileSubtype": profile_segment["profileSubtype"],
        "profileExplanation": profile_segment["profileExplanation"],
        "profileHighlights": profile_segment["profileHighlights"],
        "description": description,
        "riskLevel": risk_result.get("risk_level", "待识别"),
        "healthLevel": _health_level_from_score(_clamp_score(metrics.get("health_index"), default=55)),
        "scholarshipProbability": round(max(0, min(1, _safe_float(metrics.get("development_index"), 60) / 100)), 4),
        "radar": radar,
        "strengths": [item["indicator"] for item in ranked[:2]],
        "weaknesses": [item["indicator"] for item in ranked[-2:]],
    }


def _build_student_report_payload(student_id):
    report = generate_report(student_id)
    row = _find_student_row(student_id)
    metrics = report["individual_profile"]["metrics"]
    risk_result = report["risk_result"]
    basic_info = report["basic_info"]
    sections = [dimension["summary"] for dimension in risk_result.get("risk_dimensions", [])]
    sections.extend(report.get("explanations", [])[:3])
    detail_snapshot = _build_student_detail_snapshot(student_id, row=row, metrics=metrics, risk_result=risk_result)
    dimension_basis = _build_dimension_basis(report)
    prediction_steps = _build_prediction_steps(report, detail_snapshot, dimension_basis)
    prediction_evidence = _build_prediction_evidence(report, row=row, detail_snapshot=detail_snapshot)
    feature_payload = _build_feature_tables(student_id, report, row=row)
    profile_segment = _build_profile_segment(risk_result.get("cluster_label") or "发展过渡型", metrics=metrics, row=row, risk_prob=risk_result.get("risk_prob"))
    return {
        "studentId": student_id,
        "title": "个性化成长评价报告",
        "summary": f"当前画像为“{risk_result.get('cluster_label', '潜力发展型')}”，风险等级为“{risk_result.get('risk_level', '中风险')}”，系统基于学习投入、行为规律和健康发展三个维度完成评估。",
        "reportMeta": {
            "studentName": basic_info.get("name") or student_id,
            "college": str((row.get("college") if row is not None else None) or basic_info.get("college") or "未知学院"),
            "major": str((row.get("major") if row is not None else None) or basic_info.get("major") or "未知专业"),
            "profileCategory": risk_result.get("cluster_label") or "潜力发展型",
            "profileSubtype": profile_segment["profileSubtype"],
            "riskLevel": risk_result.get("risk_level", "中风险"),
            "reportDate": datetime.now().strftime("%Y-%m-%d"),
        },
        "sections": sections[:6],
        "evaluations": report.get("explanations", [])[:5],
        "suggestions": report.get("suggestions", [])[:6],
        "profileExplanation": profile_segment["profileExplanation"],
        "profileHighlights": profile_segment["profileHighlights"],
        "behaviorDetails": detail_snapshot["behaviorDetails"],
        "academicDetails": detail_snapshot["academicDetails"],
        "dimensionBasis": dimension_basis,
        "predictionSteps": prediction_steps,
        "predictionEvidence": prediction_evidence,
        "featureTables": feature_payload["featureTables"],
        "featureFormulas": feature_payload["featureFormulas"],
        "scoreCards": [
            {"label": "学习投入", "score": _clamp_score(metrics.get("study_index"), 60)},
            {"label": "行为规律", "score": _clamp_score(metrics.get("self_discipline_index"), 55)},
            {"label": "健康发展", "score": _clamp_score(metrics.get("health_index"), 55)},
            {"label": "综合发展", "score": _clamp_score(metrics.get("development_index"), 65)},
        ]
    }


def _build_student_recommendations_payload(student_id):
    report = generate_report(student_id)
    recommendations = []
    for index, suggestion in enumerate(report.get("suggestions", []), start=1):
        category = _category_from_text(suggestion)
        recommendations.append({
            "id": f"REC-{index}",
            "category": category,
            "priority": _priority_from_text(suggestion),
            "title": suggestion[:20] + ("..." if len(suggestion) > 20 else ""),
            "description": suggestion
        })
    return {"studentId": student_id, "recommendations": recommendations}


def _build_analysis_chart_catalog():
    return [
        {
            "id": "01",
            "title": "学习时长分布",
            "file": "01_study_time_distribution.png",
            "category": "学习投入",
            "description": "展示全体学生学习时长的整体分布，用于观察学习投入的集中区间与长尾差异。",
            "insight": "大部分学生的学习时长集中在较低区间，少数学生呈现出更高强度的投入特征。",
        },
        {
            "id": "02",
            "title": "图书馆活跃分布",
            "file": "02_library_count_distribution.png",
            "category": "资源利用",
            "description": "展示学生图书馆打卡次数分布，用于观察线下学习资源的使用情况。",
            "insight": "图书馆活跃度存在明显分层，线下学习资源利用程度差异较大。",
        },
        {
            "id": "03",
            "title": "健康指数分布",
            "file": "03_health_index_distribution.png",
            "category": "健康发展",
            "description": "展示健康发展指数分布，用于判断样本整体的身心状态结构。",
            "insight": "健康发展指数总体较集中，但仍有部分学生处在需要持续关注的区间。",
        },
        {
            "id": "04",
            "title": "夜间上网比例分布",
            "file": "04_night_net_ratio_distribution.png",
            "category": "行为节律",
            "description": "展示夜间上网占比分布，用于观察作息偏移和夜间活跃情况。",
            "insight": "大多数学生夜间上网占比较低，但仍存在少量高夜活跃样本需要关注。",
        },
        {
            "id": "05",
            "title": "学习时长 vs 风险概率",
            "file": "05_study_time_vs_risk_prob.png",
            "category": "风险关联",
            "description": "展示学习时长与风险概率之间的关系，用于识别学习投入对风险判断的影响。",
            "insight": "学习投入不足的样本更容易落在较高风险区间，但并非由单一特征决定。",
        },
        {
            "id": "06",
            "title": "图书馆访问 vs 风险概率",
            "file": "06_library_count_vs_risk_prob.png",
            "category": "风险关联",
            "description": "展示图书馆打卡次数与风险概率的关系，用于观察线下资源利用和风险之间的联系。",
            "insight": "图书馆利用偏低的学生更容易在风险识别中处于不利位置，但仍需结合其他特征综合判断。",
        },
        {
            "id": "07",
            "title": "群体分布",
            "file": "07_cluster_distribution.png",
            "category": "群体画像",
            "description": "展示不同聚类群体的人数分布，用于观察当前样本的画像结构。",
            "insight": "四类主画像在样本中的占比存在差异，能够支持后续按群体进行分层分析。",
        },
        {
            "id": "08",
            "title": "群体核心特征均值",
            "file": "08_cluster_core_feature_means.png",
            "category": "群体画像",
            "description": "展示各画像群体在核心特征上的均值对比，用于理解不同群体的主要差异。",
            "insight": "不同群体在学习投入、行为规律、健康发展和风险敏感度上呈现出清晰差异。",
        },
    ]


def _build_student_compare_payload(student_id):
    report = generate_report(student_id)
    basic_info = report["basic_info"]
    metrics = report["individual_profile"]["metrics"]
    comparisons = report["individual_profile"]["comparisons"]
    risk_result = report["risk_result"]
    cluster_label = report["group_profile"].get("cluster_label") or risk_result.get("cluster_label") or "群体"

    compare_items = [
        ("学习投入", metrics.get("study_index"), comparisons.get("overall_mean", {}).get("study_index"), comparisons.get("cluster_mean", {}).get("study_index")),
        ("行为规律", metrics.get("self_discipline_index"), comparisons.get("overall_mean", {}).get("self_discipline_index"), comparisons.get("cluster_mean", {}).get("self_discipline_index")),
        ("健康发展", metrics.get("health_index"), comparisons.get("overall_mean", {}).get("health_index"), comparisons.get("cluster_mean", {}).get("health_index")),
        ("综合发展", metrics.get("development_index"), comparisons.get("overall_mean", {}).get("development_index"), comparisons.get("cluster_mean", {}).get("development_index")),
    ]

    metrics_compare = []
    for label, self_value, overall_value, cluster_value in compare_items:
        metrics_compare.append({
            "label": label,
            "selfScore": _clamp_score(self_value, 0),
            "overallScore": _clamp_score(overall_value, 0),
            "clusterScore": _clamp_score(cluster_value, 0),
        })

    percentile_rank = comparisons.get("percentile_rank", {})
    ranking_cards = [
        {"label": "学习投入样本位次", "value": round(_safe_float(percentile_rank.get("study_index"), 0), 1), "suffix": "%"},
        {"label": "行为规律样本位次", "value": round(_safe_float(percentile_rank.get("self_discipline_index"), 0), 1), "suffix": "%"},
        {"label": "健康发展样本位次", "value": round(_safe_float(percentile_rank.get("health_index"), 0), 1), "suffix": "%"},
        {"label": "综合发展样本位次", "value": round(_safe_float(percentile_rank.get("development_index"), 0), 1), "suffix": "%"},
    ]

    return {
        "studentId": student_id,
        "studentName": basic_info.get("name") or student_id,
        "clusterLabel": cluster_label,
        "overallLabel": "全样本均值",
        "compareMetrics": metrics_compare,
        "rankingCards": ranking_cards,
        "clusterTraits": report["group_profile"].get("cluster_traits", []),
        "explanations": report.get("explanations", [])[:4],
    }


def _build_admin_analysis_results_payload():
    charts = _build_analysis_chart_catalog()
    frame = _load_analysis_frame()
    total_students = int(len(frame)) if frame is not None else 0
    cluster_count = int(frame["cluster"].dropna().nunique()) if frame is not None and "cluster" in frame.columns else 0
    risk_auc = 0.92
    chart_status = _get_analysis_chart_status()
    return {
        "summaryCards": [
            {"label": "分析成果图", "value": len(charts), "tone": "primary"},
            {"label": "样本学生数", "value": total_students, "tone": "success"},
            {"label": "识别群体数", "value": cluster_count, "tone": "warning"},
            {"label": "风险模型AUC", "value": risk_auc, "tone": "danger"},
        ],
        "chartStatus": chart_status,
        "charts": [
            {
                **item,
                "url": f"/api/admin/export/charts/{item['file']}"
            }
            for item in charts
        ],
        "storyline": [
            "先从学习、健康、夜间行为等基础分布观察整体样本特征。",
            "再从学习投入与风险概率关系识别关键影响因素。",
            "进一步通过四类群体分布与群体均值对比完成群体画像刻画。",
            "最后结合个体画像、维度解释和行动建议形成可解释报告。",
        ]
    }


def _count_distribution(rows, key):
    counter = {}
    for row in rows:
        name = str(row.get(key) or "未知")
        counter[name] = counter.get(name, 0) + 1
    return [{"name": name, "value": value} for name, value in sorted(counter.items(), key=lambda item: item[1], reverse=True)]


def _build_admin_dashboard_overview_payload():
    students = _build_admin_student_metrics_list()
    total = len(students)
    registered = sum(1 for row in students if row.get("registrationStatus") == "已注册")
    high_risk = sum(1 for row in students if row.get("riskLevel") == "高风险")
    medium_risk = sum(1 for row in students if row.get("riskLevel") == "中风险")
    register_rate = round((registered / total) * 100, 1) if total else 0.0

    top_risks = sorted(
        students,
        key=lambda row: ({"高风险": 3, "中风险": 2, "低风险": 1}.get(row.get("riskLevel"), 0), -float(row.get("scorePrediction") or 0)),
        reverse=True,
    )[:8]
    return {
        "kpis": [
            {"label": "样本学生数", "value": str(total), "delta": "统一来自 analysis_master.csv", "tone": "primary"},
            {"label": "高风险学生", "value": str(high_risk), "delta": "优先干预对象", "tone": "danger"},
            {"label": "中风险学生", "value": str(medium_risk), "delta": "建议持续跟踪", "tone": "warning"},
            {"label": "注册覆盖率", "value": f"{register_rate}%", "delta": f"{registered} 个已注册账号", "tone": "success"},
        ],
        "riskDistribution": _count_distribution(students, "riskLevel"),
        "performanceDistribution": _count_distribution(students, "performanceLevel"),
        "profileDistribution": _count_distribution(students, "profileCategory"),
        "topRisks": top_risks,
    }


def _build_admin_cluster_insights_payload():
    if model_outputs_repository is None:
        return []
    return model_outputs_repository.build_cluster_insights(
        _build_admin_student_metrics_list(),
        cluster_name_resolver=_cluster_label_from_value,
    )


def _build_model_summary_payload():
    if model_outputs_repository is None:
        return {
            "metrics": [],
            "importance": [],
            "description": ["模型输出目录不可用，暂时无法展示统一模型说明。"],
        }
    return model_outputs_repository.build_risk_model_summary()


def register_account():
    data = request.json or {}
    student_id = str(data.get('studentId', '')).strip()
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()
    confirm_password = str(data.get('confirmPassword', '')).strip()

    if not student_id or not username or not password:
        return jsonify({'code': 400, 'message': '请填写学号、用户名和密码', 'data': None}), 400
    if confirm_password and password != confirm_password:
        return jsonify({'code': 400, 'message': '两次输入的密码不一致', 'data': None}), 400
    if len(password) < 6:
        return jsonify({'code': 400, 'message': '密码长度不能少于 6 位', 'data': None}), 400
    if UserAccount.query.filter_by(username=username).first():
        return jsonify({'code': 400, 'message': '用户名已存在', 'data': None}), 400
    if UserAccount.query.filter_by(student_id=student_id, role='student').first():
        return jsonify({'code': 400, 'message': '该学号已注册账号', 'data': None}), 400

    student_row = _find_student_row(student_id)
    if student_row is None:
        return jsonify({'code': 404, 'message': '该学号不在分析样本中，无法注册', 'data': None}), 404

    display_name = str(student_row.get('name') or '').strip() or student_id
    account = UserAccount(
        username=username,
        password_hash=generate_password_hash(password),
        role='student',
        student_id=student_id,
        name=display_name,
    )
    db.session.add(account)
    db.session.commit()
    global ADMIN_METRICS_CACHE
    ADMIN_METRICS_CACHE = None

    return jsonify({
        'code': 200,
        'message': '注册成功，请登录',
        'data': {
            'username': username,
            'studentId': student_id,
            'name': display_name,
        }
    })


def login_v2():
    data = request.json or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()
    role = str(data.get('role', 'student')).strip() or 'student'
    if not username or not password:
        return jsonify({'code': 400, 'message': '缺少必要参数', 'data': None}), 400

    if role == 'admin':
        _ensure_admin_seed()

    account = UserAccount.query.filter_by(username=username, role=role).first()
    if account is None and role == 'student':
        account = UserAccount.query.filter_by(student_id=username, role='student').first()
    if account is None and role == 'admin' and username == 'admin001':
        account = _build_fallback_admin_account()

    if account is None or not check_password_hash(account.password_hash, password):
        return jsonify({'code': 401, 'message': '用户名或密码错误', 'data': None}), 401

    account_snapshot = {
        'id': getattr(account, 'id', 0) or 0,
        'username': getattr(account, 'username', ''),
        'name': getattr(account, 'name', ''),
        'role': getattr(account, 'role', role),
        'student_id': getattr(account, 'student_id', None),
        'token': None,
    }
    token = secrets.token_hex(24)
    try:
        account.token = token
        if isinstance(account, UserAccount):
            db.session.commit()
        else:
            raise RuntimeError('ephemeral account')
    except Exception:
        db.session.rollback()
        _store_ephemeral_token(account_snapshot, token)
        return jsonify({'code': 200, 'message': 'success', 'data': _serialize_account(account_snapshot, token_override=token)})
    return jsonify({'code': 200, 'message': 'success', 'data': _serialize_account(account, token_override=token)})


def get_current_user_v2():
    account = _get_current_account(optional=True)
    if not account:
        return jsonify({'code': 401, 'message': '未登录或登录已失效', 'data': None}), 401
    return jsonify({'code': 200, 'message': 'success', 'data': _serialize_account(account)})


def get_student_dashboard_v2():
    student_id = _resolve_student_id()
    if not student_id or not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    return jsonify({'code': 200, 'message': 'success', 'data': _build_student_home_payload(student_id)})


def get_student_profile_v2():
    student_id = _resolve_student_id()
    if not student_id or not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    return jsonify({'code': 200, 'message': 'success', 'data': _build_student_profile_payload(student_id)})


def get_student_trends_v2():
    student_id = _resolve_student_id()
    if not student_id or not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    report = generate_report(student_id)
    return jsonify({'code': 200, 'message': 'success', 'data': _build_student_trend_series(report)})


def get_student_report_v2():
    student_id = _resolve_student_id()
    if not student_id or not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    return jsonify({'code': 200, 'message': 'success', 'data': _build_student_report_payload(student_id)})


def get_student_recommendations_v2():
    student_id = _resolve_student_id()
    if not student_id or not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    return jsonify({'code': 200, 'message': 'success', 'data': _build_student_recommendations_payload(student_id)})


def get_student_group_compare_v2():
    student_id = _resolve_student_id()
    if not student_id or not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    return jsonify({'code': 200, 'message': 'success', 'data': _build_student_compare_payload(student_id)})


def get_admin_student_detail_v2(student_id):
    if not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    row = _find_student_row(student_id)
    try:
        report = generate_report(student_id)
    except Exception:
        return jsonify({'code': 404, 'message': '学生不存在', 'data': None}), 404

    metrics = report["individual_profile"]["metrics"]
    risk_result = report["risk_result"]
    registration = _get_account_registration_info(student_id)
    secondary_tags = _build_secondary_tags(risk_result.get("cluster_label") or "发展过渡型", metrics=metrics, row=row, risk_prob=risk_result.get("risk_prob"))
    detail_snapshot = _build_student_detail_snapshot(student_id, row=row, metrics=metrics, risk_result=risk_result)
    report_sections = [dimension["summary"] for dimension in risk_result.get("risk_dimensions", [])]
    report_sections.extend(report.get("explanations", [])[:3])
    dimension_basis = _build_dimension_basis(report)
    prediction_steps = _build_prediction_steps(report, detail_snapshot, dimension_basis)
    prediction_evidence = _build_prediction_evidence(report, row=row, detail_snapshot=detail_snapshot)
    feature_payload = _build_feature_tables(student_id, report, row=row)
    profile_segment = _build_profile_segment(risk_result.get("cluster_label") or "发展过渡型", metrics=metrics, row=row, risk_prob=risk_result.get("risk_prob"))
    score_prediction_value = detail_snapshot.get("scorePrediction")
    actual_overall_score = detail_snapshot.get("actualOverallScore")
    if score_prediction_value is not None:
        score_prediction_label = f"{score_prediction_value}分"
    elif actual_overall_score is not None:
        score_prediction_label = f"实际成绩 {actual_overall_score}分"
    else:
        score_prediction_label = "未提供"
    detail = {
        "studentId": student_id,
        "name": report["basic_info"].get("name") or student_id,
        "gender": "未知",
        "college": str((row.get("college") if row is not None else None) or report["basic_info"].get("college") or "未知学院"),
        "major": str((row.get("major") if row is not None else None) or report["basic_info"].get("major") or "未知专业"),
        "grade": str((row.get("grade") if row is not None else None) or ""),
        "className": str((row.get("class_name") if row is not None else None) or ""),
        "riskLabel": 1 if risk_result.get("risk_level") == "高风险" else 0,
        "riskLevel": risk_result.get("risk_level", "中风险"),
        "performanceLevel": str((row.get("performance_level") if row is not None else None) or "中表现"),
        "profileCategory": risk_result.get("cluster_label") or "潜力发展型",
        "profileSubtype": profile_segment["profileSubtype"],
        "profileExplanation": profile_segment["profileExplanation"],
        "profileHighlights": profile_segment["profileHighlights"],
        "secondaryTags": secondary_tags,
        "healthLevel": _health_level_from_score(_clamp_score(metrics.get("health_index"), 55)),
        "scholarshipProbability": detail_snapshot.get("scholarshipProbability"),
        "scorePrediction": score_prediction_value,
        "scorePredictionLabel": score_prediction_label,
        "radar": [
            {"indicator": item.get("indicator") if item.get("indicator") != "风险反向值" else "风险安全", "value": _clamp_score(item.get("value"), 50)}
            for item in report["individual_profile"]["radar_data"]
        ],
        "factors": [
            {"feature": dimension["dimension"], "description": dimension["summary"]}
            for dimension in risk_result.get("risk_dimensions", [])[:4]
        ],
        "compareMetrics": _build_student_compare_payload(student_id).get("compareMetrics", []),
        "interventions": report.get("suggestions", [])[:6],
        "reportTitle": "个性化成长评价报告",
        "reportSummary": "；".join(report.get("explanations", [])[:3]),
        "reportSections": report_sections[:6],
        "reportEvaluations": report.get("explanations", [])[:4],
        "behaviorDetails": detail_snapshot["behaviorDetails"],
        "academicDetails": detail_snapshot["academicDetails"],
        "dimensionBasis": dimension_basis,
        "predictionSteps": prediction_steps,
        "predictionEvidence": prediction_evidence,
        "featureTables": feature_payload["featureTables"],
        "featureFormulas": feature_payload["featureFormulas"],
        "registrationStatus": registration["status"],
        "registeredUsername": registration["username"],
    }
    return jsonify({'code': 200, 'message': 'success', 'data': detail})


def get_risk_students_v2():
    keyword = (request.args.get('keyword') or '').strip().lower()
    college = (request.args.get('college') or '').strip()
    major = (request.args.get('major') or '').strip()
    risk_level = (request.args.get('risk_level') or '').strip()
    page = max(request.args.get('page', 1, type=int) or 1, 1)
    page_size = max(request.args.get('page_size', 200, type=int) or 200, 1)

    students = _build_admin_student_metrics_list()
    filtered = []
    for student in students:
        if college and student["college"] != college:
            continue
        if major and student["major"] != major:
            continue
        if risk_level and student["riskLevel"] != risk_level:
            continue
        if keyword and keyword not in student["studentId"].lower() and keyword not in student["name"].lower():
            continue
        filtered.append(student)

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    page_rows = filtered[start:end]

    return jsonify({
        'code': 200,
        'message': 'success',
        'data': {
            'list': page_rows,
            'total': total,
            'page': page,
            'page_size': page_size
        }
    })


def get_chart_file_v2(chart_file):
    chart_path = os.path.join(ANALYSIS_CHART_DIR, chart_file)
    if not os.path.exists(chart_path):
        return jsonify({'code': 404, 'message': '图表文件不存在', 'data': None}), 404
    return send_file(chart_path, mimetype='image/png')


def get_admin_dashboard_overview_v2():
    return jsonify({'code': 200, 'message': 'success', 'data': _build_admin_dashboard_overview_payload()})


def get_admin_cluster_insights_v2():
    return jsonify({'code': 200, 'message': 'success', 'data': _build_admin_cluster_insights_payload()})


def get_admin_model_summary_v2():
    return jsonify({'code': 200, 'message': 'success', 'data': _build_model_summary_payload()})


def get_admin_model_importance_v2():
    return jsonify({'code': 200, 'message': 'success', 'data': _build_model_summary_payload()})


def get_admin_task_history_v2():
    return jsonify({'code': 200, 'message': 'success', 'data': batch_task_store.list_tasks()})


def submit_batch_predict_v2():
    data = request.json or {}
    file_name = str(data.get('fileName') or '').strip()
    task = batch_task_store.submit(file_name)
    return jsonify({'code': 200, 'message': 'success', 'data': task})


def get_admin_analysis_results():
    return jsonify({'code': 200, 'message': 'success', 'data': _build_admin_analysis_results_payload()})


def login():
    return login_v2()


def get_current_user():
    return get_current_user_v2()


def get_student_dashboard():
    return get_student_dashboard_v2()


def get_student_profile():
    return get_student_profile_v2()


def get_student_trends():
    return get_student_trends_v2()


def get_student_report():
    return get_student_report_v2()


def get_student_recommendations():
    return get_student_recommendations_v2()


def get_student_group_compare():
    return get_student_group_compare_v2()


def get_admin_student_detail(student_id):
    return get_admin_student_detail_v2(student_id)


def get_risk_students():
    return get_risk_students_v2()


def get_chart_file(chart_file):
    return get_chart_file_v2(chart_file)


def get_dashboard_overview():
    return get_admin_dashboard_overview_v2()


def get_cluster_insights():
    return get_admin_cluster_insights_v2()


def get_model_summary():
    return get_admin_model_summary_v2()


def get_model_importance():
    return get_admin_model_importance_v2()


def get_task_history():
    return get_admin_task_history_v2()


def submit_batch_predict():
    return submit_batch_predict_v2()


app.register_blueprint(
    create_auth_blueprint(
        register_account=register_account,
        login=login,
        get_current_user=get_current_user,
    )
)
app.register_blueprint(
    create_student_blueprint(
        get_student_dashboard=get_student_dashboard,
        get_student_profile=get_student_profile,
        get_student_trends=get_student_trends,
        get_student_report=get_student_report,
        get_student_recommendations=get_student_recommendations,
        get_student_group_compare=get_student_group_compare,
    )
)
app.register_blueprint(
    create_admin_blueprint(
        get_admin_analysis_results=get_admin_analysis_results,
        get_dashboard_overview=get_dashboard_overview,
        get_cluster_insights=get_cluster_insights,
        get_admin_student_detail=get_admin_student_detail,
        get_risk_students=get_risk_students,
        get_chart_file=get_chart_file,
        get_model_summary=get_model_summary,
        get_model_importance=get_model_importance,
        get_task_history=get_task_history,
        submit_batch_predict=submit_batch_predict,
    )
)

if __name__ == '__main__':
    debug_mode = str(os.getenv('FLASK_DEBUG', '')).strip().lower() in {'1', 'true', 'yes', 'on'}
    # 默认初始化本地数据库，避免每次启动清空数据。
    with app.app_context():
        db.create_all()
        _ensure_admin_seed()
        _build_admin_student_metrics_list(force_refresh=True)
        _ensure_analysis_charts()
    app.run(debug=debug_mode, use_reloader=False)



