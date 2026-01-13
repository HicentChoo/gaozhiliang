// 增强相关的API调用函数
import api from '../api';
import type { EnhancementTask } from './enhancementStore';

export const enhancementTaskApi = {
  getAll: async (params?: { status?: string; datasetId?: string }): Promise<EnhancementTask[]> => {
    const response = await api.get('/enhancement-tasks', { params });
    return response.data;
  },
  getById: async (id: string): Promise<EnhancementTask> => {
    const response = await api.get(`/enhancement-tasks/${id}`);
    return response;
  },
  create: async (data: Omit<EnhancementTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnhancementTask> => {
    const response = await api.post('/enhancement-tasks', data);
    return response;
  },
  update: async (id: string, data: Partial<EnhancementTask>): Promise<EnhancementTask> => {
    const response = await api.put(`/enhancement-tasks/${id}`, data);
    return response;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/enhancement-tasks/${id}`);
  },
};




