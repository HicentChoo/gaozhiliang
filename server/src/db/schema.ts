import db from './database.js';

/**
 * 初始化数据库表结构
 */
export function initDatabase() {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nickname TEXT,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 数据源表
  db.exec(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )
  `);

  // 采集任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS collection_tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      nodes TEXT NOT NULL,
      edges TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      cron TEXT,
      cron_description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 数据集表
  db.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      format TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      data_usage TEXT NOT NULL,
      sample_count INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0,
      versions TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 数据集样本表
  db.exec(`
    CREATE TABLE IF NOT EXISTS dataset_samples (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    )
  `);

  // 标签模板表
  db.exec(`
    CREATE TABLE IF NOT EXISTS label_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      task_type TEXT NOT NULL,
      description TEXT,
      labels TEXT NOT NULL,
      config TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 标注项目表
  db.exec(`
    CREATE TABLE IF NOT EXISTS annotation_projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      dataset_id TEXT NOT NULL,
      dataset_version TEXT,
      task_type TEXT NOT NULL,
      label_template_id TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      owner_id TEXT NOT NULL,
      annotator_ids TEXT NOT NULL,
      reviewer_ids TEXT NOT NULL,
      total_tasks INTEGER NOT NULL DEFAULT 0,
      completed_tasks INTEGER NOT NULL DEFAULT 0,
      reviewing_tasks INTEGER NOT NULL DEFAULT 0,
      approved_tasks INTEGER NOT NULL DEFAULT 0,
      rejected_tasks INTEGER NOT NULL DEFAULT 0,
      config TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id),
      FOREIGN KEY (label_template_id) REFERENCES label_templates(id),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // 标注任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS annotation_tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      sample_id TEXT NOT NULL,
      assignee_id TEXT,
      reviewer_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      annotations TEXT NOT NULL DEFAULT '[]',
      review_comment TEXT,
      reviewed_at TEXT,
      reviewed_by TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES annotation_projects(id) ON DELETE CASCADE,
      FOREIGN KEY (sample_id) REFERENCES dataset_samples(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id),
      FOREIGN KEY (reviewer_id) REFERENCES users(id)
    )
  `);

  // 标注结果表
  db.exec(`
    CREATE TABLE IF NOT EXISTS annotation_results (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      annotator_id TEXT NOT NULL,
      labels TEXT NOT NULL,
      content TEXT,
      confidence REAL,
      duration INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES annotation_tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (annotator_id) REFERENCES users(id)
    )
  `);

  // 模型表
  db.exec(`
    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      api_key TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // 场景配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS scene_configs (
      id TEXT PRIMARY KEY,
      scene_name TEXT NOT NULL,
      model_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      system_prompt TEXT,
      temperature REAL,
      max_tokens INTEGER,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
    )
  `);

  // 增强任务表
  db.exec(`
    CREATE TABLE IF NOT EXISTS enhancement_tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dataset_id TEXT NOT NULL,
      scene_config_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      progress INTEGER,
      result_dataset_id TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id),
      FOREIGN KEY (scene_config_id) REFERENCES scene_configs(id)
    )
  `);

  console.log('数据库表结构初始化完成');
}

/**
 * 创建索引以提高查询性能
 */
export function createIndexes() {
  // 用户表索引
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

  // 标注相关索引
  db.exec(`CREATE INDEX IF NOT EXISTS idx_annotation_tasks_project_id ON annotation_tasks(project_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_annotation_tasks_assignee_id ON annotation_tasks(assignee_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_annotation_tasks_status ON annotation_tasks(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_annotation_results_task_id ON annotation_results(task_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_annotation_results_annotator_id ON annotation_results(annotator_id)`);

  // 数据集样本索引
  db.exec(`CREATE INDEX IF NOT EXISTS idx_dataset_samples_dataset_id ON dataset_samples(dataset_id)`);

  console.log('数据库索引创建完成');
}

/**
 * 初始化默认数据（创建管理员账户）
 */
export function initDefaultData() {
  // 使用动态导入（在需要时导入）
  import('bcryptjs').then((bcrypt) => {
    // 检查是否已有用户
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (userCount.count === 0) {
      // 创建默认管理员账户
      const passwordHash = bcrypt.hashSync('admin123', 10);
      const userId = '1';
      const now = new Date().toISOString();
      
      db.prepare(`
        INSERT INTO users (id, username, password_hash, email, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, 'admin', passwordHash, 'admin@example.com', 'admin', now, now);
      
      console.log('默认管理员账户创建完成: admin / admin123');
    }
  }).catch((err) => {
    console.error('初始化默认数据失败:', err);
  });
}

