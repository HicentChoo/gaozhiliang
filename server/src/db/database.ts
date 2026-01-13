import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取数据库路径（从环境变量或默认路径）
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/database.db');

// 确保数据目录存在
const dbDir = dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

// 创建数据库连接
export const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// 启用 WAL 模式（提高并发性能）
db.pragma('journal_mode = WAL');

export default db;




