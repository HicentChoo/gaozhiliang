// 工具箱相关的API调用函数
import api from '../api';
import type { Model, SceneConfig } from './toolboxStore';

export const modelApi = {
  getAll: async (): Promise<Model[]> => {
    const response = await api.get('/models');
    return response.data;
  },
  getById: async (id: string): Promise<Model> => {
    const response = await api.get(`/models/${id}`);
    return response;
  },
  create: async (data: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>): Promise<Model> => {
    const response = await api.post('/models', data);
    return response;
  },
  update: async (id: string, data: Partial<Model>): Promise<Model> => {
    const response = await api.put(`/models/${id}`, data);
    return response;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/models/${id}`);
  },
};

export const sceneConfigApi = {
  getAll: async (modelId?: string): Promise<SceneConfig[]> => {
    const params = modelId ? { modelId } : {};
    const response = await api.get('/scene-configs', { params });
    return response.data;
  },
  getById: async (id: string): Promise<SceneConfig> => {
    const response = await api.get(`/scene-configs/${id}`);
    return response;
  },
  create: async (data: Omit<SceneConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<SceneConfig> => {
    const response = await api.post('/scene-configs', data);
    return response;
  },
  update: async (id: string, data: Partial<SceneConfig>): Promise<SceneConfig> => {
    const response = await api.put(`/scene-configs/${id}`, data);
    return response;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/scene-configs/${id}`);
  },
};




