# 知行雷达

知行雷达是一个面向高校场景的学生行为分析、风险预警与成长支持系统，包含：

- Flask 后端 API
- 管理端 Web：`front/web-admin`
- 学生端 Web：`front/web-student`
- 学生/管理移动端：`front/mobile-uniapp`
- 分析数据与模型产物：`our project`、`ml/saved_models`

## 当前能力

- 学生个体画像与群体画像
- 风险预警与干预建议
- 多任务预测模块
- 个性化报告
- 全样本分析图表
- 学生智能助手
- 管理端与学生端双端支持
- 本地 PostgreSQL 运行时数据库

## 本地开发

### 1. 安装依赖

```powershell
.\scripts\Bootstrap-Dev.ps1
```

### 2. 启动系统

```powershell
.\.venv\Scripts\python.exe .\run_backend.py
```

Web 前端分别启动：

```powershell
cd front\web-admin
npm install
npm run dev
```

```powershell
cd front\web-student
npm install
npm run dev
```

### 3. 默认访问地址

- 后端：`http://127.0.0.1:5000`
- 管理端：`http://127.0.0.1:3200`
- 学生端：`http://127.0.0.1:3201`

### 4. 默认测试账号

- 管理员：`admin001 / 123456`
- 学生：`200307700011 / 123456`

## 数据说明

系统当前分为两类数据源：

### 1. 运行时数据库

当前本地默认使用 PostgreSQL：

- 数据库名：`student_behavior`
- 用户名：`student_behavior`

数据库主要承载：

- 用户账号
- 登录态与令牌
- 审计日志
- 结构化运行时表

### 2. 分析主数据

以下内容仍主要来自仓库内分析产物：

- `our project/analysis_master.csv`
- `our project/train_features_final.csv`
- `our project/model_outputs`
- `ml/saved_models`

## 生产部署

长期稳定上线请使用：

- `docker-compose.prod.yml`
- `.env.production.example`
- `docs/DEPLOYMENT_PRODUCTION.md`

生产方案包含：

- PostgreSQL
- Gunicorn
- Nginx
- 管理端/学生端静态构建
- `/api`、`/admin`、`/student` 统一入口

## 移动端

移动端目录：

- `front/mobile-uniapp`

打包前请确认：

- 接口地址已切换为服务器地址
- `manifest.json` 已更新应用名与图标
- 重新运行到基座或重新打正式包

## 提交材料

比赛提交材料已生成在：

- `submission_materials/outputs`

建议进一步使用：

- `submission_materials/README.md`
- `submission_materials/TEAM_INFO.template.json`
- `submission_materials/build_final_package.py`

用于生成最终命名、最终压缩包与提交目录。

## 验证

### 后端健康检查

```powershell
Invoke-RestMethod http://127.0.0.1:5000/healthz
```

### 生产数据库确认

返回中的 `data.database` 应为：

- `postgresql+psycopg2`

## 目录概览

- `app.py`：主后端应用
- `run_backend.py`：本地后端启动入口
- `docs/`：部署与接口说明
- `scripts/`：辅助脚本
- `submission_materials/`：比赛提交材料与打包工具

