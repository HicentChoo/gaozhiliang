import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/enhancement-tasks
 * 获取增强任务列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, datasetId } = req.query;
    let query = 'SELECT * FROM enhancement_tasks';
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (datasetId) {
      conditions.push('dataset_id = ?');
      params.push(datasetId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params) as any[];

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      name: task.name,
      datasetId: task.dataset_id,
      sceneConfigId: task.scene_config_id,
      status: task.status,
      progress: task.progress,
      resultDatasetId: task.result_dataset_id,
      errorMessage: task.error_message,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));

    res.json({ data: formattedTasks });
  } catch (error) {
    console.error('获取增强任务列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/enhancement-tasks/:id
 * 获取增强任务详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM enhancement_tasks WHERE id = ?').get(id) as any;

    if (!task) {
      return res.status(404).json({ error: '增强任务不存在' });
    }

    res.json({
      id: task.id,
      name: task.name,
      datasetId: task.dataset_id,
      sceneConfigId: task.scene_config_id,
      status: task.status,
      progress: task.progress,
      resultDatasetId: task.result_dataset_id,
      errorMessage: task.error_message,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    console.error('获取增强任务详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/enhancement-tasks
 * 创建增强任务
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, datasetId, sceneConfigId } = req.body;

    if (!name || !datasetId || !sceneConfigId) {
      return res.status(400).json({ error: '名称、数据集ID和场景配置ID不能为空' });
    }

    // 检查数据集是否存在
    const dataset = db.prepare('SELECT id FROM datasets WHERE id = ?').get(datasetId);
    if (!dataset) {
      return res.status(404).json({ error: '数据集不存在' });
    }

    // 检查场景配置是否存在
    const sceneConfig = db.prepare('SELECT id FROM scene_configs WHERE id = ?').get(sceneConfigId);
    if (!sceneConfig) {
      return res.status(404).json({ error: '场景配置不存在' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO enhancement_tasks (id, name, dataset_id, scene_config_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      datasetId,
      sceneConfigId,
      'draft',
      now,
      now
    );

    res.status(201).json({
      id,
      name,
      datasetId,
      sceneConfigId,
      status: 'draft',
      progress: null,
      resultDatasetId: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建增强任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/enhancement-tasks/:id
 * 更新增强任务
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, datasetId, sceneConfigId, status, progress, resultDatasetId, errorMessage } = req.body;

    // 检查任务是否存在
    const existing = db.prepare('SELECT id FROM enhancement_tasks WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '增强任务不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (datasetId !== undefined) {
      updateFields.push('dataset_id = ?');
      updateValues.push(datasetId);
    }
    if (sceneConfigId !== undefined) {
      updateFields.push('scene_config_id = ?');
      updateValues.push(sceneConfigId);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    if (progress !== undefined) {
      updateFields.push('progress = ?');
      updateValues.push(progress);
    }
    if (resultDatasetId !== undefined) {
      updateFields.push('result_dataset_id = ?');
      updateValues.push(resultDatasetId);
    }
    if (errorMessage !== undefined) {
      updateFields.push('error_message = ?');
      updateValues.push(errorMessage);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE enhancement_tasks SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM enhancement_tasks WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      datasetId: updated.dataset_id,
      sceneConfigId: updated.scene_config_id,
      status: updated.status,
      progress: updated.progress,
      resultDatasetId: updated.result_dataset_id,
      errorMessage: updated.error_message,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新增强任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/enhancement-tasks/:id
 * 删除增强任务
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM enhancement_tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '增强任务不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除增强任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;

