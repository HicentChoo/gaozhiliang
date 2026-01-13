import { Router, Request, Response } from 'express';
import db from '../db/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

/**
 * GET /api/annotation-projects
 * 获取标注项目列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const projects = db.prepare('SELECT * FROM annotation_projects ORDER BY created_at DESC').all() as any[];

    const formattedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      datasetId: project.dataset_id,
      datasetVersion: project.dataset_version,
      taskType: project.task_type,
      labelTemplateId: project.label_template_id,
      status: project.status,
      ownerId: project.owner_id,
      annotatorIds: JSON.parse(project.annotator_ids),
      reviewerIds: JSON.parse(project.reviewer_ids),
      totalTasks: project.total_tasks,
      completedTasks: project.completed_tasks,
      reviewingTasks: project.reviewing_tasks,
      approvedTasks: project.approved_tasks,
      rejectedTasks: project.rejected_tasks,
      config: JSON.parse(project.config),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    res.json({ data: formattedProjects });
  } catch (error) {
    console.error('获取标注项目列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/annotation-projects/:id
 * 获取标注项目详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = db.prepare('SELECT * FROM annotation_projects WHERE id = ?').get(id) as any;

    if (!project) {
      return res.status(404).json({ error: '标注项目不存在' });
    }

    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      datasetId: project.dataset_id,
      datasetVersion: project.dataset_version,
      taskType: project.task_type,
      labelTemplateId: project.label_template_id,
      status: project.status,
      ownerId: project.owner_id,
      annotatorIds: JSON.parse(project.annotator_ids),
      reviewerIds: JSON.parse(project.reviewer_ids),
      totalTasks: project.total_tasks,
      completedTasks: project.completed_tasks,
      reviewingTasks: project.reviewing_tasks,
      approvedTasks: project.approved_tasks,
      rejectedTasks: project.rejected_tasks,
      config: JSON.parse(project.config),
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    });
  } catch (error) {
    console.error('获取标注项目详情错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * POST /api/annotation-projects
 * 创建标注项目
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, datasetId, datasetVersion, taskType, labelTemplateId, annotatorIds, reviewerIds, config } = req.body;

    if (!name || !datasetId || !taskType) {
      return res.status(400).json({ error: '名称、数据集ID和任务类型不能为空' });
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();
    const userId = req.user!.userId;

    db.prepare(`
      INSERT INTO annotation_projects (
        id, name, description, dataset_id, dataset_version, task_type, label_template_id,
        status, owner_id, annotator_ids, reviewer_ids,
        total_tasks, completed_tasks, reviewing_tasks, approved_tasks, rejected_tasks,
        config, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      description || null,
      datasetId,
      datasetVersion || null,
      taskType,
      labelTemplateId || null,
      'draft',
      userId,
      JSON.stringify(annotatorIds || []),
      JSON.stringify(reviewerIds || []),
      0, 0, 0, 0, 0,
      JSON.stringify(config || {}),
      now,
      now
    );

    res.status(201).json({
      id,
      name,
      description: description || null,
      datasetId,
      datasetVersion: datasetVersion || null,
      taskType,
      labelTemplateId: labelTemplateId || null,
      status: 'draft',
      ownerId: userId,
      annotatorIds: annotatorIds || [],
      reviewerIds: reviewerIds || [],
      totalTasks: 0,
      completedTasks: 0,
      reviewingTasks: 0,
      approvedTasks: 0,
      rejectedTasks: 0,
      config: config || {},
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('创建标注项目错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * PUT /api/annotation-projects/:id
 * 更新标注项目
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查项目是否存在
    const existing = db.prepare('SELECT id FROM annotation_projects WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: '标注项目不存在' });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      description: 'description',
      datasetId: 'dataset_id',
      datasetVersion: 'dataset_version',
      taskType: 'task_type',
      labelTemplateId: 'label_template_id',
      status: 'status',
      annotatorIds: 'annotator_ids',
      reviewerIds: 'reviewer_ids',
      totalTasks: 'total_tasks',
      completedTasks: 'completed_tasks',
      reviewingTasks: 'reviewing_tasks',
      approvedTasks: 'approved_tasks',
      rejectedTasks: 'rejected_tasks',
      config: 'config',
    };

    Object.keys(updateData).forEach((key) => {
      if (fieldMap[key] && updateData[key] !== undefined) {
        updateFields.push(`${fieldMap[key]} = ?`);
        if (key === 'annotatorIds' || key === 'reviewerIds' || key === 'config') {
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

    db.prepare(`UPDATE annotation_projects SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateValues);

    const updated = db.prepare('SELECT * FROM annotation_projects WHERE id = ?').get(id) as any;

    res.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      datasetId: updated.dataset_id,
      datasetVersion: updated.dataset_version,
      taskType: updated.task_type,
      labelTemplateId: updated.label_template_id,
      status: updated.status,
      ownerId: updated.owner_id,
      annotatorIds: JSON.parse(updated.annotator_ids),
      reviewerIds: JSON.parse(updated.reviewer_ids),
      totalTasks: updated.total_tasks,
      completedTasks: updated.completed_tasks,
      reviewingTasks: updated.reviewing_tasks,
      approvedTasks: updated.approved_tasks,
      rejectedTasks: updated.rejected_tasks,
      config: JSON.parse(updated.config),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('更新标注项目错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * DELETE /api/annotation-projects/:id
 * 删除标注项目
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM annotation_projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: '标注项目不存在' });
    }

    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除标注项目错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

/**
 * GET /api/annotation-projects/:id/tasks
 * 获取项目的标注任务列表
 */
router.get('/:id/tasks', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assigneeId } = req.query;

    let query = 'SELECT * FROM annotation_tasks WHERE project_id = ?';
    const params: any[] = [id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (assigneeId) {
      query += ' AND assignee_id = ?';
      params.push(assigneeId);
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

export default router;




