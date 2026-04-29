import os
from pathlib import Path

def _load_env_file() -> None:
    env_path = Path(__file__).resolve().with_name('.env')
    if not env_path.exists():
        return
    for raw_line in env_path.read_text(encoding='utf-8').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)

_load_env_file()

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sqlite3
from sqlalchemy import event as sqlalchemy_event
from sqlalchemy.engine import Engine
from flask_sqlalchemy import SQLAlchemy
import json
import joblib
import pandas as pd
import numpy as np
import sys
import secrets
from datetime import UTC, datetime, timedelta
from functools import wraps
from types import SimpleNamespace
from werkzeug.security import generate_password_hash, check_password_hash

from backend import (
    DataQualityService,
    InMemoryBatchTaskStore,
    ModelOutputsRepository,
    UnifiedDataRepository,
    build_risk_drivers,
    build_structured_actions,
)
from backend.routes.admin import create_admin_blueprint
from backend.routes.auth import create_auth_blueprint
from backend.routes.student import create_student_blueprint

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PRIMARY_DB_PATH = os.path.join(BASE_DIR, 'student_behavior.db')
TOKEN_TTL_HOURS = float(os.getenv('TOKEN_TTL_HOURS', '12'))
TOKEN_TTL_DELTA = timedelta(hours=TOKEN_TTL_HOURS)
PASSWORD_HASH_METHOD = os.getenv('PASSWORD_HASH_METHOD', 'pbkdf2:sha256:600000')

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

def _parse_allowed_origins(raw_origins: str):
    origins = [item.strip() for item in (raw_origins or '').split(',') if item.strip()]
    return origins or '*'


# 启用 CORS
CORS(
    app,
    resources={r"/api/*": {"origins": _parse_allowed_origins(os.getenv('ALLOWED_ORIGINS', '*'))}},
    supports_credentials=False,
)


def _resolve_database_url(raw_url: str) -> str:
    normalized_url = (raw_url or '').strip()
    if not normalized_url:
        return f"sqlite:///{PRIMARY_DB_PATH}"

    if not normalized_url.startswith('sqlite:///'):
        return normalized_url

    sqlite_path = normalized_url[len('sqlite:///'):]
    if sqlite_path and not os.path.isabs(sqlite_path):
        sqlite_path = os.path.join(BASE_DIR, sqlite_path)

    # 环境文件曾出现乱码路径，导致运行时意外连到错误数据库。
    if not sqlite_path or not os.path.exists(sqlite_path):
        return f"sqlite:///{PRIMARY_DB_PATH}"

    return f"sqlite:///{sqlite_path}"


# 数据库配置
database_url = _resolve_database_url(os.getenv('DATABASE_URL', ''))
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
engine_options = {}
if str(database_url).startswith('sqlite'):
    engine_options['connect_args'] = {'timeout': 15}
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options

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
ADMIN_METRICS_CACHE_SIGNATURE = None
STUDENT_REPORT_CACHE = {}
STUDENT_REPORT_CACHE_SIGNATURE = None
RISK_THRESHOLD_CACHE = None
data_repository = None
model_outputs_repository = None
data_quality_service = None
batch_task_store = InMemoryBatchTaskStore()
RUNTIME_INITIALIZED = False

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
    token_expires_at = db.Column(db.DateTime, nullable=True, index=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=True, index=True)
    role = db.Column(db.String(20), nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False, index=True)
    resource = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(20), nullable=False, default='success', index=True)
    ip_address = db.Column(db.String(64), nullable=True)
    detail = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), index=True)

# 加载预测模型
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

# 加载模型和配置
def load_model_package(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"找不到模型文件: {path}")
    return joblib.load(path)


def load_optional_model_package(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        return None
    try:
        return joblib.load(path)
    except Exception as exc:
        print(f"可选模型加载失败 {filename}: {exc}")
        return None

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

learning_engagement_pkg = load_optional_model_package("learning_engagement_model.joblib")
development_pkg = load_optional_model_package("development_model.joblib")
cet4_pkg = load_optional_model_package("cet4_model.joblib")
cet6_pkg = load_optional_model_package("cet6_model.joblib")

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
            "learning_engagement": {
                "pred_label": "中投入",
                "prob_map": {
                    "低投入": 0.2,
                    "中投入": 0.6,
                    "高投入": 0.2
                }
            },
            "development": {
                "pred_label": "中发展",
                "prob_map": {
                    "低发展": 0.2,
                    "中发展": 0.6,
                    "高发展": 0.2
                }
            },
            "cet4": {
                "pred_label": 1,
                "prob": 0.7
            },
            "cet6": {
                "pred_label": 0,
                "prob": 0.45
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
    if learning_engagement_pkg is not None:
        result["learning_engagement"] = predict_multiclass(learning_engagement_pkg, input_dict)
    if development_pkg is not None:
        result["development"] = predict_multiclass(development_pkg, input_dict)
    if cet4_pkg is not None:
        result["cet4"] = predict_binary(cet4_pkg, input_dict)
    if cet6_pkg is not None:
        result["cet6"] = predict_binary(cet6_pkg, input_dict)
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
    global RISK_THRESHOLD_CACHE
    if RISK_THRESHOLD_CACHE is None:
        RISK_THRESHOLD_CACHE = get_risk_level_thresholds()
    low_threshold, high_threshold = RISK_THRESHOLD_CACHE
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


def _path_signature(path):
    target = os.fspath(path)
    try:
        stats = os.stat(target)
    except OSError:
        return None
    return (int(stats.st_mtime_ns), int(stats.st_size))


def _student_account_signature():
    try:
        count = UserAccount.query.filter_by(role='student').count()
        latest = UserAccount.query.filter_by(role='student').order_by(UserAccount.updated_at.desc(), UserAccount.id.desc()).first()
    except Exception:
        return None
    if latest is None:
        return (int(count), "", 0)
    updated_at = getattr(latest, 'updated_at', None)
    return (
        int(count),
        updated_at.isoformat() if updated_at is not None else "",
        int(getattr(latest, 'id', 0) or 0),
    )


def _analysis_source_signature():
    analysis_path = data_repository.analysis_master_path if data_repository is not None else os.path.join(BASE_DIR, 'our project', 'analysis_master.csv')
    return (
        _path_signature(analysis_path),
        _path_signature(PRIMARY_DB_PATH),
    )


def _current_admin_metrics_signature():
    return (_analysis_source_signature(), _student_account_signature())


def _current_student_report_signature():
    return (
        _analysis_source_signature(),
        _path_signature(TRAIN_FEATURES_PATH),
    )


def _reset_data_repository_cache(*, analysis=False, train_features=False):
    if data_repository is None:
        return
    if analysis and hasattr(data_repository, '_analysis_frame_cache'):
        data_repository._analysis_frame_cache = None
    if train_features and hasattr(data_repository, '_train_features_cache'):
        data_repository._train_features_cache = None


def _refresh_runtime_caches_if_needed():
    global ADMIN_METRICS_CACHE, ADMIN_METRICS_CACHE_SIGNATURE, STUDENT_REPORT_CACHE, STUDENT_REPORT_CACHE_SIGNATURE, TRAIN_FEATURES_CACHE, TRAIN_FEATURES_CACHE_SIGNATURE

    admin_signature = _current_admin_metrics_signature()
    if ADMIN_METRICS_CACHE_SIGNATURE != admin_signature:
        ADMIN_METRICS_CACHE = None
        ADMIN_METRICS_CACHE_SIGNATURE = admin_signature
        _reset_data_repository_cache(analysis=True)

    train_features_signature = _path_signature(TRAIN_FEATURES_PATH)
    if TRAIN_FEATURES_CACHE_SIGNATURE != train_features_signature:
        TRAIN_FEATURES_CACHE = None
        TRAIN_FEATURES_CACHE_SIGNATURE = train_features_signature
        _reset_data_repository_cache(train_features=True)

    report_signature = _current_student_report_signature()
    if STUDENT_REPORT_CACHE_SIGNATURE != report_signature:
        STUDENT_REPORT_CACHE = {}
        STUDENT_REPORT_CACHE_SIGNATURE = report_signature
        _reset_data_repository_cache(analysis=True, train_features=True)


def _build_admin_student_metrics_row(row, registration_lookup=None):
    student_id = str(row.get("student_id") or "")
    cluster_label = _cluster_label_from_value(row.get("cluster"))
    registration = registration_lookup.get(student_id) if registration_lookup is not None else None
    if registration is None:
        registration = _get_account_registration_info(student_id)
    risk_prob = _safe_float(row.get("risk_prob"))
    development_score = _get_display_metric(row=row, key="development_index", default=50)
    subtype_map = {
        "高投入稳健型": "节律稳定稳健子类",
        "低投入风险型": "基础薄弱待补强子类",
        "夜间波动型": "夜间偏移观察子类",
        "发展过渡型": "适应调整过渡子类",
    }
    secondary_tag_map = {
        "高投入稳健型": ["学习投入积极", "行为规律稳定"],
        "低投入风险型": ["学习投入不足", "风险敏感关注"],
        "夜间波动型": ["夜间活跃偏高", "作息波动明显"],
        "发展过渡型": ["成长过渡观察", "发展潜力待释放"],
    }
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
        "profileSubtype": subtype_map.get(cluster_label, "适应调整过渡子类"),
        "secondaryTags": secondary_tag_map.get(cluster_label, ["成长状态待观察"]),
        "healthLevel": _health_level_from_score(_get_display_metric(row=row, key="health_index", default=50)),
        "scholarshipProbability": round(max(0, min(1, development_score / 100)), 4),
        "scorePrediction": development_score,
        "registrationStatus": registration["status"],
        "registeredUsername": registration["username"],
    }


def _build_admin_student_metrics_list(force_refresh=False):
    global ADMIN_METRICS_CACHE, ADMIN_METRICS_CACHE_SIGNATURE
    current_signature = _current_admin_metrics_signature()
    if ADMIN_METRICS_CACHE_SIGNATURE != current_signature:
        ADMIN_METRICS_CACHE = None
        ADMIN_METRICS_CACHE_SIGNATURE = current_signature
    if ADMIN_METRICS_CACHE is not None and not force_refresh:
        return ADMIN_METRICS_CACHE
    frame = _load_analysis_frame()
    if frame is None or frame.empty:
        return []
    registration_lookup = _load_student_registration_lookup()
    rows = [
        _build_admin_student_metrics_row(item, registration_lookup=registration_lookup)
        for item in frame.to_dict(orient="records")
    ]
    ADMIN_METRICS_CACHE = rows
    ADMIN_METRICS_CACHE_SIGNATURE = current_signature
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


def _get_student_report(student_id, *, force_refresh=False):
    global STUDENT_REPORT_CACHE_SIGNATURE
    cache_key = str(student_id).strip()
    if not cache_key:
        raise ValueError('student_id is required')
    current_signature = _current_student_report_signature()
    if STUDENT_REPORT_CACHE_SIGNATURE != current_signature:
        STUDENT_REPORT_CACHE.clear()
        STUDENT_REPORT_CACHE_SIGNATURE = current_signature
    if not force_refresh and cache_key in STUDENT_REPORT_CACHE:
        return STUDENT_REPORT_CACHE[cache_key]
    report = generate_report(cache_key)
    STUDENT_REPORT_CACHE[cache_key] = report
    STUDENT_REPORT_CACHE_SIGNATURE = current_signature
    return report


def _build_lightweight_student_context(student_id):
    row = _find_student_row(student_id)
    if row is None:
        raise ValueError('student not found')

    metrics = {
        "study_time": _safe_float(row.get("study_time"), 0),
        "library_count": _safe_float(row.get("library_count"), 0),
        "night_net_ratio": _safe_float(row.get("night_net_ratio"), 0),
        "study_index": _get_display_metric(row=row, key="study_index", default=50),
        "self_discipline_index": _get_display_metric(row=row, key="self_discipline_index", default=50),
        "health_index": _get_display_metric(row=row, key="health_index", default=50),
        "development_index": _get_display_metric(row=row, key="development_index", default=50),
        "risk_prob": _safe_float(row.get("risk_prob"), 0),
    }

    cluster_label = str(
        row.get("cluster_label")
        or row.get("profileCategoryName")
        or row.get("profile_category_name")
        or row.get("profileCategory")
        or "发展过渡型"
    )
    risk_prob = metrics["risk_prob"]
    risk_level = str(row.get("risk_level") or row.get("riskLevel") or ("高风险" if risk_prob >= 0.6 else "中风险" if risk_prob >= 0.3 else "低风险"))
    performance_level = str(row.get("performance_level") or row.get("performanceLevel") or "中表现")
    basic_info = {
        "student_id": student_id,
        "name": str(row.get("name") or student_id),
        "college": str(row.get("college") or "未知学院"),
        "major": str(row.get("major") or "未知专业"),
    }
    profile_segment = _build_profile_segment(cluster_label, metrics=metrics, row=row, risk_prob=risk_prob)
    secondary_tags = _build_secondary_tags(cluster_label, metrics=metrics, row=row, risk_prob=risk_prob)

    compare_metrics = [
        {
            "label": "学习投入",
            "selfScore": _clamp_score(metrics.get("study_index"), 50),
            "overallScore": 55,
            "clusterScore": 52,
        },
        {
            "label": "行为规律",
            "selfScore": _clamp_score(metrics.get("self_discipline_index"), 50),
            "overallScore": 58,
            "clusterScore": 54,
        },
        {
            "label": "健康发展",
            "selfScore": _clamp_score(metrics.get("health_index"), 50),
            "overallScore": 60,
            "clusterScore": 56,
        },
        {
            "label": "综合发展",
            "selfScore": _clamp_score(metrics.get("development_index"), 50),
            "overallScore": 57,
            "clusterScore": 53,
        },
    ]

    trend_series = [
        {"label": "学习投入", "value": _clamp_score(metrics.get("study_index"), 50)},
        {"label": "行为规律", "value": _clamp_score(metrics.get("self_discipline_index"), 50)},
        {"label": "健康发展", "value": _clamp_score(metrics.get("health_index"), 50)},
        {"label": "综合发展", "value": _clamp_score(metrics.get("development_index"), 50)},
        {"label": "风险安全", "value": _clamp_score(1 - risk_prob, 50)},
    ]

    return {
        "row": row,
        "basic_info": basic_info,
        "metrics": metrics,
        "risk_result": {
            "risk_level": risk_level,
            "risk_prob": risk_prob,
            "cluster_label": cluster_label,
            "performance_level": performance_level,
        },
        "secondary_tags": secondary_tags,
        "profile_segment": profile_segment,
        "compare_metrics": compare_metrics,
        "trend_series": trend_series,
    }


ROLE_PERMISSIONS = {
    'admin': ['admin:read', 'admin:write', 'student:read'],
    'student': ['student:self'],
    'school_admin': ['admin:read', 'admin:write', 'student:read'],
    'college_admin': ['admin:read', 'student:read'],
    'counselor': ['student:read'],
}


def _utcnow():
    return datetime.now(UTC).replace(tzinfo=None)


def _hash_password(password):
    return generate_password_hash(password, method=PASSWORD_HASH_METHOD)


def _client_ip():
    forwarded = request.headers.get('X-Forwarded-For', '').strip()
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or ''


def _log_audit_event(action, *, status='success', resource='', account=None, username=None, role=None, detail=''):
    try:
        payload = AuditLog(
            username=username or getattr(account, 'username', None),
            role=role or getattr(account, 'role', None),
            action=action,
            resource=resource,
            status=status,
            ip_address=_client_ip(),
            detail=detail[:1000] if detail else None,
        )
        db.session.add(payload)
        db.session.commit()
    except Exception:
        db.session.rollback()


def _parse_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.astimezone(UTC).replace(tzinfo=None) if value.tzinfo else value
    text = str(value).strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text)
        return parsed.astimezone(UTC).replace(tzinfo=None) if parsed.tzinfo else parsed
    except Exception:
        return None


def _build_token_expiry():
    return _utcnow() + TOKEN_TTL_DELTA


def _is_token_expired(expires_at):
    parsed = _parse_datetime(expires_at)
    if parsed is None:
        return True
    return parsed <= _utcnow()


def _clear_account_token(account):
    try:
        account.token = None
        if hasattr(account, 'token_expires_at'):
            account.token_expires_at = None
        db.session.commit()
    except Exception:
        db.session.rollback()


def _issue_token_for_account(account):
    token = secrets.token_hex(24)
    expires_at = _build_token_expiry()
    if isinstance(account, UserAccount):
        account.token = token
        account.token_expires_at = expires_at
        account.last_login_at = _utcnow()
        db.session.commit()
    return token, expires_at


def require_roles(*allowed_roles):
    allowed = {role for role in allowed_roles if role}

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            account = _get_current_account(optional=True)
            if not account:
                _log_audit_event(
                    'auth_required',
                    status='denied',
                    resource=request.path,
                    detail=f"allowed_roles={sorted(allowed)}",
                )
                return jsonify({'code': 401, 'message': '未登录或登录已失效', 'data': None}), 401
            role = getattr(account, 'role', '')
            if allowed and role not in allowed:
                _log_audit_event(
                    'permission_denied',
                    status='denied',
                    resource=request.path,
                    account=account,
                    detail=f"allowed_roles={sorted(allowed)}",
                )
                return jsonify({'code': 403, 'message': '当前账号没有访问该资源的权限', 'data': None}), 403
            return func(*args, **kwargs)

        return wrapper

    return decorator


def _ensure_runtime_schema():
    statements = []
    with db.engine.begin() as connection:
        if db.engine.dialect.name == 'sqlite':
            columns = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(user_accounts)").fetchall()}
            if 'token_expires_at' not in columns:
                statements.append("ALTER TABLE user_accounts ADD COLUMN token_expires_at DATETIME")
            if 'last_login_at' not in columns:
                statements.append("ALTER TABLE user_accounts ADD COLUMN last_login_at DATETIME")
            for statement in statements:
                connection.exec_driver_sql(statement)


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
        if _is_token_expired(getattr(account, 'token_expires_at', None)):
            _log_audit_event('token_expired', status='denied', resource=request.path, account=account)
            _clear_account_token(account)
            return None if optional else None
        return account
    cached = EPHEMERAL_TOKEN_CACHE.get(token)
    if cached:
        if _is_token_expired(cached.get('token_expires_at')):
            EPHEMERAL_TOKEN_CACHE.pop(token, None)
            _log_audit_event(
                'token_expired',
                status='denied',
                resource=request.path,
                username=cached.get('username'),
                role=cached.get('role'),
            )
            return None if optional else None
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
        token_expires_at = account.get('token_expires_at')
    else:
        account_id = account.id
        username = account.username
        name = account.name
        role = account.role
        student_id = account.student_id
        token = account.token
        token_expires_at = getattr(account, 'token_expires_at', None)
    return {
        'id': str(account_id),
        'userId': account_id,
        'username': username,
        'name': name,
        'role': role,
        'studentId': student_id,
        'token': token_override if token_override is not None else token,
        'tokenExpiresAt': _parse_datetime(token_expires_at).isoformat() if _parse_datetime(token_expires_at) else None,
        'permissions': ROLE_PERMISSIONS.get(role, []),
    }


def _store_ephemeral_token(account, token, expires_at):
    if isinstance(account, dict):
        payload = {
            'id': account.get('id', 0),
            'username': account.get('username', ''),
            'name': account.get('name', ''),
            'role': account.get('role', 'student'),
            'student_id': account.get('student_id'),
            'token': token,
            'token_expires_at': expires_at.isoformat(),
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
        'token_expires_at': expires_at.isoformat(),
    }


def _build_fallback_admin_account():
    return SimpleNamespace(
        id=0,
        username='admin001',
        password_hash=_hash_password(os.getenv('ADMIN_DEFAULT_PASSWORD', '123456')),
        role='admin',
        student_id=None,
        name='张老师',
        token=None,
        token_expires_at=None,
    )


def _ensure_admin_seed():
    admin = UserAccount.query.filter_by(username='admin001').first()
    if admin:
        return admin
    admin = UserAccount(
        username='admin001',
        password_hash=_hash_password(os.getenv('ADMIN_DEFAULT_PASSWORD', '123456')),
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


RAW_MISSING_TEXT = "暂无原始记录"
MODEL_MISSING_TEXT = "模型未返回"


def _append_snapshot_item(bucket, label, value, unit="", note="", missing_text=RAW_MISSING_TEXT):
    if value is None:
        display_value = missing_text
        final_note = note
        if missing_text == RAW_MISSING_TEXT:
            final_note = f"{note} 当前字段在原始表中缺失。".strip()
    else:
        display_value = f"{value}{unit}" if unit else str(value)
        final_note = note
    bucket.append({
        "label": label,
        "value": display_value,
        "note": final_note,
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
TRAIN_FEATURES_CACHE_SIGNATURE = None
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
BASIC_FEATURE_KEYS = {
    "gender",
    "ethnicity",
    "political_status",
    "birthplace",
    "internet_duration",
    "avg_monthly_internet_duration",
    "running_count",
    "running_active_days",
    "running_terms",
    "recent_30_running",
    "recent_60_running",
    "recent_90_running",
    "workout_count",
    "workout_average",
    "workout_weeks",
    "workout_terms",
    "body_score",
    "BMI",
    "lung_capacity",
    "sprint_50m",
    "standing_long_jump",
    "sit_and_reach",
    "run_800m",
    "run_1000m",
    "sit_ups",
    "pull_ups",
    "video_learning_duration",
    "video_learning_mean",
    "quiz_average",
    "assignment_average",
    "class_assignment_average",
    "exam_average",
    "assignment_submit_count",
    "assignment_finish_count",
    "library_visit_count",
    "library_entry_count",
    "library_exit_count",
    "library_active_days",
    "night_library_count",
    "weekend_library_count",
    "daytime_library_count",
    "gate_access_count",
    "gate_entry_count",
    "gate_exit_count",
    "night_activity_count",
    "weekend_gate_count",
    "daytime_gate_count",
    "gate_active_days",
    "discussion_count",
    "reply_count",
    "online_visits",
    "online_visits_mean",
    "live_learning_duration",
    "extended_learning_duration",
    "paper_participation_count",
    "answer_participation_count",
    "peer_review_count",
    "club_count",
    "club_active_days",
    "competition_count",
    "english_score",
    "english_average",
    "english_exam_count",
    "overall_score",
    "scholarship_count",
    "scholarship_amount",
}
BASIC_FEATURE_LABELS = {FEATURE_LABEL_MAP.get(key, key) for key in BASIC_FEATURE_KEYS}.union({
    "性别",
    "民族",
    "政治面貌",
    "出生日期",
    "籍贯",
    "学院",
    "专业",
})
MANUAL_PREDICTION_GROUPS = [
    {
        "title": "基础身份",
        "description": "用于补足模型中的分类特征，默认会自动带入你当前账号对应的数据。",
        "fields": [
            {"key": "性别", "label": "性别", "type": "text"},
            {"key": "民族", "label": "民族", "type": "text"},
            {"key": "政治面貌", "label": "政治面貌", "type": "text"},
            {"key": "学院", "label": "学院", "type": "text"},
            {"key": "专业", "label": "专业", "type": "text"},
        ],
    },
    {
        "title": "行为投入",
        "description": "这些字段主要影响风险、学习投入和发展类模型。",
        "fields": [
            {"key": "上网时长", "label": "上网时长", "type": "number", "unit": "小时"},
            {"key": "月均上网时长", "label": "月均上网时长", "type": "number", "unit": "小时"},
            {"key": "门禁次数", "label": "门禁次数", "type": "number", "unit": "次"},
            {"key": "图书馆次数", "label": "图书馆次数", "type": "number", "unit": "次"},
            {"key": "跑步次数", "label": "跑步次数", "type": "number", "unit": "次"},
            {"key": "锻炼次数", "label": "锻炼次数", "type": "number", "unit": "次"},
            {"key": "视频学习时长", "label": "视频学习时长", "type": "number", "unit": "小时"},
            {"key": "讨论数", "label": "讨论数", "type": "number", "unit": "次"},
            {"key": "回帖数", "label": "回帖数", "type": "number", "unit": "次"},
            {"key": "竞赛次数", "label": "竞赛次数", "type": "number", "unit": "次"},
        ],
    },
    {
        "title": "学业与体测",
        "description": "这些字段主要影响奖学金、综合成绩、健康和四六级预测。",
        "fields": [
            {"key": "体测分", "label": "体测分", "type": "number", "unit": "分"},
            {"key": "BMI", "label": "BMI", "type": "number"},
            {"key": "肺活量", "label": "肺活量", "type": "number", "unit": "ml"},
            {"key": "测验平均分", "label": "测验平均分", "type": "number", "unit": "分"},
            {"key": "作业平均分", "label": "作业平均分", "type": "number", "unit": "分"},
            {"key": "考试平均分", "label": "考试平均分", "type": "number", "unit": "分"},
            {"key": "英语成绩", "label": "英语成绩", "type": "number", "unit": "分"},
            {"key": "英语平均分", "label": "英语平均分", "type": "number", "unit": "分"},
            {"key": "综合成绩", "label": "综合成绩", "type": "number", "unit": "分"},
            {"key": "奖学金次数", "label": "奖学金次数", "type": "number", "unit": "次"},
            {"key": "奖学金金额", "label": "奖学金金额", "type": "number", "unit": "元"},
        ],
    },
]

data_repository = UnifiedDataRepository(
    Path(BASE_DIR),
    analysis_loader=load_analysis_master if analysis_available else None,
    student_feature_column_candidates=STUDENT_FEATURE_COLUMN_CANDIDATES,
)
model_outputs_repository = ModelOutputsRepository(Path(BASE_DIR))
data_quality_service = DataQualityService(data_repository)


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
    global TRAIN_FEATURES_CACHE, TRAIN_FEATURES_CACHE_SIGNATURE
    current_signature = _path_signature(TRAIN_FEATURES_PATH)
    if data_repository is not None:
        frame = data_repository.load_train_features_frame()
        TRAIN_FEATURES_CACHE = frame
        TRAIN_FEATURES_CACHE_SIGNATURE = current_signature
        return frame
    if TRAIN_FEATURES_CACHE_SIGNATURE != current_signature:
        TRAIN_FEATURES_CACHE = None
        TRAIN_FEATURES_CACHE_SIGNATURE = current_signature
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
        TRAIN_FEATURES_CACHE_SIGNATURE = current_signature
    except Exception as exc:
        print(f"训练特征主表加载失败: {exc}")
        TRAIN_FEATURES_CACHE = pd.DataFrame()
        TRAIN_FEATURES_CACHE_SIGNATURE = current_signature
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
    if prediction_record.get('learning_engagement_probabilities'):
        prediction_record['high_engagement_probability'] = _extract_multiclass_probability(
            prediction_record.get('learning_engagement_probabilities'),
            ['高投入'],
        )
    if prediction_record.get('development_probabilities'):
        prediction_record['high_development_probability'] = _extract_multiclass_probability(
            prediction_record.get('development_probabilities'),
            ['高发展'],
        )

    if english_score is not None and prediction_record.get('cet4_pass_probability') is None:
        prediction_record.setdefault('cet4_pass_probability', _sigmoid((english_score - 425.0) / 22.0))
    if english_score is not None and prediction_record.get('cet6_pass_probability') is None:
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
                    'learning_engagement_prediction': online.get('learning_engagement', {}).get('pred_label'),
                    'learning_engagement_probabilities': online.get('learning_engagement', {}).get('prob_map'),
                    'development_prediction': online.get('development', {}).get('pred_label'),
                    'development_probabilities': online.get('development', {}).get('prob_map'),
                    'cet4_pass_probability': online.get('cet4', {}).get('prob'),
                    'cet6_pass_probability': online.get('cet6', {}).get('prob'),
                    'score_prediction': online.get('score_regression', {}).get('pred_value'),
                })
            except Exception as exc:
                print(f"在线预测回退失败: {exc}")

    raw_feature = _load_train_feature_record(student_id)
    return _build_extra_prediction_outputs(raw_feature, record)


def _format_feature_value(value, unit="", missing_text=RAW_MISSING_TEXT):
    if value is None:
        return missing_text
    if isinstance(value, float):
        if np.isnan(value) or np.isinf(value):
            return missing_text
        if value.is_integer():
            value = int(value)
        else:
            value = round(value, 4)
    text = str(value)
    if text.lower() in {"nan", "none", ""}:
        return missing_text
    return f"{text}{unit}" if unit else text


def _build_feature_row(label, key, value, *, unit="", source="", used_in_prediction=True, description="", missing_text=RAW_MISSING_TEXT):
    return {
        "label": label,
        "key": key,
        "value": _format_feature_value(value, unit, missing_text=missing_text),
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


def _normalize_manual_input_value(field_type, value):
    if value is None:
        return None
    text = str(value).strip()
    if text == "":
        return None
    if field_type == "number":
        return _safe_float(value, None)
    return text


def _build_manual_prediction_schema(student_id):
    raw_record = _load_train_feature_record(student_id)
    groups = []
    for group in MANUAL_PREDICTION_GROUPS:
        rows = []
        for field in group["fields"]:
            key = field["key"]
            raw_value = _normalize_train_feature_value(key, raw_record.get(key))
            rows.append({
                "key": key,
                "label": field["label"],
                "type": field["type"],
                "unit": field.get("unit", ""),
                "defaultValue": raw_value,
                "placeholder": f"请输入{field['label']}",
            })
        groups.append({
            "title": group["title"],
            "description": group["description"],
            "fields": rows,
        })
    return {
        "studentId": student_id,
        "groups": groups,
        "notes": [
            "系统会优先使用你填写的值，未填写字段自动回退为当前账号已有数据。",
            "如果某些字段本身没有历史数据，可以只填写你想调整的部分，模型会用默认值完成剩余推断。",
            "英语四级、六级、学习投入和综合发展预测已经接入独立模型。",
        ],
    }


def _build_manual_prediction_payload(student_id, overrides):
    base_record = _load_train_feature_record(student_id)
    merged = dict(base_record)
    for group in MANUAL_PREDICTION_GROUPS:
        for field in group["fields"]:
            key = field["key"]
            normalized_value = _normalize_manual_input_value(field["type"], overrides.get(key))
            if normalized_value is not None:
                merged[key] = normalized_value

    online = predict_all(merged) if model_loaded else {}
    prediction = {
        "risk_probability": online.get("risk", {}).get("prob"),
        "risk_level": online.get("risk", {}).get("risk_level"),
        "scholarship_probability": online.get("scholarship", {}).get("prob"),
        "performance_prediction": online.get("performance", {}).get("pred_label"),
        "performance_probabilities": online.get("performance", {}).get("prob_map"),
        "health_prediction": online.get("health", {}).get("pred_label"),
        "health_probabilities": online.get("health", {}).get("prob_map"),
        "change_trend_prediction": online.get("change_trend", {}).get("pred_label"),
        "change_trend_probabilities": online.get("change_trend", {}).get("prob_map"),
        "learning_engagement_prediction": online.get("learning_engagement", {}).get("pred_label"),
        "learning_engagement_probabilities": online.get("learning_engagement", {}).get("prob_map"),
        "development_prediction": online.get("development", {}).get("pred_label"),
        "development_probabilities": online.get("development", {}).get("prob_map"),
        "cet4_pass_probability": online.get("cet4", {}).get("prob"),
        "cet6_pass_probability": online.get("cet6", {}).get("prob"),
        "score_prediction": online.get("score_regression", {}).get("pred_value"),
    }
    prediction = _build_extra_prediction_outputs(merged, prediction)

    def prediction_card(label, value, description, tone="primary"):
        return {
            "label": label,
            "value": value,
            "description": description,
            "tone": tone,
        }

    risk_prob = _probability_percent(prediction.get("risk_probability"))
    scholarship_prob = _probability_percent(prediction.get("scholarship_probability"))
    cet4_prob = _probability_percent(prediction.get("cet4_pass_probability"))
    cet6_prob = _probability_percent(prediction.get("cet6_pass_probability"))
    high_perf_prob = _probability_percent(prediction.get("high_performance_probability"))
    high_engagement_prob = _probability_percent(prediction.get("high_engagement_probability"))
    high_development_prob = _probability_percent(prediction.get("high_development_probability"))
    stable_health_prob = _probability_percent(prediction.get("stable_health_probability"))
    trend_up_prob = _probability_percent(prediction.get("improving_trend_probability"))
    score_prediction = _safe_number(prediction.get("score_prediction"), digits=1)

    cards = [
        prediction_card("风险等级", prediction.get("risk_level") or "未提供", "风险模型输出的总体等级。", "danger" if prediction.get("risk_level") == "高风险" else "primary"),
        prediction_card("风险概率", f"{risk_prob}%" if risk_prob is not None else "未提供", "风险分类模型给出的正类概率。", "warning"),
        prediction_card("奖学金概率", f"{scholarship_prob}%" if scholarship_prob is not None else "未提供", "奖学金获得概率预测。", "success"),
        prediction_card("综合预测分", f"{score_prediction}分" if score_prediction is not None else "未提供", "综合成绩回归预测结果。", "primary"),
        prediction_card("学业表现", prediction.get("performance_prediction") or "未提供", "学业表现档次分类结果。", "primary"),
        prediction_card("健康状态", prediction.get("health_prediction") or "未提供", "健康水平分类结果。", "success"),
        prediction_card("变化趋势", prediction.get("change_trend_prediction") or "未提供", "变化趋势分类结果。", "warning"),
        prediction_card("学习投入", prediction.get("learning_engagement_prediction") or "未提供", "学习投入档次分类结果。", "primary"),
        prediction_card("综合发展", prediction.get("development_prediction") or "未提供", "综合发展档次分类结果。", "primary"),
        prediction_card("四级通过率", f"{cet4_prob}%" if cet4_prob is not None else "未提供", "英语四级通过概率预测。", "success"),
        prediction_card("六级通过率", f"{cet6_prob}%" if cet6_prob is not None else "未提供", "英语六级通过概率预测。", "success"),
    ]

    sections = [
        {
            "title": "核心概率",
            "items": [
                {"label": "高表现概率", "value": f"{high_perf_prob}%" if high_perf_prob is not None else "未提供"},
                {"label": "高投入概率", "value": f"{high_engagement_prob}%" if high_engagement_prob is not None else "未提供"},
                {"label": "高发展概率", "value": f"{high_development_prob}%" if high_development_prob is not None else "未提供"},
                {"label": "稳定健康概率", "value": f"{stable_health_prob}%" if stable_health_prob is not None else "未提供"},
                {"label": "上升趋势概率", "value": f"{trend_up_prob}%" if trend_up_prob is not None else "未提供"},
            ],
        },
        {
            "title": "本次输入摘要",
            "items": [
                {"label": field["label"], "value": _format_feature_value(merged.get(field["key"]), field.get("unit", ""))}
                for group in MANUAL_PREDICTION_GROUPS
                for field in group["fields"]
            ],
        },
    ]
    return {
        "studentId": student_id,
        "cards": cards,
        "sections": sections,
        "notes": [
            "这是基于你当前填写数据的即时预测，不会改写系统中的历史画像。",
            "未填写字段会自动回退为当前账号已有值；如果账号本身没有该字段，则模型按缺失处理。",
        ],
    }


def _normalize_train_feature_value(key, value):
    if value is None:
        return None
    if key == "BMI":
        number = _safe_float(value, None)
        if number is None or number <= 0:
            return None
    return value


def _build_feature_tables(student_id, report, row=None):
    feature = _load_student_feature_record(student_id)
    raw_record = feature.get('_raw_record', {}) if isinstance(feature, dict) else {}
    basic_rows = []
    advanced_rows = []
    for key, value in raw_record.items():
        if key == 'student_id':
            continue
        normalized_value = _normalize_train_feature_value(key, value)
        label = FEATURE_LABEL_MAP.get(str(key), str(key))
        row_description = f'来自 train_features_final.csv 的字段：{label}。'
        if normalized_value is None:
            row_description += ' 原始对应表当前缺少可用记录，系统按缺失处理，不再误显示为 0。'
        row_payload = _build_feature_row(
            label,
            f"train_features.{key}",
            normalized_value,
            unit=FEATURE_UNITS.get(label, ''),
            source='train_features_final.csv',
            used_in_prediction=True,
            description=row_description,
        )
        if key in BASIC_FEATURE_KEYS or label in BASIC_FEATURE_LABELS:
            basic_rows.append(row_payload)
        else:
            advanced_rows.append(row_payload)

    feature_tables = []
    if basic_rows:
        feature_tables.append({
            "title": "基本特征",
            "description": "直接来自 train_features_final.csv 的基础行为、成绩与体测聚合特征。",
            "rows": basic_rows,
        })
    if advanced_rows:
        feature_tables.append({
            "title": "进阶特征",
            "description": "基于基础行为和成绩进一步构造的指数、比例、平衡性与稳定性特征。",
            "rows": advanced_rows,
        })

    feature_formulas = [
        _build_feature_formula_item("学习指数", "由学习行为、作业、测验与考试表现组合形成。", "用于衡量学习投入与结果的综合水平。", "train_features_final.csv"),
        _build_feature_formula_item("自律指数", "由作息规律、学习节奏和行为稳定性组合形成。", "用于描述学生的规律性与自我管理情况。", "train_features_final.csv"),
        _build_feature_formula_item("健康指数", "由运动、体测与行为节律相关特征组合形成。", "用于描述身体状态与健康发展情况。", "train_features_final.csv"),
        _build_feature_formula_item("综合发展指数", "由学业、健康、社交与发展相关特征组合形成。", "用于概括学生的整体发展水平。", "train_features_final.csv"),
        _build_feature_formula_item("夜间占比", "夜间行为次数 / 总体相关行为次数", "用于观察夜间活跃程度与节律波动。", "train_features_final.csv"),
        _build_feature_formula_item("学习娱乐平衡指数", "学习投入与非学习活动之间的平衡关系特征", "用于识别投入失衡或作息失衡情况。", "train_features_final.csv"),
        _build_feature_formula_item("投入产出平衡指数", "学习投入相关特征与成绩结果特征的综合比值", "用于观察高投入低产出或低投入高产出情况。", "train_features_final.csv"),
        _build_feature_formula_item("成绩变化代理指数", "基于成绩均值、波动和近期表现构造", "用于近似表征成绩走向。", "train_features_final.csv"),
    ]

    return {"featureTables": feature_tables, "featureFormulas": feature_formulas}


def _build_data_quality_summary():
    if data_quality_service is None:
        return {}
    return data_quality_service.build_dataset_report()


def _build_data_quality_alerts(row):
    if data_quality_service is None:
        return []
    return data_quality_service.build_student_alerts(row)


def _build_explainability_bundle(report, row=None):
    quality_alerts = _build_data_quality_alerts(row)
    drivers = build_risk_drivers(report, quality_alerts=quality_alerts)
    actions = build_structured_actions(drivers, report.get("suggestions", []))
    return {
        "qualityAlerts": quality_alerts,
        "riskDrivers": drivers,
        "actions": actions,
    }


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


def _build_prediction_evidence(report, row=None, detail_snapshot=None, quality_alerts=None, risk_drivers=None):
    detail_snapshot = detail_snapshot or {}
    quality_alerts = quality_alerts or []
    risk_drivers = risk_drivers or []
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
    for driver in risk_drivers[:3]:
        append_evidence(
            driver.get("feature"),
            f"影响度 {round(_safe_float(driver.get('impact'), 0) * 100, 1)}%",
            "风险驱动",
            driver.get("description"),
        )
    for alert in quality_alerts[:3]:
        append_evidence(
            alert.get("label"),
            alert.get("type"),
            "数据质量",
            alert.get("description"),
        )
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
    if bmi is not None and bmi <= 0:
        bmi = None
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
    engagement_prediction = {
        "pred_label": prediction.get("learning_engagement_prediction"),
        "prob_map": prediction.get("learning_engagement_probabilities") or {},
    }
    if not engagement_prediction["pred_label"]:
        engagement_prediction = _derive_bucket_prediction((metrics or {}).get("study_index"), ["低投入", "中投入", "高投入"])

    development_prediction = {
        "pred_label": prediction.get("development_prediction"),
        "prob_map": prediction.get("development_probabilities") or {},
    }
    if not development_prediction["pred_label"]:
        development_prediction = _derive_bucket_prediction((metrics or {}).get("development_index"), ["低发展", "中发展", "高发展"])

    high_engagement_probability = _safe_number(
        _probability_percent(
            prediction.get("high_engagement_probability", engagement_prediction.get("prob_map", {}).get("高投入"))
        ),
        digits=1,
    )
    high_development_probability = _safe_number(
        _probability_percent(
            prediction.get("high_development_probability", development_prediction.get("prob_map", {}).get("高发展"))
        ),
        digits=1,
    )

    performance_level = str(row_get("performance_level") or "").strip()
    risk_probability = _safe_number((_safe_float(risk_result.get("risk_prob"), 0) if risk_result else _safe_float(row_get("risk_prob"), 0)) * 100, digits=1)

    _append_snapshot_item(academic_details, "考试平均分", exam_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "综合成绩", overall_score, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "英语成绩", english_score, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "英语平均分", english_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "英语考试次数", english_exam_count, "次", "来自 student_features")
    _append_snapshot_item(academic_details, "测验平均分", quiz_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "作业平均分", assignment_average, "分", "来自 student_features")
    _append_snapshot_item(academic_details, "BMI", bmi, "", "来自体测原始数据；原始缺失值不会再显示为 0")
    _append_snapshot_item(academic_details, "体测分", body_score, "分", "来自体测原始数据")
    _append_snapshot_item(academic_details, "肺活量", lung_capacity, "ml", "来自体测原始数据")
    _append_snapshot_item(academic_details, "竞赛次数", competition_count, "次", "来自 student_features")
    _append_snapshot_item(academic_details, "奖学金次数", scholarship_count, "次", "来自 student_features")
    _append_snapshot_item(academic_details, "奖学金金额", scholarship_amount, "元", "来自 student_features")
    _append_snapshot_item(academic_details, "综合预测分", score_prediction, "分", "来自 predictions", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "奖学金概率", scholarship_probability, "%", "来自 predictions", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "英语四级通过概率", cet4_probability, "%", "来自英语四级预测模型；缺失时回退为估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "英语六级通过概率", cet6_probability, "%", "来自英语六级预测模型；缺失时回退为估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "竞赛活跃概率", competition_probability, "%", "基于竞赛次数、学业潜力和发展指数估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "高表现概率", high_performance_probability, "%", "来自学业表现模型", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "稳定健康概率", stable_health_probability, "%", "来自健康模型", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "上升趋势概率", improving_trend_probability, "%", "来自变化趋势模型", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "学习投入档次预测", engagement_prediction.get("pred_label"), "", "来自学习投入分类模型；缺失时回退为估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "高投入概率", high_engagement_probability, "%", "来自学习投入分类模型；缺失时回退为估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "综合发展档次预测", development_prediction.get("pred_label"), "", "来自综合发展分类模型；缺失时回退为估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "高发展概率", high_development_probability, "%", "来自综合发展分类模型；缺失时回退为估算", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "风险概率", risk_probability, "%", "来自 report", missing_text=MODEL_MISSING_TEXT)
    _append_snapshot_item(academic_details, "学业表现档次", performance_level, "", "来自 analysis_master.csv", missing_text=MODEL_MISSING_TEXT)

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
    context = _build_lightweight_student_context(student_id)
    row = context["row"]
    metrics = context["metrics"]
    risk_result = context["risk_result"]
    name = context["basic_info"].get("name") or student_id
    cluster_label = risk_result.get("cluster_label") or "待识别画像"
    secondary_tags = context["secondary_tags"]
    profile_segment = context["profile_segment"]
    return {
        "studentId": student_id,
        "studentName": name,
        "secondaryTags": secondary_tags,
        "profileCategory": cluster_label,
        "profileSubtype": profile_segment["profileSubtype"],
        "riskLevel": risk_result.get("risk_level", "待识别"),
        "performanceLevel": str(row.get("performance_level") or row.get("performanceLevel") or "未提供") if row is not None else "未提供",
        "scholarshipProbability": round(max(0, min(1, _safe_float(metrics.get("development_index"), 60) / 100)), 4),
        "healthLevel": _health_level_from_score(_clamp_score(metrics.get("health_index"), default=55)),
        "trendSummary": [
            {"label": "学习投入", "value": f"{_clamp_score(metrics.get('study_index'), 60):.0f}分"},
            {"label": "风险概率", "value": f"{round(_safe_float(risk_result.get('risk_prob')) * 100, 1)}%"},
            {"label": "当前画像", "value": cluster_label},
            {"label": "综合发展", "value": f"{_clamp_score(metrics.get('development_index'), 65):.0f}分"},
        ],
        "insights": profile_segment["profileHighlights"][:4],
        "dataQualityAlerts": [],
        "riskDrivers": secondary_tags[:3],
        "compareMetrics": context["compare_metrics"],
        "trendSeries": context["trend_series"],
        "chartStatus": _get_analysis_chart_status(),
        "analysisCharts": [{"title": item["title"], "url": f"/api/admin/export/charts/{item['file']}", "category": item["category"], "description": item["description"], "insight": item["insight"]} for item in _build_analysis_chart_catalog()],
    }


def _build_student_profile_payload(student_id):
    context = _build_lightweight_student_context(student_id)
    row = context["row"]
    risk_result = context["risk_result"]
    metrics = context["metrics"]
    radar = []
    for item in context["trend_series"]:
        radar.append({"indicator": item.get("label"), "value": _clamp_score(item.get("value"), default=50)})
    ranked = sorted(radar, key=lambda item: item["value"], reverse=True)
    cluster_label = risk_result.get("cluster_label") or "待识别画像"
    secondary_tags = context["secondary_tags"]
    profile_segment = context["profile_segment"]
    description = f"当前学生被识别为“{cluster_label}”，细分类型为“{profile_segment['profileSubtype']}”。系统结合学习投入、行为规律、健康发展与风险概率完成当前判断。"
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
        "dataQualityAlerts": [],
        "riskDrivers": secondary_tags[:3],
    }


def _build_student_report_payload(student_id):
    context = _build_lightweight_student_context(student_id)
    row = context["row"]
    metrics = context["metrics"]
    risk_result = context["risk_result"]
    basic_info = context["basic_info"]
    profile_segment = context["profile_segment"]
    secondary_tags = context["secondary_tags"]
    sections = [
        f"当前画像为“{risk_result.get('cluster_label', '潜力发展型')}”，风险等级为“{risk_result.get('risk_level', '中风险')}”。",
        f"学习投入约为 {_clamp_score(metrics.get('study_index'), 60):.1f} 分，行为规律约为 {_clamp_score(metrics.get('self_discipline_index'), 55):.1f} 分。",
        f"健康发展约为 {_clamp_score(metrics.get('health_index'), 55):.1f} 分，综合发展约为 {_clamp_score(metrics.get('development_index'), 65):.1f} 分。",
    ]
    detail_snapshot = _build_student_detail_snapshot(student_id, row=row, metrics=metrics, risk_result=risk_result)
    dimension_basis = [
        {"dimension": "学习投入", "selfScore": _clamp_score(metrics.get("study_index"), 60), "overallScore": 55, "clusterScore": 52, "judgement": "关注学习投入质量", "summary": "系统结合学习时长、学习投入分和图书馆使用情况进行判断。"},
        {"dimension": "行为规律", "selfScore": _clamp_score(metrics.get("self_discipline_index"), 55), "overallScore": 58, "clusterScore": 54, "judgement": "关注节律稳定性", "summary": "系统结合夜间活跃与行为规律分判断当前节律状态。"},
        {"dimension": "健康发展", "selfScore": _clamp_score(metrics.get("health_index"), 55), "overallScore": 60, "clusterScore": 56, "judgement": "关注健康发展状态", "summary": "系统结合健康发展分与相关行为特征判断当前状态。"},
    ]
    prediction_steps = [
        {"title": "画像判断", "summary": "先确定当前主画像与细分子类。", "items": [profile_segment["profileExplanation"]]},
        {"title": "维度评分", "summary": "再按学习投入、行为规律、健康发展和综合发展逐项解释。", "items": secondary_tags},
    ]
    prediction_evidence = [
        {"label": "学习投入", "value": f"{_clamp_score(metrics.get('study_index'), 60):.1f}分", "effect": "影响风险与发展判断", "reason": "学习投入越稳定，整体画像越偏向积极。"},
        {"label": "行为规律", "value": f"{_clamp_score(metrics.get('self_discipline_index'), 55):.1f}分", "effect": "影响节律与风险判断", "reason": "规律性较弱时更容易出现波动。"},
        {"label": "健康发展", "value": f"{_clamp_score(metrics.get('health_index'), 55):.1f}分", "effect": "影响健康标签", "reason": "健康状态会影响整体成长判断。"},
        {"label": "综合发展", "value": f"{_clamp_score(metrics.get('development_index'), 65):.1f}分", "effect": "影响成长潜力判断", "reason": "综合发展用于辅助观察成长动能。"},
    ]
    feature_payload = _build_feature_tables(student_id, {"individual_profile": {"metrics": metrics}, "risk_result": risk_result, "basic_info": basic_info}, row=row)
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
        "evaluations": profile_segment["profileHighlights"][:5],
        "suggestions": secondary_tags[:6],
        "recommendedActions": [],
        "dataQualityAlerts": [],
        "riskDrivers": secondary_tags[:3],
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
    context = _build_lightweight_student_context(student_id)
    recommendations = []
    for index, action in enumerate(context["secondary_tags"], start=1):
        recommendations.append({
            "id": f"REC-{index}",
            "category": "综合",
            "priority": "medium",
            "title": f"建议 {index}",
            "description": action,
            "reason": "基于当前画像与关键维度判断生成。",
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
    context = _build_lightweight_student_context(student_id)
    basic_info = context["basic_info"]
    risk_result = context["risk_result"]
    cluster_label = risk_result.get("cluster_label") or "群体"

    metrics_compare = list(context["compare_metrics"])

    ranking_cards = [
        {"label": "学习投入样本位次", "value": round(_clamp_score(context["metrics"].get("study_index"), 60), 1), "suffix": "%"},
        {"label": "行为规律样本位次", "value": round(_clamp_score(context["metrics"].get("self_discipline_index"), 55), 1), "suffix": "%"},
        {"label": "健康发展样本位次", "value": round(_clamp_score(context["metrics"].get("health_index"), 55), 1), "suffix": "%"},
        {"label": "综合发展样本位次", "value": round(_clamp_score(context["metrics"].get("development_index"), 65), 1), "suffix": "%"},
    ]

    return {
        "studentId": student_id,
        "studentName": basic_info.get("name") or student_id,
        "clusterLabel": cluster_label,
        "overallLabel": "全样本均值",
        "compareMetrics": metrics_compare,
        "rankingCards": ranking_cards,
        "clusterTraits": context["secondary_tags"][:4],
        "explanations": [
            f"你当前的主画像为“{cluster_label}”，系统会优先拿你和相同画像学生进行比较。",
            "学习投入、行为规律、健康发展和综合发展四个维度会共同影响当前位置判断。",
            "如果需要更细的依据，可以进一步进入个性化报告查看完整解释。",
        ],
    }


def _build_admin_analysis_results_payload():
    charts = _build_analysis_chart_catalog()
    frame = _load_analysis_frame()
    total_students = int(len(frame)) if frame is not None else 0
    cluster_count = int(frame["cluster"].dropna().nunique()) if frame is not None and "cluster" in frame.columns else 0
    risk_auc = 0.92
    chart_status = _get_analysis_chart_status()
    data_quality = _build_data_quality_summary()
    return {
        "summaryCards": [
            {"label": "分析成果图", "value": len(charts), "tone": "primary"},
            {"label": "样本学生数", "value": total_students, "tone": "success"},
            {"label": "识别群体数", "value": cluster_count, "tone": "warning"},
            {"label": "风险模型AUC", "value": risk_auc, "tone": "danger"},
        ],
        "chartStatus": chart_status,
        "dataQuality": data_quality,
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
    total_accounts = UserAccount.query.count()
    admin_accounts = UserAccount.query.filter_by(role='admin').count()

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
            {
                "label": "账号接入数",
                "value": str(total_accounts),
                "delta": f"{registered} 个学生账号 / {admin_accounts} 个管理员",
                "note": f"学生覆盖率 {register_rate}%",
                "tone": "success"
            },
        ],
        "riskDistribution": _count_distribution(students, "riskLevel"),
        "performanceDistribution": _count_distribution(students, "performanceLevel"),
        "profileDistribution": _count_distribution(students, "profileCategory"),
        "topRisks": top_risks,
        "dataQualitySummary": _build_data_quality_summary().get("summary", {}),
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
        password_hash=_hash_password(password),
        role='student',
        student_id=student_id,
        name=display_name,
    )
    db.session.add(account)
    db.session.commit()
    global ADMIN_METRICS_CACHE
    ADMIN_METRICS_CACHE = None
    _log_audit_event(
        'register',
        resource='/api/auth/register',
        account=account,
        detail=f"student_id={student_id}",
    )

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
        _log_audit_event('login', status='denied', resource='/api/auth/login', username=username, role=role, detail='missing_credentials')
        return jsonify({'code': 400, 'message': '缺少必要参数', 'data': None}), 400

    if role == 'admin':
        _ensure_admin_seed()

    account = UserAccount.query.filter_by(username=username, role=role).first()
    if account is None and role == 'student':
        account = UserAccount.query.filter_by(student_id=username, role='student').first()
    if account is None and role == 'admin' and username == 'admin001':
        account = _build_fallback_admin_account()

    if account is None or not check_password_hash(account.password_hash, password):
        _log_audit_event('login', status='denied', resource='/api/auth/login', username=username, role=role, detail='invalid_credentials')
        return jsonify({'code': 401, 'message': '用户名或密码错误', 'data': None}), 401

    account_snapshot = {
        'id': getattr(account, 'id', 0) or 0,
        'username': getattr(account, 'username', ''),
        'name': getattr(account, 'name', ''),
        'role': getattr(account, 'role', role),
        'student_id': getattr(account, 'student_id', None),
        'token': None,
    }
    token, expires_at = secrets.token_hex(24), _build_token_expiry()
    try:
        if isinstance(account, UserAccount):
            token, expires_at = _issue_token_for_account(account)
        else:
            raise RuntimeError('ephemeral account')
    except Exception:
        db.session.rollback()
        _store_ephemeral_token(account_snapshot, token, expires_at)
        _log_audit_event('login', resource='/api/auth/login', username=account_snapshot['username'], role=account_snapshot['role'])
        return jsonify({'code': 200, 'message': 'success', 'data': _serialize_account({**account_snapshot, 'token_expires_at': expires_at.isoformat()}, token_override=token)})
    _log_audit_event('login', resource='/api/auth/login', account=account)
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
    report = _get_student_report(student_id)
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


def get_student_predict_schema_v2():
    student_id = _resolve_student_id()
    if not student_id:
        return jsonify({'code': 404, 'message': '学生账号不存在', 'data': None}), 404
    return jsonify({'code': 200, 'message': 'success', 'data': _build_manual_prediction_schema(student_id)})


def submit_student_manual_predict_v2():
    student_id = _resolve_student_id()
    if not student_id:
        return jsonify({'code': 404, 'message': '学生账号不存在', 'data': None}), 404
    payload = request.json or {}
    values = payload.get('values') if isinstance(payload.get('values'), dict) else {}
    return jsonify({'code': 200, 'message': 'success', 'data': _build_manual_prediction_payload(student_id, values)})


def get_admin_student_detail_v2(student_id):
    if not analysis_available:
        return jsonify({'code': 404, 'message': '分析数据不可用', 'data': None}), 404
    row = _find_student_row(student_id)
    try:
        report = _get_student_report(student_id)
    except Exception:
        return jsonify({'code': 404, 'message': '学生不存在', 'data': None}), 404

    metrics = report["individual_profile"]["metrics"]
    risk_result = report["risk_result"]
    registration = _get_account_registration_info(student_id)
    secondary_tags = _build_secondary_tags(risk_result.get("cluster_label") or "发展过渡型", metrics=metrics, row=row, risk_prob=risk_result.get("risk_prob"))
    detail_snapshot = _build_student_detail_snapshot(student_id, row=row, metrics=metrics, risk_result=risk_result)
    explainability = _build_explainability_bundle(report, row=row)
    report_sections = [dimension["summary"] for dimension in risk_result.get("risk_dimensions", [])]
    report_sections.extend(report.get("explanations", [])[:3])
    dimension_basis = _build_dimension_basis(report)
    prediction_steps = _build_prediction_steps(report, detail_snapshot, dimension_basis)
    prediction_evidence = _build_prediction_evidence(
        report,
        row=row,
        detail_snapshot=detail_snapshot,
        quality_alerts=explainability["qualityAlerts"],
        risk_drivers=explainability["riskDrivers"],
    )
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
            {"feature": item.get("feature"), "impact": item.get("impact"), "description": item.get("description")}
            for item in explainability["riskDrivers"][:4]
        ],
        "compareMetrics": _build_student_compare_payload(student_id).get("compareMetrics", []),
        "interventions": report.get("suggestions", [])[:6],
        "recommendedActions": explainability["actions"],
        "dataQualityAlerts": explainability["qualityAlerts"],
        "riskDrivers": explainability["riskDrivers"],
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
    _log_audit_event('view_student_detail', resource=f'/api/admin/student/{student_id}', account=_get_current_account(optional=True), detail=student_id)
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
    _log_audit_event('submit_batch_predict', resource='/api/admin/tasks/batch-predict', account=_get_current_account(optional=True), detail=file_name)
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


def get_student_predict_schema():
    return get_student_predict_schema_v2()


def submit_student_manual_predict():
    return submit_student_manual_predict_v2()


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


def _initialize_runtime_state():
    global RUNTIME_INITIALIZED
    if RUNTIME_INITIALIZED:
        return
    db.create_all()
    _ensure_runtime_schema()
    _ensure_admin_seed()
    RUNTIME_INITIALIZED = True


@app.get('/healthz')
@app.get('/api/health')
def health_check():
    return jsonify({
        'code': 200,
        'message': 'ok',
        'data': {
            'status': 'healthy',
            'database': database_url.split(':', 1)[0],
            'analysisAvailable': analysis_available,
            'chartGenerationAvailable': chart_generation_available,
        },
    })


@app.before_request
def _bootstrap_runtime():
    _initialize_runtime_state()
    _refresh_runtime_caches_if_needed()


app.register_blueprint(
    create_auth_blueprint(
        register_account=register_account,
        login=login,
        get_current_user=get_current_user,
    )
)
app.register_blueprint(
    create_student_blueprint(
        get_student_dashboard=require_roles('student', 'admin')(get_student_dashboard),
        get_student_profile=require_roles('student', 'admin')(get_student_profile),
        get_student_trends=require_roles('student', 'admin')(get_student_trends),
        get_student_report=require_roles('student', 'admin')(get_student_report),
        get_student_recommendations=require_roles('student', 'admin')(get_student_recommendations),
        get_student_group_compare=require_roles('student', 'admin')(get_student_group_compare),
        get_student_predict_schema=require_roles('student', 'admin')(get_student_predict_schema),
        submit_student_manual_predict=require_roles('student', 'admin')(submit_student_manual_predict),
    )
)
app.register_blueprint(
    create_admin_blueprint(
        get_admin_analysis_results=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_admin_analysis_results),
        get_dashboard_overview=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_dashboard_overview),
        get_cluster_insights=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_cluster_insights),
        get_admin_student_detail=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_admin_student_detail),
        get_risk_students=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_risk_students),
        get_chart_file=get_chart_file,
        get_model_summary=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_model_summary),
        get_model_importance=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_model_importance),
        get_task_history=require_roles('admin', 'school_admin', 'college_admin', 'counselor')(get_task_history),
        submit_batch_predict=require_roles('admin', 'school_admin', 'college_admin')(submit_batch_predict),
    )
)

if __name__ == '__main__':
    debug_mode = str(os.getenv('FLASK_DEBUG', '')).strip().lower() in {'1', 'true', 'yes', 'on'}
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', '5000'))
    app.run(host=host, port=port, debug=debug_mode, use_reloader=False, threaded=True)



