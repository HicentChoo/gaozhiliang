# 后端部署指南

本指南将帮助您将后端API部署到云端，使其可以被前端访问。

## 🎯 推荐方案

考虑到您的项目使用传统的 Node.js + Express + SQLite，推荐以下部署方案：

### 方案1：Render（推荐，免费可用）⭐⭐⭐⭐⭐
- ✅ **完全免费**（无需付费）
- ✅ 配置简单，自动检测 Node.js 项目
- ✅ 自动部署（GitHub集成）
- ✅ 支持环境变量
- ✅ 自动HTTPS
- ⚠️ 免费版15分钟无活动后会休眠（首次访问会慢，但可以接受）

### 方案2：国内云服务器（需要实名认证）⭐⭐⭐⭐
- ✅ 完全控制，性能稳定
- ✅ 无休眠限制
- ⚠️ 需要配置服务器（我会提供详细步骤）
- ⚠️ 需要实名认证
- 💰 推荐：**腾讯云轻量应用服务器**（约 ¥24/月，新用户有免费试用）

### 方案3：Railway（已确认免费版不支持常规服务）❌
- ❌ 免费版只能部署数据库，不能部署 Node.js 服务
- 💰 需要付费才能部署应用

## 📋 部署前准备

### 1. 确保代码已上传到GitHub ⚠️ 重要！

**Railway 需要从 GitHub 仓库部署，所以必须先确保所有代码（包括 `server/` 目录）都已推送到 GitHub。**

#### 检查代码是否已推送：

1. 打开终端，进入项目目录
2. 运行 `git status` 查看是否有未提交的更改
3. 如果有未提交的文件（特别是 `server/` 目录），需要先提交并推送

#### 如果代码未推送，按以下步骤操作：

```bash
# 1. 进入项目目录
cd /Users/choo/gaozhiliang

# 2. 添加所有文件（包括 server 目录）
git add .

# 3. 提交更改
git commit -m "feat: 添加后端代码和API集成"

# 4. 推送到 GitHub
git push origin main
```

**注意**：如果之前是通过网页上传的代码，可能没有包含 `server/` 目录。现在需要确保后端代码也在 GitHub 上。

### 2. 准备环境变量

后端需要以下环境变量：

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/database.db
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**重要**：
- `JWT_SECRET`: 生成一个随机字符串（例如：使用 `openssl rand -hex 32`）
- `FRONTEND_URL`: 替换为您的前端Vercel部署地址

---

## 🚀 方案1：Render 部署（推荐，免费可用）

### 步骤1：注册Render账号

1. 访问 https://render.com
2. 点击 **"Get Started for Free"**（免费开始）
3. 使用 **GitHub 账号登录**（推荐，方便集成）

### 步骤2：创建Web Service

1. 登录后，点击 **"New +"** -> **"Web Service"**
2. **首次使用需要授权 GitHub**：
   - 点击 **"Connect account"** 或 **"Authorize Render"**
   - 选择要授权的仓库（可以选择所有仓库，或只选择 `gaozhiliang`）
   - 点击 **"Install"** 完成授权
3. **选择仓库**：
   - 在仓库列表中找到并选择 `gaozhiliang` 仓库
   - 如果看不到仓库，点击 **"Configure"** 重新授权

### 步骤3：配置服务

在创建服务的配置页面，填写以下信息：

**基本信息**：
- **Name**: `gaozhiliang-backend`（或您喜欢的名字）
- **Region**: 选择离您最近的区域（如 `Singapore` 或 `Oregon (US West)`）
- **Branch**: `main`（或您的默认分支）
- **Root Directory**: `server` ⚠️ **重要：必须设置为 `server`**

**构建和启动**：
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**计划**：
- 选择 **Free** 计划（免费版）

### 步骤4：配置环境变量

在创建服务前，点击 **"Advanced"** 展开高级选项，在 **"Environment Variables"** 部分添加：

```
PORT=3001
NODE_ENV=production
JWT_SECRET=你的随机密钥（例如：使用 openssl rand -hex 32 生成）
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/database.db
FRONTEND_URL=https://你的前端域名.vercel.app
```

**生成JWT_SECRET的方法**：
- Mac/Linux: 在终端运行 `openssl rand -hex 32`
- Windows: 使用在线工具或PowerShell

**注意**：也可以在服务创建后，在服务设置页面的 **"Environment"** 标签中添加环境变量。

### 步骤5：创建并部署

1. 点击 **"Create Web Service"**
2. Render 会自动开始部署
3. 等待部署完成（通常3-5分钟）
4. 可以在 **"Logs"** 标签查看部署日志

### 步骤6：获取后端URL

部署完成后，Render 会提供一个公共URL，例如：
```
https://gaozhiliang-backend.onrender.com
```

这个URL就是您的后端API地址！

**注意**：免费版在15分钟无活动后会休眠，首次访问可能需要等待30-60秒唤醒服务。

---

## 🚀 方案2：国内云服务器部署（需要实名认证）

如果您希望使用国内平台，可以选择云服务器。推荐 **腾讯云轻量应用服务器**（新用户有免费试用）。

### 推荐：腾讯云轻量应用服务器

**优点**：
- ✅ 国内访问速度快
- ✅ 新用户有免费试用（1个月）
- ✅ 价格相对便宜（约 ¥24/月）
- ✅ 完全控制，无休眠限制

**缺点**：
- ⚠️ 需要实名认证
- ⚠️ 需要手动配置服务器（我会提供详细步骤）

### 步骤1：购买/申请服务器

1. 访问 https://cloud.tencent.com
2. 注册账号并完成实名认证
3. 进入 **轻量应用服务器** 控制台
4. 点击 **"新建"** 创建服务器
5. 选择配置：
   - **地域**：选择离您最近的（如 `北京`、`上海`）
   - **镜像**：选择 `Ubuntu 22.04 LTS` 或 `CentOS 7.6`
   - **套餐**：选择最便宜的即可（约 ¥24/月）
   - **购买时长**：1个月（新用户可能有免费试用）

### 步骤2：配置服务器

#### 2.1 连接服务器

1. 在服务器控制台，找到您的服务器
2. 点击 **"登录"** 或使用 SSH 工具连接
3. 使用 root 账号和密码登录

#### 2.2 安装 Node.js

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18（使用 NodeSource）
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装 PM2（进程管理器，用于保持服务运行）
sudo npm install -g pm2
```

#### 2.3 安装 Git

```bash
sudo apt install -y git
```

#### 2.4 克隆项目

```bash
# 创建项目目录
mkdir -p /var/www
cd /var/www

# 克隆您的 GitHub 仓库
git clone https://github.com/HicentChoo/gaozhiliang.git
cd gaozhiliang/server

# 安装依赖
npm install
```

#### 2.5 配置环境变量

```bash
# 创建 .env 文件
nano .env
```

在文件中添加：
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=你的随机密钥（使用 openssl rand -hex 32 生成）
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/database.db
FRONTEND_URL=https://你的前端域名.vercel.app
```

保存文件（按 `Ctrl+X`，然后 `Y`，然后 `Enter`）

#### 2.6 初始化数据库

```bash
npm run db:init
```

#### 2.7 构建项目

```bash
npm run build
```

#### 2.8 使用 PM2 启动服务

```bash
# 启动服务
pm2 start npm --name "gaozhiliang-backend" -- start

# 设置开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status
pm2 logs
```

### 步骤3：配置防火墙

1. 在腾讯云控制台，进入服务器详情
2. 点击 **"防火墙"** 标签
3. 添加规则：
   - **端口**：`3001`
   - **协议**：`TCP`
   - **来源**：`0.0.0.0/0`（允许所有IP访问）

### 步骤4：配置域名（可选）

如果需要使用域名：

1. 在服务器控制台，找到 **"公网IP"**
2. 在域名服务商（如腾讯云、阿里云）添加 A 记录
3. 将域名指向服务器的公网IP

### 步骤5：配置 Nginx 反向代理（推荐）

使用 Nginx 可以让服务运行在 80/443 端口，并支持 HTTPS：

```bash
# 安装 Nginx
sudo apt install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/gaozhiliang
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name 你的域名.com;  # 或使用服务器IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/gaozhiliang /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 获取后端URL

部署完成后，您的后端地址为：
- 直接访问：`http://服务器公网IP:3001`
- 或使用域名：`http://你的域名.com`

---

## 🚀 方案3：其他国内平台（备选）

### 阿里云 ECS
- 类似腾讯云，需要配置服务器
- 新用户有免费试用
- 访问：https://www.aliyun.com

### UCloud
- 有免费试用额度
- 访问：https://www.ucloud.cn

### 华为云
- 有免费试用
- 访问：https://www.huaweicloud.com

---

### 步骤1：注册Render账号

1. 访问 https://render.com
2. 点击 "Get Started for Free"
3. 使用GitHub账号登录

---

## 🔧 部署后配置

### 1. 更新前端API地址

部署完成后，需要更新前端的API地址：

1. 在Vercel项目设置中，添加环境变量：
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
   或（如果使用云服务器）
   ```
   VITE_API_BASE_URL=http://你的服务器IP:3001/api
   ```
   或（如果配置了域名）
   ```
   VITE_API_BASE_URL=http://你的域名.com/api
   ```

2. 重新部署前端（Vercel会自动检测环境变量变化并重新部署）

### 2. 更新后端CORS设置

确保后端的 `FRONTEND_URL` 环境变量指向正确的前端地址（已经在步骤4中配置）。

### 3. 测试API

访问后端健康检查端点：
```
https://your-backend-url.onrender.com/health
```
或（如果使用云服务器）
```
http://你的服务器IP:3001/health
```

应该返回：
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

---

## 📝 数据库初始化问题

SQLite数据库文件需要初始化。有几个解决方案：

### 方案A：在部署后手动初始化（最简单）

1. 部署完成后，通过SSH或Web控制台访问服务器
2. 运行数据库初始化命令
3. 但这在某些平台可能不可行

### 方案B：修改代码自动初始化（推荐）

代码中已经有自动初始化逻辑（在 `src/index.ts` 中），应该会自动创建数据库。但如果遇到问题，可以：

1. 确保 `data` 目录有写权限
2. 在首次访问时检查数据库是否存在，如果不存在则初始化

### 方案C：使用数据库迁移工具

创建一个迁移脚本，在首次部署时运行。

---

## ⚠️ 注意事项

1. **SQLite限制**：
   - SQLite适合小型应用
   - 如果在生产环境需要更高性能，考虑迁移到PostgreSQL
   - Railway和Render都支持PostgreSQL（需要付费或使用免费额度）

2. **数据持久化**：
   - SQLite文件需要持久化存储
   - Railway和Render的免费版可能不支持文件持久化
   - 如果需要持久化，考虑升级或使用外部存储

3. **CORS设置**：
   - 确保 `FRONTEND_URL` 环境变量正确设置
   - 包含协议（https://）

4. **HTTPS**：
   - Railway和Render都自动提供HTTPS
   - 不需要额外配置

5. **环境变量安全**：
   - 不要在代码中硬编码密钥
   - 使用环境变量管理敏感信息

---

## 🐛 常见问题

### Q: 部署后无法访问？
A: 检查：
- 端口是否正确（Railway/Render会自动设置PORT）
- 健康检查端点是否正常：`/health`
- 查看部署日志

### Q: 数据库初始化失败？
A: 
- 检查 `data` 目录权限
- 查看日志中的错误信息
- 可能需要手动创建目录

### Q: CORS错误？
A: 
- 检查 `FRONTEND_URL` 环境变量是否正确
- 确保包含 `https://` 协议
- 检查前端是否正确配置了API地址

### Q: 如何查看日志？
A: 
- Railway: 在项目页面点击 "Deployments" -> 查看日志
- Render: 在服务页面有 "Logs" 标签

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

---

## 📚 参考资源

- Railway文档: https://docs.railway.app
- Render文档: https://render.com/docs
- Vercel环境变量: https://vercel.com/docs/concepts/projects/environment-variables



