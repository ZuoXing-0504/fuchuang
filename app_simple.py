from flask import Flask, request, jsonify

app = Flask(__name__)

# 模拟数据库
students = []
features = {}
predictions = {}
clusters = {}

# 学生相关接口
@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify(students)

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    for student in students:
        if student['student_id'] == student_id:
            return jsonify(student)
    return jsonify({'error': '学生不存在'}), 404

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    if not data or 'student_id' not in data or 'name' not in data:
        return jsonify({'error': '缺少必要参数'}), 400
    
    # 检查学生是否已存在
    for student in students:
        if student['student_id'] == data['student_id']:
            return jsonify({'error': '学生已存在'}), 400
    
    student = {
        'student_id': data['student_id'],
        'name': data['name'],
        'gender': data.get('gender'),
        'college': data.get('college'),
        'major': data.get('major'),
        '民族': data.get('民族'),
        '政治面貌': data.get('政治面貌')
    }
    students.append(student)
    return jsonify(student), 201

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    for student in students:
        if student['student_id'] == student_id:
            data = request.json
            if 'name' in data:
                student['name'] = data['name']
            if 'gender' in data:
                student['gender'] = data['gender']
            if 'college' in data:
                student['college'] = data['college']
            if 'major' in data:
                student['major'] = data['major']
            if '民族' in data:
                student['民族'] = data['民族']
            if '政治面貌' in data:
                student['政治面貌'] = data['政治面貌']
            return jsonify(student)
    return jsonify({'error': '学生不存在'}), 404

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    for i, student in enumerate(students):
        if student['student_id'] == student_id:
            students.pop(i)
            return jsonify({'message': '学生删除成功'})
    return jsonify({'error': '学生不存在'}), 404

# 特征相关接口
@app.route('/api/features/<student_id>', methods=['GET'])
def get_features(student_id):
    if student_id in features:
        return jsonify(features[student_id])
    return jsonify({'error': '特征数据不存在'}), 404

@app.route('/api/features', methods=['POST'])
def add_features():
    data = request.json
    if not data or 'student_id' not in data:
        return jsonify({'error': '缺少必要参数'}), 400
    
    features[data['student_id']] = data
    return jsonify({'message': '特征数据添加成功'})

# 预测相关接口
@app.route('/api/predictions/<student_id>', methods=['GET'])
def get_predictions(student_id):
    if student_id in predictions:
        return jsonify(predictions[student_id])
    return jsonify({'error': '预测结果不存在'}), 404

# 聚类相关接口
@app.route('/api/clusters/<student_id>', methods=['GET'])
def get_cluster(student_id):
    if student_id in clusters:
        return jsonify(clusters[student_id])
    return jsonify({'error': '聚类结果不存在'}), 404

# 模型预测接口
@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    if not data:
        return jsonify({'error': '缺少输入数据'}), 400
    
    # 模拟预测结果
    result = {
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
    
    # 如果提供了student_id，保存预测结果
    if 'student_id' in data:
        predictions[data['student_id']] = result
        clusters[data['student_id']] = result['cluster']
    
    return jsonify(result)

# 健康检查接口
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True)
