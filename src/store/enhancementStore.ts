import { create } from 'zustand';
import { enhancementTaskApi } from './enhancementStore.api';

export interface EnhancementTask {
  id: string;
  name: string;
  datasetId: string; // 源数据集ID
  sceneConfigId: string; // 关联的场景配置ID
  status: 'draft' | 'running' | 'completed' | 'failed';
  progress?: number; // 进度百分比 0-100
  resultDatasetId?: string; // 增强后的数据集ID
  errorMessage?: string; // 错误信息
  createdAt: string;
  updatedAt: string;
}

interface EnhancementState {
  tasks: EnhancementTask[];
  loading: boolean;
  error: string | null;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<EnhancementTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<EnhancementTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

// 演示数据
const mockEnhancementTasks: EnhancementTask[] = [
  {
    id: 'et1',
    name: '情感分析数据集扩写增强',
    datasetId: 'ds1',
    sceneConfigId: 'sc1',
    status: 'completed',
    progress: 100,
    resultDatasetId: 'ds1',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
  {
    id: 'et2',
    name: '问答对数据集改写增强',
    datasetId: 'ds2',
    sceneConfigId: 'sc2',
    status: 'running',
    progress: 65,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T14:20:00Z',
  },
  {
    id: 'et3',
    name: '对话数据集生成增强',
    datasetId: 'ds4',
    sceneConfigId: 'sc3',
    status: 'failed',
    progress: 30,
    errorMessage: 'API调用失败，请检查网络连接',
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2024-02-05T11:45:00Z',
  },
];

export const useEnhancementStore = create<EnhancementState>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  
  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const data = await enhancementTaskApi.getAll();
      set({ tasks: data, loading: false });
    } catch (error: any) {
      set({ error: error.message || '加载增强任务失败', loading: false });
    }
  },
  
  addTask: async (task) => {
    try {
      const newTask = await enhancementTaskApi.create(task);
      set((state) => ({
        tasks: [...state.tasks, newTask],
      }));
    } catch (error: any) {
      set({ error: error.message || '创建增强任务失败' });
      throw error;
    }
  },
  
  updateTask: async (id, task) => {
    try {
      const updated = await enhancementTaskApi.update(id, task);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    } catch (error: any) {
      set({ error: error.message || '更新增强任务失败' });
      throw error;
    }
  },
  
  deleteTask: async (id) => {
    try {
      await enhancementTaskApi.delete(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message || '删除增强任务失败' });
      throw error;
    }
  },
}));




