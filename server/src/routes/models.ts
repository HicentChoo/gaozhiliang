import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/models
 * 获取模型列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const models = db.prepare('SELECT * FROM models ORDER BY created_at DESC').all() as any[];

    const formattedModels = models.map((model) => ({
      id: model.id,
      name: model.name,
      model: model.model,
      apiKey: model.api_key,
      endpoint: model.endpoint,
      description: model.description,
      isActive: model.is_active === 1,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
    }));

    res.json({ data: formattedModels });
  } catch (error) {
    console.error('获取模型列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/models/:id
 * 获取模型详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as any;

    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    res.json({
      id: model.id,
      name: model.name,
      model: model.model,
      apiKey: model.api_key,
      endpoint: model.endpoint,
      description: model.description,
      isActive: model.is_active === 1,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
    });
  } catch (error) {
    console.error('获取模型详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/models
 * 创建模型
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, model, apiKey, endpoint, description, isActive } = req.body;

    if (!name || !model || !apiKey || !endpoint) {
      return res.status(400).json({ error: '名称、模型、API Key和端点不能为空' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO models (id, name, model, api_key, endpoint, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      model,
      apiKey,
      endpoint,
      description || null,
      isActive ? 1 : 0,
      now,
      now
    );

    res.status(201).json({
      id,
      name,
      model,
      apiKey,
      endpoint,
      description: description || null,
      isActive: isActive || false,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建模型错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/models/:id
 * 更新模型
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, model, apiKey, endpoint, description, isActive } = req.body;

    // 检查模型是否存在
    const existing = db.prepare('SELECT id FROM models WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '模型不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (model !== undefined) {
      updateFields.push('model = ?');
      updateValues.push(model);
    }
    if (apiKey !== undefined) {
      updateFields.push('api_key = ?');
      updateValues.push(apiKey);
    }
    if (endpoint !== undefined) {
      updateFields.push('endpoint = ?');
      updateValues.push(endpoint);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(isActive ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE models SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM models WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      model: updated.model,
      apiKey: updated.api_key,
      endpoint: updated.endpoint,
      description: updated.description,
      isActive: updated.is_active === 1,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新模型错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/models/:id
 * 删除模型
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM models WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '模型不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除模型错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




