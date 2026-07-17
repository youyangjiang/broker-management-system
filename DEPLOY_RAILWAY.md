# Railway 上线步骤

这个项目建议在 Railway 上部署 3 个服务：

1. PostgreSQL 数据库
2. 后端 FastAPI 服务，目录选择 `backend`
3. 前端 Next.js 服务，目录选择 `frontend`

## 第一步：上传到 GitHub

把整个项目文件夹上传到一个 GitHub 仓库。Railway 后面会从这个仓库自动部署。

## 第二步：创建 Railway 项目

1. 打开 https://railway.com
2. 登录或注册账号
3. New Project
4. Add PostgreSQL

创建完成后，PostgreSQL 服务里会有 `DATABASE_URL`。

## 第三步：部署后端

1. 在同一个 Railway 项目里选择 New Service
2. 选择 Deploy from GitHub repo
3. 选择这个项目仓库
4. Root Directory 设置为 `backend`
5. Railway 会使用 `backend/Dockerfile`

后端环境变量：

```env
DATABASE_URL=Railway PostgreSQL 自动提供的 DATABASE_URL
APP_SECRET_KEY=请填写一串很长的随机字符
ACCESS_TOKEN_EXPIRE_MINUTES=480
BACKEND_CORS_ORIGINS=https://你的前端域名
```

后端启动时会自动执行：

```bash
alembic upgrade head
python -m app.seed
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 第四步：部署前端

1. New Service
2. Deploy from GitHub repo
3. 选择同一个仓库
4. Root Directory 设置为 `frontend`
5. Railway 会使用 `frontend/Dockerfile`

前端环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://你的后端域名/api/v1
```

## 第五步：配置域名

在 Railway 每个服务的 Networking 里 Generate Domain：

- 后端类似：`https://xxx-backend.up.railway.app`
- 前端类似：`https://xxx-frontend.up.railway.app`

然后把前端域名填到后端的 `BACKEND_CORS_ORIGINS`。
把后端域名填到前端的 `NEXT_PUBLIC_API_BASE_URL`。

修改环境变量后，需要 Redeploy。

## 默认账号

```text
admin@example.com
Admin123!
```

上线后请立刻登录并修改管理员密码。
