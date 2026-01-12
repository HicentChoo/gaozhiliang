import { create } from 'zustand';

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
  addTask: (task: Omit<EnhancementTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<EnhancementTask>) => void;
  deleteTask: (id: string) => void;
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
  tasks: mockEnhancementTasks,
  addTask: (task) => {
    const newTask: EnhancementTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },
  updateTask: (id, task) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...task, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },
}));




