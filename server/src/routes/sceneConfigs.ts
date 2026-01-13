import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/scene-configs
 * 获取场景配置列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { modelId } = req.query;
    let query = 'SELECT * FROM scene_configs';
    const params: any[] = [];

    if (modelId) {
      query += ' WHERE model_id = ?';
      params.push(modelId);
    }

    query += ' ORDER BY created_at DESC';

    const configs = db.prepare(query).all(...params) as any[];

    const formattedConfigs = configs.map((config) => ({
      id: config.id,
      sceneName: config.scene_name,
      modelId: config.model_id,
      prompt: config.prompt,
      systemPrompt: config.system_prompt,
      temperature: config.temperature,
      maxTokens: config.max_tokens,
      description: config.description,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    }));

    res.json({ data: formattedConfigs });
  } catch (error) {
    console.error('获取场景配置列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/scene-configs/:id
 * 获取场景配置详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = db.prepare('SELECT * FROM scene_configs WHERE id = ?').get(id) as any;

    if (!config) {
      return res.status(404).json({ error: '场景配置不存在' });
    }

    res.json({
      id: config.id,
      sceneName: config.scene_name,
      modelId: config.model_id,
      prompt: config.prompt,
      systemPrompt: config.system_prompt,
      temperature: config.temperature,
      maxTokens: config.max_tokens,
      description: config.description,
      createdAt: config.created_at,
      updatedAt: config.updated_at,
    });
  } catch (error) {
    console.error('获取场景配置详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/scene-configs
 * 创建场景配置
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { sceneName, modelId, prompt, systemPrompt, temperature, maxTokens, description } = req.body;

    if (!sceneName || !modelId || !prompt) {
      return res.status(400).json({ error: '场景名称、模型ID和提示词不能为空' });
    }

    // 检查模型是否存在
    const model = db.prepare('SELECT id FROM models WHERE id = ?').get(modelId);
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO scene_configs (id, scene_name, model_id, prompt, system_prompt, temperature, max_tokens, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      sceneName,
      modelId,
      prompt,
      systemPrompt || null,
      temperature || null,
      maxTokens || null,
      description || null,
      now,
      now
    );

    res.status(201).json({
      id,
      sceneName,
      modelId,
      prompt,
      systemPrompt: systemPrompt || null,
      temperature: temperature || null,
      maxTokens: maxTokens || null,
      description: description || null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建场景配置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/scene-configs/:id
 * 更新场景配置
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sceneName, modelId, prompt, systemPrompt, temperature, maxTokens, description } = req.body;

    // 检查配置是否存在
    const existing = db.prepare('SELECT id FROM scene_configs WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '场景配置不存在' });
    }

    // 如果更新模型ID，检查模型是否存在
    if (modelId) {
      const model = db.prepare('SELECT id FROM models WHERE id = ?').get(modelId);
      if (!model) {
        return res.status(404).json({ error: '模型不存在' });
      }
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (sceneName !== undefined) {
      updateFields.push('scene_name = ?');
      updateValues.push(sceneName);
    }
    if (modelId !== undefined) {
      updateFields.push('model_id = ?');
      updateValues.push(modelId);
    }
    if (prompt !== undefined) {
      updateFields.push('prompt = ?');
      updateValues.push(prompt);
    }
    if (systemPrompt !== undefined) {
      updateFields.push('system_prompt = ?');
      updateValues.push(systemPrompt);
    }
    if (temperature !== undefined) {
      updateFields.push('temperature = ?');
      updateValues.push(temperature);
    }
    if (maxTokens !== undefined) {
      updateFields.push('max_tokens = ?');
      updateValues.push(maxTokens);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE scene_configs SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM scene_configs WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      sceneName: updated.scene_name,
      modelId: updated.model_id,
      prompt: updated.prompt,
      systemPrompt: updated.system_prompt,
      temperature: updated.temperature,
      maxTokens: updated.max_tokens,
      description: updated.description,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新场景配置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/scene-configs/:id
 * 删除场景配置
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM scene_configs WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '场景配置不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除场景配置错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




