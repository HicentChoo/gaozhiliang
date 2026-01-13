# 高质量数据集管理服务平台 - 后端API

## 技术栈

- **运行时**: Node.js + TypeScript
- **Web框架**: Express
- **数据库**: SQLite (better-sqlite3)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs

## 项目结构

```
server/
├── src/
│   ├── db/              # 数据库相关
│   │   ├── database.ts  # 数据库连接
│   │   ├── schema.ts    # 数据库表结构
│   │   └── init.ts      # 初始化脚本
│   ├── routes/          # API路由
│   │   ├── auth.ts      # 认证相关（登录、注册）
│   │   ├── dataSources.ts # 数据源管理
│   │   └── ...
│   ├── middleware/      # 中间件
│   │   └── auth.ts      # JWT认证中间件
│   ├── utils/           # 工具函数
│   │   └── auth.ts      # 认证工具（JWT、密码加密）
│   ├── types/           # 类型定义
│   │   └── index.ts     # 共享类型
│   └── index.ts         # 入口文件
├── data/                # 数据库文件目录（自动创建）
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/database.db
FRONTEND_URL=http://localhost:5173
```

### 3. 初始化数据库

```bash
npm run db:init
```

这将创建所有数据库表并创建默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动

### 5. 构建生产版本

```bash
npm run build
npm start
```

## API接口文档

### 认证接口

#### POST /api/auth/login
用户登录

**请求体:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/register
用户注册

**请求体:**
```json
{
  "username": "user1",
  "password": "password123",
  "email": "user1@example.com",
  "nickname": "用户1"
}
```

#### GET /api/auth/me
获取当前用户信息（需要认证）

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /api/auth/profile
更新用户信息（需要认证）

#### PUT /api/auth/password
修改密码（需要认证）

### 数据源接口

#### GET /api/data-sources
获取数据源列表（需要认证）

#### POST /api/data-sources
创建数据源（需要认证）

#### PUT /api/data-sources/:id
更新数据源（需要认证）

#### DELETE /api/data-sources/:id
删除数据源（需要认证）

### 采集任务接口

#### GET /api/collection-tasks
获取采集任务列表（需要认证）

#### POST /api/collection-tasks
创建采集任务（需要认证）

#### PUT /api/collection-tasks/:id
更新采集任务（需要认证）

#### DELETE /api/collection-tasks/:id
删除采集任务（需要认证）

### 数据集接口

#### GET /api/datasets
获取数据集列表（需要认证）

#### POST /api/datasets
创建数据集（需要认证）

#### PUT /api/datasets/:id
更新数据集（需要认证）

#### DELETE /api/datasets/:id
删除数据集（需要认证）

#### POST /api/datasets/:id/versions
添加数据集版本（需要认证）

#### GET /api/datasets/:id/samples
获取数据集样本列表（需要认证，支持分页）

#### POST /api/datasets/:id/samples
添加数据集样本（需要认证）

### 标签模板接口

#### GET /api/label-templates
获取标签模板列表（需要认证，支持按taskType过滤）

#### POST /api/label-templates
创建标签模板（需要认证）

#### PUT /api/label-templates/:id
更新标签模板（需要认证）

#### DELETE /api/label-templates/:id
删除标签模板（需要认证）

### 标注项目接口

#### GET /api/annotation-projects
获取标注项目列表（需要认证）

#### POST /api/annotation-projects
创建标注项目（需要认证）

#### PUT /api/annotation-projects/:id
更新标注项目（需要认证）

#### DELETE /api/annotation-projects/:id
删除标注项目（需要认证）

#### GET /api/annotation-projects/:id/tasks
获取项目的标注任务列表（需要认证）

### 标注任务接口

#### GET /api/annotation-tasks
获取标注任务列表（需要认证，支持过滤：projectId, status, assigneeId, reviewerId）

#### POST /api/annotation-tasks
创建标注任务（需要认证）

#### PUT /api/annotation-tasks/:id
更新标注任务（需要认证）

#### DELETE /api/annotation-tasks/:id
删除标注任务（需要认证）

#### POST /api/annotation-tasks/:id/results
提交标注结果（需要认证）

#### GET /api/annotation-tasks/:id/results
获取任务的标注结果列表（需要认证）

### 模型接口

#### GET /api/models
获取模型列表（需要认证）

#### POST /api/models
创建模型（需要认证）

#### PUT /api/models/:id
更新模型（需要认证）

#### DELETE /api/models/:id
删除模型（需要认证）

### 场景配置接口

#### GET /api/scene-configs
获取场景配置列表（需要认证，支持按modelId过滤）

#### POST /api/scene-configs
创建场景配置（需要认证）

#### PUT /api/scene-configs/:id
更新场景配置（需要认证）

#### DELETE /api/scene-configs/:id
删除场景配置（需要认证）

### 增强任务接口

#### GET /api/enhancement-tasks
获取增强任务列表（需要认证，支持过滤：status, datasetId）

#### POST /api/enhancement-tasks
创建增强任务（需要认证）

#### PUT /api/enhancement-tasks/:id
更新增强任务（需要认证）

#### DELETE /api/enhancement-tasks/:id
删除增强任务（需要认证）

## 数据库设计

### 主要数据表

- **users**: 用户表
- **data_sources**: 数据源表
- **collection_tasks**: 采集任务表
- **datasets**: 数据集表
- **dataset_samples**: 数据集样本表
- **label_templates**: 标签模板表
- **annotation_projects**: 标注项目表
- **annotation_tasks**: 标注任务表
- **annotation_results**: 标注结果表
- **models**: 模型表
- **scene_configs**: 场景配置表
- **enhancement_tasks**: 增强任务表

## 部署

### Railway部署

1. 在 [Railway](https://railway.app) 创建新项目
2. 连接GitHub仓库
3. 设置根目录为 `server`
4. 设置环境变量（参考 `.env.example`）
5. 设置构建命令: `npm run build`
6. 设置启动命令: `npm start`
7. Railway会自动部署

### Render部署

1. 在 [Render](https://render.com) 创建新Web Service
2. 连接GitHub仓库
3. 设置根目录为 `server`
4. 设置构建命令: `npm run build`
5. 设置启动命令: `npm start`
6. 设置环境变量
7. Render会自动部署

### 本地部署

```bash
# 构建
npm run build

# 运行
npm start
```

## 注意事项

1. **JWT密钥**: 生产环境请使用强随机字符串作为JWT_SECRET
2. **数据库备份**: SQLite数据库文件位于 `data/database.db`，请定期备份
3. **CORS配置**: 确保FRONTEND_URL环境变量指向正确的前端地址
4. **性能优化**: SQLite适合小到中型应用，如需更高性能可考虑迁移到PostgreSQL

## 开发计划

当前已实现：
- ✅ 用户认证（登录、注册、JWT）
- ✅ 数据源管理API
- ✅ 采集任务管理API
- ✅ 数据集管理API
- ✅ 标签模板管理API
- ✅ 标注项目管理API
- ✅ 标注任务管理API
- ✅ 模型管理API
- ✅ 场景配置管理API
- ✅ 增强任务管理API

所有核心API已实现完成！🎉

## 后续优化建议

- [ ] 添加数据验证（使用zod等库）
- [ ] 添加日志系统
- [ ] 添加单元测试
- [ ] 添加API文档（Swagger/OpenAPI）
- [ ] 性能优化（数据库查询优化）
- [ ] 添加缓存层（Redis）
- [ ] 添加文件上传功能
- [ ] 迁移到PostgreSQL（如需更高性能）

