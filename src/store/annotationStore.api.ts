// 标注相关的API调用函数
import api from '../api';
import type {
  LabelTemplate,
  AnnotationProject,
  AnnotationTask,
  AnnotationResult,
} from './annotationStore';

export const labelTemplateApi = {
  getAll: async (taskType?: string): Promise<LabelTemplate[]> => {
    const params = taskType ? { taskType } : {};
    const response = await api.get('/label-templates', { params });
    // 后端返回的字段是taskType，前端使用的是type，需要转换
    return response.data.map((item: any) => ({
      ...item,
      type: item.taskType || item.type,
    }));
  },
  getById: async (id: string): Promise<LabelTemplate> => {
    const response = await api.get(`/label-templates/${id}`);
    // 后端直接返回对象，不是包装在data中
    const item = response.data || response;
    return {
      ...item,
      type: item.taskType || item.type,
    };
  },
  create: async (data: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabelTemplate> => {
    const response = await api.post('/label-templates', data);
    return response.data;
  },
  update: async (id: string, data: Partial<LabelTemplate>): Promise<LabelTemplate> => {
    const response = await api.put(`/label-templates/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/label-templates/${id}`);
  },
};

export const annotationProjectApi = {
  getAll: async (): Promise<AnnotationProject[]> => {
    const response = await api.get('/annotation-projects');
    return response.data;
  },
  getById: async (id: string): Promise<AnnotationProject> => {
    const response = await api.get(`/annotation-projects/${id}`);
    return response;
  },
  create: async (data: Omit<AnnotationProject, 'id' | 'createdAt' | 'updatedAt' | 'totalTasks' | 'completedTasks' | 'reviewingTasks' | 'approvedTasks' | 'rejectedTasks'>): Promise<AnnotationProject> => {
    const response = await api.post('/annotation-projects', data);
    return response.data;
  },
  update: async (id: string, data: Partial<AnnotationProject>): Promise<AnnotationProject> => {
    const response = await api.put(`/annotation-projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/annotation-projects/${id}`);
  },
  getTasks: async (projectId: string): Promise<AnnotationTask[]> => {
    const response = await api.get(`/annotation-projects/${projectId}/tasks`);
    return response.data;
  },
};

export const annotationTaskApi = {
  getAll: async (params?: { projectId?: string; status?: string; assigneeId?: string; reviewerId?: string }): Promise<AnnotationTask[]> => {
    const response = await api.get('/annotation-tasks', { params });
    return response.data;
  },
  getById: async (id: string): Promise<AnnotationTask> => {
    const response = await api.get(`/annotation-tasks/${id}`);
    return response;
  },
  create: async (data: Omit<AnnotationTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnnotationTask> => {
    const response = await api.post('/annotation-tasks', data);
    return response.data;
  },
  update: async (id: string, data: Partial<AnnotationTask>): Promise<AnnotationTask> => {
    const response = await api.put(`/annotation-tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/annotation-tasks/${id}`);
  },
  submitResult: async (taskId: string, result: Omit<AnnotationResult, 'id' | 'createdAt'>): Promise<AnnotationResult> => {
    const response = await api.post(`/annotation-tasks/${taskId}/results`, result);
    return response.data;
  },
  getResults: async (taskId: string): Promise<AnnotationResult[]> => {
    const response = await api.get(`/annotation-tasks/${taskId}/results`);
    return response.data;
  },
};


