import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db/database.js';
import { initDatabase, createIndexes, initDefaultData } from './db/schema.js';

// 导入路由
import authRoutes from './routes/auth.js';
import dataSourceRoutes from './routes/dataSources.js';
import collectionTaskRoutes from './routes/collectionTasks.js';
import datasetRoutes from './routes/datasets.js';
import labelTemplateRoutes from './routes/labelTemplates.js';
import annotationProjectRoutes from './routes/annotationProjects.js';
import annotationTaskRoutes from './routes/annotationTasks.js';
import modelRoutes from './routes/models.js';
import sceneConfigRoutes from './routes/sceneConfigs.js';
import enhancementTaskRoutes from './routes/enhancementTasks.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 中间件
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据库
try {
  initDatabase();
  createIndexes();
  initDefaultData();
} catch (error) {
  console.error('数据库初始化失败:', error);
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/data-sources', dataSourceRoutes);
app.use('/api/collection-tasks', collectionTaskRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/label-templates', labelTemplateRoutes);
app.use('/api/annotation-projects', annotationProjectRoutes);
app.use('/api/annotation-tasks', annotationTaskRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/scene-configs', sceneConfigRoutes);
app.use('/api/enhancement-tasks', enhancementTaskRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`前端URL: ${FRONTEND_URL}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n正在关闭服务器...');
  db.close();
  process.exit(0);
});

