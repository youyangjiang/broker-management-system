# 华康医保业务管理系统

这是一个面向巴西医保和保险经纪业务的中葡双语管理系统。

当前包含：

- 客户管理、多个 CNPJ 单位、联系人
- 商机管理、商机下的保险需求子项
- 联合经纪公司、渠道商
- 报价、保单、任务、活动、审计日志
- 用户管理和角色权限
- CEP 自动补地址、CNPJ/CPF/手机掩码和校验

## 项目结构

```text
backend/       FastAPI + SQLAlchemy + Alembic
frontend/      Next.js + TypeScript
scripts/       本地启动脚本
DEPLOY_RAILWAY.md  Railway 上线说明
```

## 本地启动

如果依赖已经安装，可以直接运行：

```powershell
.\scripts\start-demo.ps1
```

打开：

- 前端：http://127.0.0.1:3000/login
- 后端：http://127.0.0.1:8000/docs

默认账号：

```text
admin@example.com
Admin123!
```

## 手动启动后端

```powershell
cd backend
..\.venv\Scripts\python.exe -m app.init_dev_db
..\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## 手动启动前端

```powershell
cd frontend
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## 测试

后端：

```powershell
cd backend
..\.venv\Scripts\python.exe -m pytest
```

前端：

```powershell
cd frontend
npm run build
```

## 上线部署

推荐使用 Railway：

1. PostgreSQL 数据库
2. FastAPI 后端服务，Root Directory 选择 `backend`
3. Next.js 前端服务，Root Directory 选择 `frontend`

详细步骤见：

```text
DEPLOY_RAILWAY.md
```

线上环境变量模板见：

```text
.env.production.example
```

## 注意

本地演示默认使用 SQLite。正式上线必须使用 PostgreSQL，并设置安全的 `APP_SECRET_KEY`。
