import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/data-sources
 * 获取数据源列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const sources = db.prepare('SELECT * FROM data_sources ORDER BY created_at DESC').all() as any[];

    const formattedSources = sources.map((source) => ({
      id: source.id,
      name: source.name,
      type: source.type,
      config: JSON.parse(source.config),
      createdAt: source.created_at,
      updatedAt: source.updated_at,
    }));

    res.json({ data: formattedSources });
  } catch (error) {
    console.error('获取数据源列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/data-sources/:id
 * 获取数据源详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const source = db.prepare('SELECT * FROM data_sources WHERE id = ?').get(id) as any;

    if (!source) {
      return res.status(404).json({ error: '数据源不存在' });
    }

    res.json({
      id: source.id,
      name: source.name,
      type: source.type,
      config: JSON.parse(source.config),
      createdAt: source.created_at,
      updatedAt: source.updated_at,
    });
  } catch (error) {
    console.error('获取数据源详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/data-sources
 * 创建数据源
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, config } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: '名称和类型不能为空' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO data_sources (id, name, type, config, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, type, JSON.stringify(config || {}), now);

    res.status(201).json({
      id,
      name,
      type,
      config: config || {},
      createdAt: now,
    });
  } catch (error) {
    console.error('创建数据源错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/data-sources/:id
 * 更新数据源
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, config } = req.body;

    // 检查数据源是否存在
    const existing = db.prepare('SELECT id FROM data_sources WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '数据源不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (type !== undefined) {
      updateFields.push('type = ?');
      updateValues.push(type);
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

    db.prepare(`UPDATE data_sources SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM data_sources WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      config: JSON.parse(updated.config),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新数据源错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/data-sources/:id
 * 删除数据源
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM data_sources WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '数据源不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除数据源错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




