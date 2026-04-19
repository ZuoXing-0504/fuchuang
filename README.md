# Student Behavior Analysis

学生行为画像与风险预警项目，当前主线是：

- `app.py` 提供 Flask 后端接口
- `front/web-admin` 提供管理员端 Web
- `front/web-student` 提供学生端 Web
- `our project/analysis_*` 与 `our project/model_outputs` 提供画像、图表和模型分析数据

## Quick Start

1. 初始化本地环境

```powershell
.\scripts\Bootstrap-Dev.ps1
```

2. 一键启动前后端

```powershell
.\scripts\Start-Dev.ps1
```

3. 打开页面

- 后端: `http://127.0.0.1:5000`
- 管理员端: `http://127.0.0.1:3200`
- 学生端: `http://127.0.0.1:3201`

管理员默认账号：

- 用户名: `admin001`
- 密码: `123456`

## Validation

运行后端测试和前端构建检查：

```powershell
.\scripts\Run-Checks.ps1
```

## Docker

如果本机已经安装 Docker Desktop，可以直接运行：

```powershell
Copy-Item .env.example .env -Force
docker compose up --build
```

## Environment Files

- 根目录 `.env` 控制 Flask 数据库、端口和令牌配置
- `front/web-admin/.env.local` 控制管理员端 API 地址
- `front/web-student/.env.local` 控制学生端 API 地址

对应模板已经放在：

- `.env.example`
- `front/web-admin/.env.example`
- `front/web-student/.env.example`

## Repository Notes

- `analysis_master.csv` 是页面展示与画像读取的主数据源
- `student_behavior.db` 负责账号、令牌和运行时存储
- `tests/` 下的测试覆盖后端接口、关键分析脚本和前后端契约
- `docs/API_CONTRACT.md` 记录接口契约
- `docs/DEPLOYMENT.md` 记录部署细节与排障说明
