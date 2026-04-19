# Deployment Guide

## 1. Local Development

### Step 1: bootstrap

```powershell
.\scripts\Bootstrap-Dev.ps1
```

这一步会完成：

- 生成根目录 `.env`
- 生成 `front/web-admin/.env.local`
- 生成 `front/web-student/.env.local`
- 创建 `.venv`
- 安装 Python 依赖
- 安装两个前端的 npm 依赖

### Step 2: start everything

```powershell
.\scripts\Start-Dev.ps1
```

默认端口：

- Flask API: `5000`
- Admin Web: `3200`
- Student Web: `3201`

## 2. Environment Variables

根目录 `.env` 当前支持：

- `DATABASE_URL`
- `FLASK_DEBUG`
- `FLASK_HOST`
- `FLASK_PORT`
- `TOKEN_TTL_HOURS`
- `PASSWORD_HASH_METHOD`
- `ADMIN_DEFAULT_PASSWORD`

管理员端和学生端 `.env.local` 当前支持：

- `VITE_API_BASE`
- `VITE_USE_MOCK`
- `VITE_AUTH_STORAGE_KEY`

## 3. Docker

先准备根目录 `.env`：

```powershell
Copy-Item .env.example .env -Force
```

然后启动：

```powershell
docker compose up --build
```

Compose 会启动：

- `backend`
- `web-admin`
- `web-student`

## 4. Test And Build

统一检查命令：

```powershell
.\scripts\Run-Checks.ps1
```

这一步会执行：

- `python -m unittest discover -s tests -p test_*.py`
- `front/web-admin` 的 `npm run build`
- `front/web-student` 的 `npm run build`

## 5. Troubleshooting

### 管理端或学生端出现 401

- 清理浏览器本地存储里的登录缓存
- 重新登录，获取新的 token
- 检查后端 `.env` 中 `TOKEN_TTL_HOURS` 是否过短

### 前端连不上后端

- 确认 Flask 服务在 `5000` 端口运行
- 检查两个前端项目下 `.env.local` 的 `VITE_API_BASE`
- 检查防火墙是否拦截本地端口

### 换机器后启动失败

- 先重新执行 `.\scripts\Bootstrap-Dev.ps1`
- 确认 Python 3.11+ 和 Node.js 20+ 已安装
- 如果分析图表缺失，先启动后端，系统会自动尝试补齐图表输出
