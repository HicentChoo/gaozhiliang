// 数据相关的API调用函数
import api from '../api';
import type { DataSource, CollectionTask, Dataset, DatasetVersion } from './dataStore';

export const dataSourceApi = {
  getAll: async (): Promise<DataSource[]> => {
    const response = await api.get('/data-sources');
    return response.data;
  },
  getById: async (id: string): Promise<DataSource> => {
    const response = await api.get(`/data-sources/${id}`);
    return response;
  },
  create: async (data: Omit<DataSource, 'id' | 'createdAt'>): Promise<DataSource> => {
    const response = await api.post('/data-sources', data);
    return response;
  },
  update: async (id: string, data: Partial<DataSource>): Promise<DataSource> => {
    const response = await api.put(`/data-sources/${id}`, data);
    return response;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/data-sources/${id}`);
  },
};

export const collectionTaskApi = {
  getAll: async (): Promise<CollectionTask[]> => {
    const response = await api.get('/collection-tasks');
    return response.data;
  },
  getById: async (id: string): Promise<CollectionTask> => {
    const response = await api.get(`/collection-tasks/${id}`);
    return response;
  },
  create: async (data: Omit<CollectionTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollectionTask> => {
    const response = await api.post('/collection-tasks', data);
    return response;
  },
  update: async (id: string, data: Partial<CollectionTask>): Promise<CollectionTask> => {
    const response = await api.put(`/collection-tasks/${id}`, data);
    return response;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/collection-tasks/${id}`);
  },
};

export const datasetApi = {
  getAll: async (): Promise<Dataset[]> => {
    const response = await api.get('/datasets');
    return response.data;
  },
  getById: async (id: string): Promise<Dataset> => {
    const response = await api.get(`/datasets/${id}`);
    return response;
  },
  create: async (data: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dataset> => {
    const response = await api.post('/datasets', data);
    return response;
  },
  update: async (id: string, data: Partial<Dataset>): Promise<Dataset> => {
    const response = await api.put(`/datasets/${id}`, data);
    return response;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/datasets/${id}`);
  },
  addVersion: async (datasetId: string, version: Omit<DatasetVersion, 'createdAt'>): Promise<DatasetVersion> => {
    const response = await api.post(`/datasets/${datasetId}/versions`, { version });
    return response.version;
  },
};




