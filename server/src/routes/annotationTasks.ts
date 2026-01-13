import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/annotation-tasks
 * 获取标注任务列表（支持过滤）
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { projectId, status, assigneeId, reviewerId } = req.query;
    const userId = req.user!.userId;

    let query = 'SELECT * FROM annotation_tasks WHERE 1=1';
    const params: any[] = [];

    if (projectId) {
      query += ' AND project_id = ?';
      params.push(projectId);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (assigneeId) {
      query += ' AND assignee_id = ?';
      params.push(assigneeId);
    } else if (assigneeId === 'me') {
      query += ' AND assignee_id = ?';
      params.push(userId);
    }
    if (reviewerId) {
      query += ' AND reviewer_id = ?';
      params.push(reviewerId);
    } else if (reviewerId === 'me') {
      query += ' AND reviewer_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    const tasks = db.prepare(query).all(...params) as any[];

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      projectId: task.project_id,
      sampleId: task.sample_id,
      assigneeId: task.assignee_id,
      reviewerId: task.reviewer_id,
      status: task.status,
      annotations: JSON.parse(task.annotations),
      reviewComment: task.review_comment,
      reviewedAt: task.reviewed_at,
      reviewedBy: task.reviewed_by,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));

    res.json({ data: formattedTasks });
  } catch (error) {
    console.error('获取标注任务列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/annotation-tasks/:id
 * 获取标注任务详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM annotation_tasks WHERE id = ?').get(id) as any;

    if (!task) {
      return res.status(404).json({ error: '标注任务不存在' });
    }

    res.json({
      id: task.id,
      projectId: task.project_id,
      sampleId: task.sample_id,
      assigneeId: task.assignee_id,
      reviewerId: task.reviewer_id,
      status: task.status,
      annotations: JSON.parse(task.annotations),
      reviewComment: task.review_comment,
      reviewedAt: task.reviewed_at,
      reviewedBy: task.reviewed_by,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    console.error('获取标注任务详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/annotation-tasks
 * 创建标注任务
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { projectId, sampleId, assigneeId, reviewerId } = req.body;

    if (!projectId || !sampleId) {
      return res.status(400).json({ error: '项目ID和样本ID不能为空' });
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO annotation_tasks (id, project_id, sample_id, assignee_id, reviewer_id, status, annotations, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      projectId,
      sampleId,
      assigneeId || null,
      reviewerId || null,
      'pending',
      '[]',
      now,
      now
    );

    // 更新项目的任务统计
    const project = db.prepare('SELECT total_tasks FROM annotation_projects WHERE id = ?').get(projectId) as any;
    if (project) {
      db.prepare('UPDATE annotation_projects SET total_tasks = ?, updated_at = ? WHERE id = ?').run(
        project.total_tasks + 1,
        now,
        projectId
      );
    }

    res.status(201).json({
      id,
      projectId,
      sampleId,
      assigneeId: assigneeId || null,
      reviewerId: reviewerId || null,
      status: 'pending',
      annotations: [],
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建标注任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/annotation-tasks/:id
 * 更新标注任务
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查任务是否存在
    const existing = db.prepare('SELECT * FROM annotation_tasks WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: '标注任务不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    const fieldMap: Record<string, string> = {
      sampleId: 'sample_id',
      assigneeId: 'assignee_id',
      reviewerId: 'reviewer_id',
      status: 'status',
      annotations: 'annotations',
      reviewComment: 'review_comment',
      reviewedAt: 'reviewed_at',
      reviewedBy: 'reviewed_by',
    };

    Object.keys(updateData).forEach((key) => {
      if (fieldMap[key] && updateData[key] !== undefined) {
        updateFields.push(`${fieldMap[key]} = ?`);
        if (key === 'annotations') {
          updateValues.push(JSON.stringify(updateData[key]));
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString(), id);

    db.prepare(`UPDATE annotation_tasks SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM annotation_tasks WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      projectId: updated.project_id,
      sampleId: updated.sample_id,
      assigneeId: updated.assignee_id,
      reviewerId: updated.reviewer_id,
      status: updated.status,
      annotations: JSON.parse(updated.annotations),
      reviewComment: updated.review_comment,
      reviewedAt: updated.reviewed_at,
      reviewedBy: updated.reviewed_by,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新标注任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/annotation-tasks/:id
 * 删除标注任务
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const task = db.prepare('SELECT project_id FROM annotation_tasks WHERE id = ?').get(id) as any;
    if (!task) {
      return res.status(404).json({ error: '标注任务不存在' });
    }

    const result = db.prepare('DELETE FROM annotation_tasks WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '标注任务不存在' });
    }

    // 更新项目的任务统计
    const project = db.prepare('SELECT total_tasks FROM annotation_projects WHERE id = ?').get(task.project_id) as any;
    if (project) {
      const now = new Date().toISOString();
      db.prepare('UPDATE annotation_projects SET total_tasks = ?, updated_at = ? WHERE id = ?').run(
        Math.max(0, project.total_tasks - 1),
        now,
        task.project_id
      );
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除标注任务错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/annotation-tasks/:id/results
 * 提交标注结果
 */
router.post('/:id/results', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { labels, content, confidence, duration } = req.body;
    const userId = req.user!.userId;

    // 检查任务是否存在
    const task = db.prepare('SELECT * FROM annotation_tasks WHERE id = ?').get(id) as any;
    if (!task) {
      return res.status(404).json({ error: '标注任务不存在' });
    }

    const resultId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    // 创建标注结果
    db.prepare(`
      INSERT INTO annotation_results (id, task_id, annotator_id, labels, content, confidence, duration, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      resultId,
      id,
      userId,
      JSON.stringify(labels || []),
      content ? JSON.stringify(content) : null,
      confidence || null,
      duration || null,
      now
    );

    // 更新任务的标注信息
    const annotations = JSON.parse(task.annotations);
    annotations.push(resultId);
    const updateNow = new Date().toISOString();
    db.prepare('UPDATE annotation_tasks SET annotations = ?, status = ?, updated_at = ? WHERE id = ?').run(
      JSON.stringify(annotations),
      'completed',
      updateNow,
      id
    );

    res.status(201).json({
      id: resultId,
      taskId: id,
      annotatorId: userId,
      labels: labels || [],
      content: content || null,
      confidence: confidence || null,
      duration: duration || null,
      createdAt: now,
    });
  } catch (error) {
    console.error('提交标注结果错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/annotation-tasks/:id/results
 * 获取任务的标注结果列表
 */
router.get('/:id/results', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const results = db.prepare('SELECT * FROM annotation_results WHERE task_id = ? ORDER BY created_at DESC').all(id) as any[];

    const formattedResults = results.map((result) => ({
      id: result.id,
      taskId: result.task_id,
      annotatorId: result.annotator_id,
      labels: JSON.parse(result.labels),
      content: result.content ? JSON.parse(result.content) : null,
      confidence: result.confidence,
      duration: result.duration,
      createdAt: result.created_at,
    }));

    res.json({ data: formattedResults });
  } catch (error) {
    console.error('获取标注结果错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;




