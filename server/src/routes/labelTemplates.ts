import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/label-templates
 * 获取标签模板列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { taskType } = req.query;
    let query = 'SELECT * FROM label_templates';
    const params: any[] = [];

    if (taskType) {
      query += ' WHERE task_type = ?';
      params.push(taskType);
    }

    query += ' ORDER BY created_at DESC';

    const templates = db.prepare(query).all(...params) as any[];

    const formattedTemplates = templates.map((template) => ({
      id: template.id,
      name: template.name,
      taskType: template.task_type,
      description: template.description,
      labels: JSON.parse(template.labels),
      config: JSON.parse(template.config),
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    }));

    res.json({ data: formattedTemplates });
  } catch (error) {
    console.error('获取标签模板列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/label-templates/:id
 * 获取标签模板详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = db.prepare('SELECT * FROM label_templates WHERE id = ?').get(id) as any;

    if (!template) {
      return res.status(404).json({ error: '标签模板不存在' });
    }

    res.json({
      id: template.id,
      name: template.name,
      taskType: template.task_type,
      description: template.description,
      labels: JSON.parse(template.labels),
      config: JSON.parse(template.config),
      createdAt: template.created_at,
      updatedAt: template.updated_at,
    });
  } catch (error) {
    console.error('获取标签模板详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/label-templates
 * 创建标签模板
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, taskType, description, labels, config } = req.body;

    if (!name || !taskType || !labels) {
      return res.status(400).json({ error: '名称、任务类型和标签不能为空' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO label_templates (id, name, task_type, description, labels, config, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      taskType,
      description || null,
      JSON.stringify(labels),
      JSON.stringify(config || {}),
      now,
      now
    );

    res.status(201).json({
      id,
      name,
      taskType,
      description: description || null,
      labels,
      config: config || {},
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建标签模板错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/label-templates/:id
 * 更新标签模板
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, taskType, description, labels, config } = req.body;

    // 检查模板是否存在
    const existing = db.prepare('SELECT id FROM label_templates WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '标签模板不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (taskType !== undefined) {
      updateFields.push('task_type = ?');
      updateValues.push(taskType);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (labels !== undefined) {
      updateFields.push('labels = ?');
      updateValues.push(JSON.stringify(labels));
    }
    if (config !== undefined) {
      updateFields.push('config = ?');
      updateValues.push(JSON.stringify(config));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE label_templates SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM label_templates WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      taskType: updated.task_type,
      description: updated.description,
      labels: JSON.parse(updated.labels),
      config: JSON.parse(updated.config),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新标签模板错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/label-templates/:id
 * 删除标签模板
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM label_templates WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '标签模板不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除标签模板错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




