import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/collection-tasks
 * 获取采集任务列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const tasks = db.prepare('SELECT * FROM collection_tasks ORDER BY created_at DESC').all() as any[];

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      nodes: JSON.parse(task.nodes),
      edges: JSON.parse(task.edges),
      status: task.status,
      cron: task.cron,
      cronDescription: task.cron_description,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));

    res.json({ data: formattedTasks });
  } catch (error) {
    console.error('获取采集任务列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/collection-tasks/:id
 * 获取采集任务详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM collection_tasks WHERE id = ?').get(id) as any;

    if (!task) {
      return res.status(404).json({ error: '采集任务不存在' });
    }

    res.json({
      id: task.id,
      name: task.name,
      description: task.description,
      nodes: JSON.parse(task.nodes),
      edges: JSON.parse(task.edges),
      status: task.status,
      cron: task.cron,
      cronDescription: task.cron_description,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    console.error('获取采集任务详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/collection-tasks
 * 创建采集任务
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, nodes, edges, status, cron, cronDescription } = req.body;

    if (!name) {
      return res.status(400).json({ error: '任务名称不能为空' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO collection_tasks (id, name, description, nodes, edges, status, cron, cron_description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      description || null,
      JSON.stringify(nodes || []),
      JSON.stringify(edges || []),
      status || 'draft',
      cron || null,
      cronDescription || null,
      now,
      now
    );

    res.status(201).json({
      id,
      name,
      description: description || null,
      nodes: nodes || [],
      edges: edges || [],
      status: status || 'draft',
      cron: cron || null,
      cronDescription: cronDescription || null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建采集任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/collection-tasks/:id
 * 更新采集任务
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, nodes, edges, status, cron, cronDescription } = req.body;

    // 检查任务是否存在
    const existing = db.prepare('SELECT id FROM collection_tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '采集任务不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (nodes !== undefined) {
      updateFields.push('nodes = ?');
      updateValues.push(JSON.stringify(nodes));
    }
    if (edges !== undefined) {
      updateFields.push('edges = ?');
      updateValues.push(JSON.stringify(edges));
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (cron !== undefined) {
      updateFields.push('cron = ?');
      updateValues.push(cron);
    }
    if (cronDescription !== undefined) {
      updateFields.push('cron_description = ?');
      updateValues.push(cronDescription);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE collection_tasks SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM collection_tasks WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      nodes: JSON.parse(updated.nodes),
      edges: JSON.parse(updated.edges),
      status: updated.status,
      cron: updated.cron,
      cronDescription: updated.cron_description,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新采集任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/collection-tasks/:id
 * 删除采集任务
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM collection_tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '采集任务不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除采集任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




