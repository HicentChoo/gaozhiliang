import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/datasets
 * 获取数据集列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const datasets = db.prepare('SELECT * FROM datasets ORDER BY created_at DESC').all() as any[];

    const formattedDatasets = datasets.map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      type: dataset.type,
      format: dataset.format,
      sourceType: dataset.source_type,
      sourceId: dataset.source_id,
      dataUsage: dataset.data_usage,
      sampleCount: dataset.sample_count,
      isPublished: dataset.is_published === 1,
      versions: JSON.parse(dataset.versions),
      createdAt: dataset.created_at,
      updatedAt: dataset.updated_at,
    }));

    res.json({ data: formattedDatasets });
  } catch (error) {
    console.error('获取数据集列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/datasets/:id
 * 获取数据集详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(id) as any;

    if (!dataset) {
      return res.status(404).json({ error: '数据集不存在' });
    }

    res.json({
      id: dataset.id,
      name: dataset.name,
      type: dataset.type,
      format: dataset.format,
      sourceType: dataset.source_type,
      sourceId: dataset.source_id,
      dataUsage: dataset.data_usage,
      sampleCount: dataset.sample_count,
      isPublished: dataset.is_published === 1,
      versions: JSON.parse(dataset.versions),
      createdAt: dataset.created_at,
      updatedAt: dataset.updated_at,
    });
  } catch (error) {
    console.error('获取数据集详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/datasets
 * 创建数据集
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, format, sourceType, sourceId, dataUsage, versions, isPublished } = req.body;

    if (!name || !type || !format || !sourceType || !sourceId) {
      return res.status(400).json({ error: '必填字段不能为空' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();
    const sampleCount = 0;
    const versionsArray = versions || [];

    db.prepare(`
      INSERT INTO datasets (id, name, type, format, source_type, source_id, data_usage, sample_count, is_published, versions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      type,
      format,
      sourceType,
      sourceId,
      dataUsage || '',
      sampleCount,
      isPublished ? 1 : 0,
      JSON.stringify(versionsArray),
      now,
      now
    );

    res.status(201).json({
      id,
      name,
      type,
      format,
      sourceType,
      sourceId,
      dataUsage: dataUsage || '',
      sampleCount,
      isPublished: isPublished || false,
      versions: versionsArray,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建数据集错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/datasets/:id
 * 更新数据集
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, format, sourceType, sourceId, dataUsage, sampleCount, isPublished, versions } = req.body;

    // 检查数据集是否存在
    const existing = db.prepare('SELECT id FROM datasets WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '数据集不存在' });
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
    if (format !== undefined) {
      updateFields.push('format = ?');
      updateValues.push(format);
    }
    if (sourceType !== undefined) {
      updateFields.push('source_type = ?');
      updateValues.push(sourceType);
    }
    if (sourceId !== undefined) {
      updateFields.push('source_id = ?');
      updateValues.push(sourceId);
    }
    if (dataUsage !== undefined) {
      updateFields.push('data_usage = ?');
      updateValues.push(dataUsage);
    }
    if (sampleCount !== undefined) {
      updateFields.push('sample_count = ?');
      updateValues.push(sampleCount);
    }
    if (isPublished !== undefined) {
      updateFields.push('is_published = ?');
      updateValues.push(isPublished ? 1 : 0);
    }
    if (versions !== undefined) {
      updateFields.push('versions = ?');
      updateValues.push(JSON.stringify(versions));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE datasets SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM datasets WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      format: updated.format,
      sourceType: updated.source_type,
      sourceId: updated.source_id,
      dataUsage: updated.data_usage,
      sampleCount: updated.sample_count,
      isPublished: updated.is_published === 1,
      versions: JSON.parse(updated.versions),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新数据集错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/datasets/:id
 * 删除数据集
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM datasets WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '数据集不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除数据集错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/datasets/:id/versions
 * 添加数据集版本
 */
router.post('/:id/versions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { version } = req.body;

    if (!version || !version.version) {
      return res.status(400).json({ error: '版本信息不能为空' });
    }

    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(id) as any;
    if (!dataset) {
      return res.status(404).json({ error: '数据集不存在' });
    }

    const versions = JSON.parse(dataset.versions);
    const newVersion = {
      ...version,
      createdAt: version.createdAt || new Date().toISOString(),
    };
    versions.push(newVersion);

    const now = new Date().toISOString();
    db.prepare('UPDATE datasets SET versions = ?, updated_at = ? WHERE id = ?').run(
      JSON.stringify(versions),
      now,
      id
    );

    res.status(201).json({ version: newVersion });
  } catch (error) {
    console.error('添加数据集版本错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/datasets/:id/samples
 * 获取数据集样本列表
 */
router.get('/:id/samples', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const samples = db
      .prepare('SELECT * FROM dataset_samples WHERE dataset_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .all(id, limit, offset) as any[];

    const total = db.prepare('SELECT COUNT(*) as count FROM dataset_samples WHERE dataset_id = ?').get(id) as { count: number };

    const formattedSamples = samples.map((sample) => ({
      id: sample.id,
      content: JSON.parse(sample.content),
      createdAt: sample.created_at,
    }));

    res.json({
      data: formattedSamples,
      total: total.count,
      page: Number(page),
      pageSize: limit,
    });
  } catch (error) {
    console.error('获取数据集样本错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/datasets/:id/samples
 * 添加数据集样本
 */
router.post('/:id/samples', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: '样本内容不能为空' });
    }

    // 检查数据集是否存在
    const dataset = db.prepare('SELECT id FROM datasets WHERE id = ?').get(id);
    if (!dataset) {
      return res.status(404).json({ error: '数据集不存在' });
    }

    const sampleId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    db.prepare('INSERT INTO dataset_samples (id, dataset_id, content, created_at) VALUES (?, ?, ?, ?)').run(
      sampleId,
      id,
      JSON.stringify(content),
      now
    );

    // 更新数据集的样本数量
    const sampleCount = db.prepare('SELECT COUNT(*) as count FROM dataset_samples WHERE dataset_id = ?').get(id) as { count: number };
    db.prepare('UPDATE datasets SET sample_count = ? WHERE id = ?').run(sampleCount.count, id);

    res.status(201).json({
      id: sampleId,
      content,
      createdAt: now,
    });
  } catch (error) {
    console.error('添加数据集样本错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




