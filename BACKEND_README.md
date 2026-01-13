# 后端开发指南

## 当前状态

后端API已创建，包含：

✅ **已完成**:
- 项目结构搭建
- 数据库schema设计（SQLite）
- 用户认证API（登录、注册、JWT）
- 数据源管理API
- CORS和中间件配置

⏳ **待实现**:
- 数据集管理API
- 标注项目管理API
- 工具箱API
- 前端API调用集成

## 快速启动后端

```bash
# 进入server目录
cd server

# 安装依赖
npm install

# 创建.env文件（复制.env.example并修改）
cp .env.example .env

# 初始化数据库
npm run db:init

# 启动开发服务器
npm run dev
```

服务器将在 `http://localhost:3001` 启动。

默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

## 集成前端

后端启动后，需要更新前端的API配置：

1. **更新API baseURL**（`src/api/index.ts`）：
   ```typescript
   const api = axios.create({
     baseURL: 'http://localhost:3001/api', // 开发环境
     // baseURL: '/api', // 生产环境（通过代理）
     timeout: 10000,
   });
   ```

2. **更新认证store**（`src/store/authStore.ts`）：
   - 将 `login` 函数改为调用真实API
   - 使用 `api.post('/auth/login', { username, password })`

3. **逐步迁移其他store**：
   - 数据源store
   - 数据集store
   - 标注store
   - 工具箱store

## 部署选项

### 方案1: Railway（推荐，简单）

1. 在 Railway 创建新项目
2. 连接GitHub，选择 `server` 目录
3. 设置环境变量
4. 自动部署

### 方案2: Render

类似Railway，也是免费的。

### 方案3: 自托管服务器

如果已有服务器，可以：
- 使用PM2管理进程
- 使用Nginx反向代理
- 配置SSL证书

## 下一步

1. 完成剩余API接口实现
2. 更新前端store以调用真实API
3. 部署后端到云平台
4. 配置前端代理或CORS
5. 测试完整流程

详见 `server/README.md` 获取更多信息。




