# Render 部署步骤指南

## 📋 第一步：确保代码在 GitHub 上

### 如果代码还没推送，有两种方式：

#### 方式A：通过 GitHub 网页上传（推荐）

1. 访问您的 GitHub 仓库：https://github.com/HicentChoo/gaozhiliang
2. 点击 **"Add file"** -> **"Upload files"**
3. 将以下文件/文件夹拖拽上传：
   - `server/` 整个文件夹
   - `DEPLOYMENT_GUIDE.md`
   - `BACKEND_README.md`
   - 其他新增的文件
4. 在页面底部填写提交信息：`feat: 添加后端代码和API集成`
5. 点击 **"Commit changes"**

#### 方式B：配置 Git 认证后推送

如果您想使用命令行，需要配置 Personal Access Token。

---

## 🚀 第二步：在 Render 上部署

### 步骤1：注册 Render 账号

1. 访问 https://render.com
2. 点击 **"Get Started for Free"**（免费开始）
3. 使用 **GitHub 账号登录**（推荐，方便集成）

### 步骤2：创建 Web Service

1. 登录后，点击页面右上角的 **"New +"** 按钮
2. 选择 **"Web Service"**

### 步骤3：连接 GitHub 仓库

1. **首次使用需要授权 GitHub**：
   - 如果看到 "Connect GitHub" 或 "Authorize Render" 按钮，点击它
   - 选择要授权的仓库：
     - 可以选择 **"All repositories"**（所有仓库）
     - 或只选择 **"Only select repositories"** -> 选择 `gaozhiliang`
   - 点击 **"Install"** 或 **"Authorize"** 完成授权

2. **选择仓库**：
   - 授权后，在仓库列表中找到并选择 `gaozhiliang` 仓库
   - 如果看不到仓库，点击 **"Configure"** 或 **"Change account"** 重新授权

### 步骤4：配置服务

在创建服务的配置页面，填写以下信息：

#### 基本信息：
- **Name**: `gaozhiliang-backend`（或您喜欢的名字）
- **Region**: 选择离您最近的区域
  - 推荐：`Singapore`（新加坡，离中国最近）
  - 或：`Oregon (US West)`（美国西部）
- **Branch**: `main`（或您的默认分支名）
- **Root Directory**: `server` ⚠️ **重要：必须设置为 `server`**

#### 构建和启动：
- **Runtime**: `Node`（应该自动检测到）
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### 计划：
- 选择 **Free** 计划（免费版）

### 步骤5：配置环境变量

在创建服务前，点击页面下方的 **"Advanced"** 按钮展开高级选项。

在 **"Environment Variables"** 部分，点击 **"Add Environment Variable"**，逐个添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `3001` | 服务端口（Render会自动设置，但建议保留） |
| `NODE_ENV` | `production` | 生产环境 |
| `JWT_SECRET` | `fb4ca028e3fbce83a6211e99e76197d226e16326c72d2e7723d53ff8c0ab6aa0` | JWT密钥（已为您生成） |
| `JWT_EXPIRES_IN` | `7d` | Token有效期7天 |
| `DATABASE_PATH` | `./data/database.db` | 数据库文件路径 |
| `FRONTEND_URL` | `https://你的前端域名.vercel.app` | ⚠️ 需要替换为您的实际前端地址 |

**重要**：
- `FRONTEND_URL` 需要替换为您在 Vercel 上部署的前端地址
- 如果不知道前端地址，可以先填写一个临时值，部署后再修改

### 步骤6：创建并部署

1. 检查所有配置是否正确
2. 点击页面底部的 **"Create Web Service"** 按钮
3. Render 会自动开始部署
4. 可以在 **"Logs"** 标签查看实时部署日志

### 步骤7：等待部署完成

- 部署通常需要 **3-5 分钟**
- 可以在 **"Logs"** 标签查看进度
- 如果看到 "Your service is live" 表示部署成功

### 步骤8：获取后端URL

部署完成后，Render 会提供一个公共URL，格式如下：
```
https://gaozhiliang-backend.onrender.com
```

**注意**：
- 这个URL就是您的后端API地址
- 免费版在15分钟无活动后会休眠，首次访问可能需要等待30-60秒唤醒

---

## 🔧 第三步：更新前端配置

部署完成后，需要更新前端的API地址：

### 在 Vercel 上配置环境变量

1. 登录 Vercel：https://vercel.com
2. 进入您的项目
3. 点击 **"Settings"** -> **"Environment Variables"**
4. 添加新的环境变量：
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://gaozhiliang-backend.onrender.com/api`
   - **Environment**: 选择 `Production`、`Preview`、`Development`（全选）
5. 点击 **"Save"**
6. Vercel 会自动重新部署前端

---

## ✅ 第四步：测试部署

### 测试后端健康检查

访问：
```
https://gaozhiliang-backend.onrender.com/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### 测试前端

访问您的前端地址，尝试登录或使用功能，检查是否能正常调用后端API。

---

## 🐛 常见问题

### Q: 部署失败怎么办？
A: 
- 查看 **"Logs"** 标签中的错误信息
- 检查 `Root Directory` 是否设置为 `server`
- 检查 `Build Command` 和 `Start Command` 是否正确
- 确保代码已推送到 GitHub

### Q: 服务休眠了怎么办？
A: 
- 免费版在15分钟无活动后会休眠
- 首次访问需要等待30-60秒唤醒
- 这是正常现象，不影响使用

### Q: 如何查看日志？
A: 
- 在 Render 服务页面，点击 **"Logs"** 标签
- 可以看到实时日志和错误信息

### Q: 如何更新代码？
A: 
- 在本地修改代码后，推送到 GitHub
- Render 会自动检测并重新部署
- 或手动点击 **"Manual Deploy"** -> **"Deploy latest commit"**

---

## 🎉 完成！

部署完成后，您将拥有：
- ✅ 后端API运行在云端
- ✅ 自动HTTPS
- ✅ 可以通过公共URL访问
- ✅ 前端可以调用后端API

下一步：
1. 更新前端环境变量
2. 重新部署前端
3. 测试完整功能！

