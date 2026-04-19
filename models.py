from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class Student(Base):
    __tablename__ = 'students'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    gender = Column(String(10))
    college = Column(String(100))
    major = Column(String(100))
    民族 = Column(String(50))
    政治面貌 = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    features = relationship('StudentFeature', back_populates='student', uselist=False)
    predictions = relationship('Prediction', back_populates='student', uselist=False)
    cluster = relationship('Cluster', back_populates='student', uselist=False)

class StudentFeature(Base):
    __tablename__ = 'student_features'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey('students.student_id'), nullable=False)
    上网时长 = Column(Float)
    月均上网时长 = Column(Float)
    跑步次数 = Column(Integer)
    锻炼次数 = Column(Integer)
    体测分 = Column(Float)
    BMI = Column(Float)
    肺活量 = Column(Float)
    视频学习时长 = Column(Float)
    测验平均分 = Column(Float)
    作业平均分 = Column(Float)
    考试平均分 = Column(Float)
    作业提交次数 = Column(Integer)
    作业完成次数 = Column(Integer)
    自律指数 = Column(Float)
    学习稳定性指数 = Column(Float)
    图书馆次数 = Column(Integer)
    门禁次数 = Column(Integer)
    讨论数 = Column(Integer)
    回帖数 = Column(Integer)
    社团次数 = Column(Integer)
    竞赛次数 = Column(Integer)
    英语成绩 = Column(Float)
    综合成绩 = Column(Float)
    学习指数 = Column(Float)
    健康指数 = Column(Float)
    社交指数 = Column(Float)
    作业执行力指数 = Column(Float)
    线上积极性指数 = Column(Float)
    综合发展指数 = Column(Float)
    学业潜力指数 = Column(Float)
    奖学金次数 = Column(Integer)
    奖学金金额 = Column(Float)
    夜间次数 = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    student = relationship('Student', back_populates='features')

class Prediction(Base):
    __tablename__ = 'predictions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey('students.student_id'), nullable=False)
    risk_prediction = Column(Integer)
    risk_probability = Column(Float)
    risk_level = Column(String(20))
    scholarship_prediction = Column(Integer)
    scholarship_probability = Column(Float)
    performance_prediction = Column(String(20))
    performance_probabilities = Column(JSON)
    health_prediction = Column(String(20))
    health_probabilities = Column(JSON)
    change_trend_prediction = Column(String(20))
    change_trend_probabilities = Column(JSON)
    score_prediction = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    student = relationship('Student', back_populates='predictions')

class Cluster(Base):
    __tablename__ = 'clusters'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey('students.student_id'), nullable=False)
    cluster_id = Column(Integer)
    cluster_name = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    student = relationship('Student', back_populates='cluster')
