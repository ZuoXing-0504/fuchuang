# 知行雷达生产部署说明

这份说明面向“长期稳定上线”的部署方式，目标是把当前项目以：

- `Nginx`
- `Flask + Gunicorn`
- `PostgreSQL`
- `Web 管理端`
- `Web 学生端`

组合成一套可持续运行的正式系统。

## 一、目标访问结构

建议生产环境统一为：

- `https://your-domain.com/admin/`
- `https://your-domain.com/student/`
- `https://your-domain.com/api/`
- `https://your-domain.com/healthz`

## 二、服务器建议

- Ubuntu 22.04 LTS
- 2 vCPU / 4GB RAM 起步
- 至少 20GB 可用磁盘
- 已安装 Docker Engine 与 Docker Compose 插件
- 建议已绑定域名

## 三、上传项目

将仓库上传到服务器，例如：

```bash
scp -r ./fuchuang user@your-server:/srv/fuchuang
ssh user@your-server
cd /srv/fuchuang
```

## 四、准备环境文件

复制模板：

```bash
cp .env.production.example .env.production
```

你至少要修改这些项：

- `DATABASE_URL`
- `POSTGRES_PASSWORD`
- `QWEN_API_KEY`
- `ALLOWED_ORIGINS`
- `ADMIN_DEFAULT_PASSWORD`
- `HTTP_PORT`

推荐示例：

```env
DATABASE_URL=postgresql+psycopg2://student_behavior:strong_password@postgres:5432/student_behavior
FLASK_DEBUG=0
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
TOKEN_TTL_HOURS=12
PASSWORD_HASH_METHOD=pbkdf2:sha256:600000
ADMIN_DEFAULT_PASSWORD=change_this_admin_password
QWEN_API_KEY=your_real_qwen_api_key
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

POSTGRES_DB=student_behavior
POSTGRES_USER=student_behavior
POSTGRES_PASSWORD=strong_password

WEB_API_BASE=/api
HTTP_PORT=80
```

## 五、首次启动

### 方式 1：直接使用 compose

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 方式 2：使用封装脚本

```bash
chmod +x scripts/deploy_production_ubuntu.sh
./scripts/deploy_production_ubuntu.sh /srv/fuchuang .env.production
```

## 六、健康检查

启动后检查：

```bash
python3 scripts/check_production_health.py http://127.0.0.1
```

或直接：

```bash
curl http://127.0.0.1/healthz
```

正确时应返回：

- `code = 200`
- `status = healthy`
- `database = postgresql+psycopg2`

## 七、迁移现有 SQLite 账号与日志

如果你们要保留本地当前的账号与审计日志，请在生产 PostgreSQL 起好之后执行：

```bash
TARGET_DATABASE_URL='postgresql+psycopg2://student_behavior:strong_password@127.0.0.1:5432/student_behavior' \
python3 scripts/migrate_sqlite_to_postgres.py
```

已覆盖的表：

- `students`
- `student_features`
- `predictions`
- `clusters`
- `user_accounts`
- `audit_logs`

说明：

- 你们当前分析主数据仍主要来自 CSV 和模型产物
- PostgreSQL 主要承担账号、审计和运行时结构化数据

## 八、安卓端上线注意事项

移动端不要再使用：

- `127.0.0.1`
- `192.168.x.x`

而应改成正式服务器地址，例如：

- `https://your-domain.com/api`

当前移动端默认接口配置文件：

- `front/mobile-uniapp/common/config.js`

改完后重新打包安卓正式包。

## 九、备份与恢复

### 备份

```bash
chmod +x scripts/backup_postgres_ubuntu.sh
./scripts/backup_postgres_ubuntu.sh /srv/fuchuang .env.production /srv/fuchuang/backups
```

### 恢复

```bash
chmod +x scripts/restore_postgres_ubuntu.sh
./scripts/restore_postgres_ubuntu.sh /srv/fuchuang .env.production /srv/fuchuang/backups/student_behavior_20260422_120000.sql.gz
```

## 十、常用运维命令

查看状态：

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

查看后端日志：

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f backend
```

查看 Nginx 日志：

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f nginx
```

重新部署：

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

停止服务：

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

## 十一、正式上线前最后检查

- 域名已解析到服务器
- HTTPS 已启用
- 防火墙已开放 `80/443`
- `QWEN_API_KEY` 已更换为正式环境专用密钥
- 管理员默认密码已修改
- 已做一次数据库备份演练
- 安卓端默认 API 地址已改为正式域名

## 十二、当前项目状态说明

本仓库已经完成：

- PostgreSQL 生产切换支持
- Docker 生产编排
- Gunicorn 后端运行
- Nginx 统一入口
- 提交材料生成

如果按本说明执行，项目已经可以进入：

- 可部署
- 可上线
- 可持续维护

的状态。

