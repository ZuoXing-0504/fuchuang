-- 数据库结构设计

-- 学生基本信息表
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    college VARCHAR(100),
    major VARCHAR(100),
   民族 VARCHAR(50),
   政治面貌 VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 学生特征数据表
CREATE TABLE student_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    上网时长 FLOAT,
    月均上网时长 FLOAT,
    跑步次数 INT,
    锻炼次数 INT,
    体测分 FLOAT,
    BMI FLOAT,
    肺活量 FLOAT,
    视频学习时长 FLOAT,
    测验平均分 FLOAT,
    作业平均分 FLOAT,
    考试平均分 FLOAT,
    作业提交次数 INT,
    作业完成次数 INT,
    自律指数 FLOAT,
    学习稳定性指数 FLOAT,
    图书馆次数 INT,
    门禁次数 INT,
    讨论数 INT,
    回帖数 INT,
    社团次数 INT,
    竞赛次数 INT,
    英语成绩 FLOAT,
    综合成绩 FLOAT,
    学习指数 FLOAT,
    健康指数 FLOAT,
    社交指数 FLOAT,
    作业执行力指数 FLOAT,
    线上积极性指数 FLOAT,
    综合发展指数 FLOAT,
    学业潜力指数 FLOAT,
    奖学金次数 INT,
    奖学金金额 FLOAT,
    夜间次数 INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- 预测结果表
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    risk_prediction INT,
    risk_probability FLOAT,
    risk_level VARCHAR(20),
    scholarship_prediction INT,
    scholarship_probability FLOAT,
    performance_prediction VARCHAR(20),
    performance_probabilities JSON,
    health_prediction VARCHAR(20),
    health_probabilities JSON,
    change_trend_prediction VARCHAR(20),
    change_trend_probabilities JSON,
    score_prediction FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- 聚类信息表
CREATE TABLE clusters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) NOT NULL,
    cluster_id INT,
    cluster_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id)
);
