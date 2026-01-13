# 快速部署指南 - Railway

## 5分钟快速部署

### 1. 注册Railway（1分钟）
- 访问 https://railway.app
- 使用GitHub账号登录

### 2. 创建项目（1分钟）
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择您的 `gaozhiliang` 仓库

### 3. 配置项目（2分钟）
- 设置 **Root Directory** 为 `server`
- 在 "Variables" 中添加环境变量：

```
PORT=3001
NODE_ENV=production
JWT_SECRET=your-random-secret-key-here
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/database.db
FRONTEND_URL=https://your-frontend.vercel.app
```

**生成JWT_SECRET**：在终端运行 `openssl rand -hex 32`（Mac/Linux）

### 4. 等待部署（1分钟）
- Railway自动构建和部署
- 等待完成，获取URL（例如：`https://xxx.up.railway.app`）

### 5. 更新前端（1分钟）
- 在Vercel项目设置中添加环境变量：
  ```
  VITE_API_BASE_URL=https://your-backend-url.railway.app/api
  ```
- Vercel会自动重新部署

## ✅ 完成！

现在您的后端已经部署完成！

访问 `https://your-backend-url.railway.app/health` 测试是否正常。



