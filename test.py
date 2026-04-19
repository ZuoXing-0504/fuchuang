import requests
import json

# 测试基础URL
BASE_URL = 'http://localhost:5000/api'

# 测试学生相关接口
def test_student_endpoints():
    print("=== 测试学生相关接口 ===")
    
    # 测试添加学生
    student_data = {
        "student_id": "20230001",
        "name": "张三",
        "gender": "男",
        "college": "电子工程学院",
        "major": "电子信息工程",
        "民族": "汉族",
        "政治面貌": "共青团员"
    }
    response = requests.post(f'{BASE_URL}/students', json=student_data)
    print(f"添加学生: {response.status_code} - {response.json()}")
    
    # 测试获取学生列表
    response = requests.get(f'{BASE_URL}/students')
    print(f"获取学生列表: {response.status_code} - {response.json()}")
    
    # 测试获取单个学生
    response = requests.get(f'{BASE_URL}/students/20230001')
    print(f"获取单个学生: {response.status_code} - {response.json()}")
    
    # 测试更新学生
    update_data = {
        "name": "张三更新",
        "gender": "女"
    }
    response = requests.put(f'{BASE_URL}/students/20230001', json=update_data)
    print(f"更新学生: {response.status_code} - {response.json()}")

# 测试特征相关接口
def test_feature_endpoints():
    print("\n=== 测试特征相关接口 ===")
    
    # 测试添加特征
    feature_data = {
        "student_id": "20230001",
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
        "学业潜力指数": 71
    }
    response = requests.post(f'{BASE_URL}/features', json=feature_data)
    print(f"添加特征: {response.status_code} - {response.json()}")
    
    # 测试获取特征
    response = requests.get(f'{BASE_URL}/features/20230001')
    print(f"获取特征: {response.status_code} - {response.json()}")

# 测试预测接口
def test_prediction_endpoint():
    print("\n=== 测试预测接口 ===")
    
    # 测试预测
    prediction_data = {
        "student_id": "20230001",
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
    response = requests.post(f'{BASE_URL}/predict', json=prediction_data)
    print(f"预测结果: {response.status_code} - {response.json()}")

# 测试健康检查接口
def test_health_check():
    print("\n=== 测试健康检查接口 ===")
    response = requests.get(f'{BASE_URL}/health')
    print(f"健康检查: {response.status_code} - {response.json()}")

if __name__ == '__main__':
    test_student_endpoints()
    test_feature_endpoints()
    test_prediction_endpoint()
    test_health_check()
