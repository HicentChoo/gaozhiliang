# 前端API集成指南

## 当前状态

✅ **已完成**:
- API配置（`src/api/index.ts`）- 支持环境变量配置baseURL
- 认证Store（`src/store/authStore.ts`）- 已连接到真实后端API

⏳ **待迁移**:
- 数据源Store（`src/store/dataStore.ts`）
- 标注Store（`src/store/annotationStore.ts`）
- 工具箱Store（`src/store/toolboxStore.ts`）
- 增强Store（`src/store/enhancementStore.ts`）

## 环境配置

### 开发环境

1. 在项目根目录创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

2. 确保后端服务器正在运行（`cd server && npm run dev`）

### 生产环境

生产环境可以通过以下方式配置：

**方式1：使用环境变量**
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

**方式2：使用代理（Vite配置）**
在 `vite.config.ts` 中添加代理配置。

## 认证功能测试

认证功能已经连接到后端，可以立即测试：

1. 启动后端服务器：
```bash
cd server
npm install
npm run db:init
npm run dev
```

2. 启动前端：
```bash
npm run dev
```

3. 测试登录：
   - 用户名: `admin`
   - 密码: `admin123`

## 逐步迁移Store

### 迁移策略

为了降低风险，建议按以下顺序逐步迁移：

1. **数据源Store**（最简单）
2. **数据集Store**
3. **标注Store**（最复杂）
4. **工具箱Store**
5. **增强Store**

### 迁移步骤示例（以数据源Store为例）

1. **创建API函数**（已创建 `src/store/dataStore.api.ts`）

2. **更新Store**，在 `src/store/dataStore.ts` 中：

```typescript
import { dataSourceApi } from './dataStore.api';

export const useDataStore = create<DataState>((set, get) => ({
  dataSources: [],
  // ... 其他初始状态
  
  // 添加加载函数
  loadDataSources: async () => {
    try {
      const data = await dataSourceApi.getAll();
      set({ dataSources: data });
    } catch (error) {
      console.error('加载数据源失败:', error);
    }
  },
  
  // 更新addDataSource函数
  addDataSource: async (source) => {
    try {
      const newSource = await dataSourceApi.create(source);
      set((state) => ({
        dataSources: [...state.dataSources, newSource],
      }));
    } catch (error) {
      console.error('创建数据源失败:', error);
      throw error;
    }
  },
  
  // 类似地更新其他函数...
}));
```

3. **在组件中使用**：

```typescript
const { dataSources, loadDataSources, addDataSource } = useDataStore();

useEffect(() => {
  loadDataSources(); // 组件加载时获取数据
}, []);
```

### 快速迁移方案（可选）

如果想快速切换到API，但保留mock数据作为fallback：

```typescript
const USE_API = import.meta.env.VITE_USE_API === 'true';

export const useDataStore = create<DataState>((set) => ({
  dataSources: USE_API ? [] : mockDataSources,
  
  addDataSource: async (source) => {
    if (USE_API) {
      try {
        const newSource = await dataSourceApi.create(source);
        set((state) => ({
          dataSources: [...state.dataSources, newSource],
        }));
      } catch (error) {
        console.error('创建失败:', error);
        throw error;
      }
    } else {
      // 使用原来的mock逻辑
      // ...
    }
  },
}));
```

## API端点对照表

| 前端Store | 后端API端点 | 状态 |
|----------|------------|------|
| authStore | `/api/auth/*` | ✅ 已连接 |
| dataStore (dataSources) | `/api/data-sources` | ⏳ 待迁移 |
| dataStore (collectionTasks) | `/api/collection-tasks` | ⏳ 待迁移 |
| dataStore (datasets) | `/api/datasets` | ⏳ 待迁移 |
| annotationStore (projects) | `/api/annotation-projects` | ⏳ 待迁移 |
| annotationStore (tasks) | `/api/annotation-tasks` | ⏳ 待迁移 |
| annotationStore (templates) | `/api/label-templates` | ⏳ 待迁移 |
| toolboxStore (models) | `/api/models` | ⏳ 待迁移 |
| toolboxStore (sceneConfigs) | `/api/scene-configs` | ⏳ 待迁移 |
| enhancementStore | `/api/enhancement-tasks` | ⏳ 待迁移 |

## 注意事项

1. **认证Token**: 所有API请求都会自动携带JWT token（通过axios拦截器）

2. **错误处理**: API调用失败时会触发错误处理，401错误会自动跳转到登录页

3. **数据格式**: 确保前端发送的数据格式与后端API期望的格式一致

4. **异步操作**: Store中的API调用都是异步的，需要使用`async/await`或`.then()`

5. **状态同步**: 调用API后记得更新本地state

## 测试建议

1. 先测试认证功能（登录、注册）
2. 测试一个简单的CRUD操作（如数据源管理）
3. 逐步迁移其他模块
4. 测试完整的业务流程

## 需要帮助？

如果遇到问题：
1. 检查后端服务器是否运行
2. 检查网络请求（浏览器开发者工具）
3. 查看后端日志
4. 确认API端点路径正确




