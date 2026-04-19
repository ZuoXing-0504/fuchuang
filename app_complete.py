from flask import Flask, request, jsonify
import json
import joblib
import pandas as pd
import numpy as np
import os
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:Lhwal123@localhost:3306/student_behavior'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 初始化数据库
db = SQLAlchemy(app)

# 数据库模型
class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10))
    college = db.Column(db.String(100))
    major = db.Column(db.String(100))
    民族 = db.Column(db.String(50))
    政治面貌 = db.Column(db.String(50))
    
    features = db.relationship('StudentFeature', back_populates='student', uselist=False)
    predictions = db.relationship('Prediction', back_populates='student', uselist=False)
    cluster = db.relationship('Cluster', back_populates='student', uselist=False)

class StudentFeature(db.Model):
    __tablename__ = 'student_features'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.student_id'), nullable=False)
    上网时长 = db.Column(db.Float)
    月均上网时长 = db.Column(db.Float)
    跑步次数 = db.Column(db.Integer)
    锻炼次数 = db.Column(db.Integer)
    体测分 = db.Column(db.Float)
    BMI = db.Column(db.Float)
    肺活量 = db.Column(db.Float)
    视频学习时长 = db.Column(db.Float)
    测验平均分 = db.Column(db.Float)
    作业平均分 = db.Column(db.Float)
    考试平均分 = db.Column(db.Float)
    作业提交次数 = db.Column(db.Integer)
    作业完成次数 = db.Column(db.Integer)
    自律指数 = db.Column(db.Float)
    学习稳定性指数 = db.Column(db.Float)
    图书馆次数 = db.Column(db.Integer)
    门禁次数 = db.Column(db.Integer)
    讨论数 = db.Column(db.Integer)
    回帖数 = db.Column(db.Integer)
    社团次数 = db.Column(db.Integer)
    竞赛次数 = db.Column(db.Integer)
    英语成绩 = db.Column(db.Float)
    综合成绩 = db.Column(db.Float)
    学习指数 = db.Column(db.Float)
    健康指数 = db.Column(db.Float)
    社交指数 = db.Column(db.Float)
    作业执行力指数 = db.Column(db.Float)
    线上积极性指数 = db.Column(db.Float)
    综合发展指数 = db.Column(db.Float)
    学业潜力指数 = db.Column(db.Float)
    奖学金次数 = db.Column(db.Integer)
    奖学金金额 = db.Column(db.Float)
    夜间次数 = db.Column(db.Integer)
    
    student = db.relationship('Student', back_populates='features')

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.student_id'), nullable=False)
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
    
    student = db.relationship('Student', back_populates='predictions')

class Cluster(db.Model):
    __tablename__ = 'clusters'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.String(50), db.ForeignKey('students.student_id'), nullable=False)
    cluster_id = db.Column(db.Integer)
    cluster_name = db.Column(db.String(50))
    
    student = db.relationship('Student', back_populates='cluster')

# 加载预测模型
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")

# 加载模型和配置
def load_model_package(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        print(f"警告: 找不到模型文件: {path}")
        return None
    try:
        return joblib.load(path)
    except Exception as e:
        print(f"加载模型失败: {e}")
        return None

def load_json(filename):
    path = os.path.join(MODEL_DIR, filename)
    if not os.path.exists(path):
        print(f"警告: 找不到配置文件: {path}")
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"加载配置文件失败: {e}")
        return {}

# 加载模型
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

model_loaded = any([risk_pkg, scholarship_pkg, performance_pkg, health_pkg, change_trend_pkg, score_reg_pkg, cluster_pkg])

# 预测相关函数
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
    if not pkg:
        # 模拟预测结果
        return {
            "pred_label": 0,
            "prob": 0.5,
            "risk_level": "中风险" if positive_label_name == "risk" else None
        }
    
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
    if not pkg:
        # 模拟预测结果
        return {
            "pred_label": "中表现",
            "prob_map": {
                "低表现": 0.2,
                "中表现": 0.6,
                "高表现": 0.2
            }
        }
    
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
    if not pkg:
        # 模拟预测结果
        return {"pred_value": 75.5}
    
    feature_columns = pkg["feature_columns"]
    preprocessor = pkg["preprocessor"]
    model = pkg["model"]
    category_mappings = pkg.get("category_mappings", {})
    
    X = align_features(input_dict, feature_columns, category_mappings)
    Xp = preprocessor.transform(X)
    
    value = float(model.predict(Xp)[0])
    return {"pred_value": value}

def predict_cluster(pkg, input_dict):
    if not pkg:
        # 模拟预测结果
        return {
            "cluster_id": 0,
            "cluster_name": "自律均衡型"
        }
    
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

# API接口

# 学生相关接口
@app.route('/api/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([{
        'id': s.id,
        'student_id': s.student_id,
        'name': s.name,
        'gender': s.gender,
        'college': s.college,
        'major': s.major,
        '民族': s.民族,
        '政治面貌': s.政治面貌
    } for s in students])

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': '学生不存在'}), 404
    return jsonify({
        'id': student.id,
        'student_id': student.student_id,
        'name': student.name,
        'gender': student.gender,
        'college': student.college,
        'major': student.major,
        '民族': student.民族,
        '政治面貌': student.政治面貌
    })

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    if not data or 'student_id' not in data or 'name' not in data:
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查学生是否已存在
    existing_student = Student.query.filter_by(student_id=data['student_id']).first()
    if existing_student:
        return jsonify({'error': '学生已存在'}), 400
    
    student = Student(
        student_id=data['student_id'],
        name=data['name'],
        gender=data.get('gender'),
        college=data.get('college'),
        major=data.get('major'),
        民族=data.get('民族'),
        政治面貌=data.get('政治面貌')
    )
    
    db.session.add(student)
    db.session.commit()
    
    return jsonify({
        'id': student.id,
        'student_id': student.student_id,
        'name': student.name
    }), 201

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': '学生不存在'}), 404
    
    data = request.json
    if 'name' in data:
        student.name = data['name']
    if 'gender' in data:
        student.gender = data['gender']
    if 'college' in data:
        student.college = data['college']
    if 'major' in data:
        student.major = data['major']
    if '民族' in data:
        student.民族 = data['民族']
    if '政治面貌' in data:
        student.政治面貌 = data['政治面貌']
    
    db.session.commit()
    
    return jsonify({
        'id': student.id,
        'student_id': student.student_id,
        'name': student.name
    })

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    student = Student.query.filter_by(student_id=student_id).first()
    if not student:
        return jsonify({'error': '学生不存在'}), 404
    
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'message': '学生删除成功'})

# 特征相关接口
@app.route('/api/features/<student_id>', methods=['GET'])
def get_features(student_id):
    feature = StudentFeature.query.filter_by(student_id=student_id).first()
    if not feature:
        return jsonify({'error': '特征数据不存在'}), 404
    
    # 转换为字典
    feature_dict = {}
    for column in StudentFeature.__table__.columns:
        if column.name not in ['id', 'student_id']:
            feature_dict[column.name] = getattr(feature, column.name)
    
    return jsonify(feature_dict)

@app.route('/api/features', methods=['POST'])
def add_features():
    data = request.json
    if not data or 'student_id' not in data:
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查学生是否存在
    student = Student.query.filter_by(student_id=data['student_id']).first()
    if not student:
        return jsonify({'error': '学生不存在'}), 404
    
    # 检查特征数据是否已存在
    existing_feature = StudentFeature.query.filter_by(student_id=data['student_id']).first()
    if existing_feature:
        # 更新现有特征
        for column in StudentFeature.__table__.columns:
            if column.name in data and column.name not in ['id', 'student_id']:
                setattr(existing_feature, column.name, data[column.name])
        db.session.commit()
        return jsonify({'message': '特征数据更新成功'})
    else:
        # 创建新特征
        feature_data = {}
        for column in StudentFeature.__table__.columns:
            if column.name in data and column.name not in ['id']:
                feature_data[column.name] = data[column.name]
        
        feature = StudentFeature(**feature_data)
        db.session.add(feature)
        db.session.commit()
        return jsonify({'message': '特征数据添加成功'}), 201

# 预测相关接口
@app.route('/api/predictions/<student_id>', methods=['GET'])
def get_predictions(student_id):
    prediction = Prediction.query.filter_by(student_id=student_id).first()
    if not prediction:
        return jsonify({'error': '预测结果不存在'}), 404
    
    return jsonify({
        'student_id': prediction.student_id,
        'risk_prediction': prediction.risk_prediction,
        'risk_probability': prediction.risk_probability,
        'risk_level': prediction.risk_level,
        'scholarship_prediction': prediction.scholarship_prediction,
        'scholarship_probability': prediction.scholarship_probability,
        'performance_prediction': prediction.performance_prediction,
        'performance_probabilities': prediction.performance_probabilities,
        'health_prediction': prediction.health_prediction,
        'health_probabilities': prediction.health_probabilities,
        'change_trend_prediction': prediction.change_trend_prediction,
        'change_trend_probabilities': prediction.change_trend_probabilities,
        'score_prediction': prediction.score_prediction
    })

# 聚类相关接口
@app.route('/api/clusters/<student_id>', methods=['GET'])
def get_cluster(student_id):
    cluster = Cluster.query.filter_by(student_id=student_id).first()
    if not cluster:
        return jsonify({'error': '聚类结果不存在'}), 404
    
    return jsonify({
        'student_id': cluster.student_id,
        'cluster_id': cluster.cluster_id,
        'cluster_name': cluster.cluster_name
    })

# 模型预测接口
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({'error': '缺少输入数据'}), 400
    
    try:
        result = predict_all(data)
        
        # 如果提供了student_id，保存预测结果
        if 'student_id' in data:
            student_id = data['student_id']
            
            # 检查学生是否存在
            student = Student.query.filter_by(student_id=student_id).first()
            if not student:
                return jsonify({'error': '学生不存在'}), 404
            
            # 检查预测结果是否已存在
            existing_prediction = Prediction.query.filter_by(student_id=student_id).first()
            if existing_prediction:
                # 更新现有预测
                existing_prediction.risk_prediction = result['risk']['pred_label']
                existing_prediction.risk_probability = result['risk']['prob']
                existing_prediction.risk_level = result['risk'].get('risk_level')
                existing_prediction.scholarship_prediction = result['scholarship']['pred_label']
                existing_prediction.scholarship_probability = result['scholarship']['prob']
                existing_prediction.performance_prediction = result['performance']['pred_label']
                existing_prediction.performance_probabilities = result['performance']['prob_map']
                existing_prediction.health_prediction = result['health']['pred_label']
                existing_prediction.health_probabilities = result['health']['prob_map']
                existing_prediction.change_trend_prediction = result['change_trend']['pred_label']
                existing_prediction.change_trend_probabilities = result['change_trend']['prob_map']
                existing_prediction.score_prediction = result['score_regression']['pred_value']
            else:
                # 创建新预测
                prediction = Prediction(
                    student_id=student_id,
                    risk_prediction=result['risk']['pred_label'],
                    risk_probability=result['risk']['prob'],
                    risk_level=result['risk'].get('risk_level'),
                    scholarship_prediction=result['scholarship']['pred_label'],
                    scholarship_probability=result['scholarship']['prob'],
                    performance_prediction=result['performance']['pred_label'],
                    performance_probabilities=result['performance']['prob_map'],
                    health_prediction=result['health']['pred_label'],
                    health_probabilities=result['health']['prob_map'],
                    change_trend_prediction=result['change_trend']['pred_label'],
                    change_trend_probabilities=result['change_trend']['prob_map'],
                    score_prediction=result['score_regression']['pred_value']
                )
                db.session.add(prediction)
            
            # 保存聚类结果
            existing_cluster = Cluster.query.filter_by(student_id=student_id).first()
            if existing_cluster:
                existing_cluster.cluster_id = result['cluster']['cluster_id']
                existing_cluster.cluster_name = result['cluster']['cluster_name']
            else:
                cluster = Cluster(
                    student_id=student_id,
                    cluster_id=result['cluster']['cluster_id'],
                    cluster_name=result['cluster']['cluster_name']
                )
                db.session.add(cluster)
            
            db.session.commit()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 健康检查接口
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': model_loaded})

if __name__ == '__main__':
    # 创建数据库表
    with app.app_context():
        db.create_all()
    app.run(debug=True)
