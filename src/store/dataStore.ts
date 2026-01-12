import { create } from 'zustand';

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'other';
  config: {
    driver?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    connectionString?: string;
    endpoint?: string;
    apiKey?: string;
    path?: string;
    format?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionTask {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  cron?: string;
  cronDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Dataset {
  id: string;
  name: string;
  type: 'text';
  format: string;
  sourceType: 'task' | 'file';
  sourceId: string;
  versions: DatasetVersion[];
  isPublished?: boolean;
  dataUsage?: string;
  sampleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetVersion {
  version: string;
  sampleCount: number;
  status: 'draft' | 'processing' | 'completed';
  createdAt: string;
}

export interface DatasetSample {
  id: string;
  content: Record<string, any>;
  createdAt: string;
}

interface DataState {
  dataSources: DataSource[];
  collectionTasks: CollectionTask[];
  datasets: Dataset[];
  addDataSource: (source: Omit<DataSource, 'id' | 'createdAt'>) => void;
  updateDataSource: (id: string, source: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  addCollectionTask: (task: Omit<CollectionTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCollectionTask: (id: string, task: Partial<CollectionTask>) => void;
  deleteCollectionTask: (id: string) => void;
  addDataset: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDataset: (id: string, dataset: Partial<Dataset>) => void;
  deleteDataset: (id: string) => void;
  addDatasetVersion: (datasetId: string, version: Omit<DatasetVersion, 'createdAt'>) => void;
}

// 演示数据
const mockDataSources: DataSource[] = [
  {
    id: 'ds1',
    name: 'MySQL生产数据库',
    type: 'database',
    config: {
      driver: 'mysql',
      host: '192.168.1.100',
      port: 3306,
      database: 'production_db',
      username: 'readonly_user',
    },
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'ds2',
    name: 'REST API接口',
    type: 'api',
    config: {
      endpoint: 'https://api.example.com/v1/data',
      apiKey: 'sk-xxxxx',
    },
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'ds3',
    name: '本地文件目录',
    type: 'file',
    config: {
      path: '/data/raw',
      format: 'json',
    },
    createdAt: '2024-02-01T09:15:00Z',
  },
];

const mockCollectionTasks: CollectionTask[] = [
  {
    id: 'ct1',
    name: '每日新闻采集',
    description: '自动采集每日新闻数据',
    nodes: [],
    edges: [],
    status: 'running',
    cron: '0 0 2 * * *',
    cronDescription: '每天凌晨2点执行',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'ct2',
    name: '用户评论采集',
    description: '采集电商平台用户评论',
    nodes: [],
    edges: [],
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z',
  },
];

const mockDatasets: Dataset[] = [
  {
    id: 'ds1',
    name: '中文情感分析数据集',
    type: 'text',
    format: 'json',
    sourceType: 'file',
    sourceId: 'file1',
    dataUsage: '有监督微调SFT',
    sampleCount: 12500,
    isPublished: true,
    versions: [
      {
        version: 'v1.0',
        sampleCount: 10000,
        status: 'completed',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        version: 'v1.1',
        sampleCount: 12500,
        status: 'completed',
        createdAt: '2024-02-01T14:20:00Z',
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T14:20:00Z',
  },
  {
    id: 'ds2',
    name: '问答对数据集',
    type: 'text',
    format: 'json',
    sourceType: 'task',
    sourceId: 'ct1',
    dataUsage: '有监督微调SFT',
    sampleCount: 8500,
    isPublished: true,
    versions: [
      {
        version: 'v1.0',
        sampleCount: 8500,
        status: 'completed',
        createdAt: '2024-01-20T11:00:00Z',
      },
    ],
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
  },
  {
    id: 'ds3',
    name: '命名实体识别数据集',
    type: 'text',
    format: 'json',
    sourceType: 'file',
    sourceId: 'file2',
    dataUsage: '有监督微调SFT',
    sampleCount: 3200,
    isPublished: false,
    versions: [
      {
        version: 'v1.0',
        sampleCount: 3200,
        status: 'processing',
        createdAt: '2024-02-05T09:30:00Z',
      },
    ],
    createdAt: '2024-02-05T09:30:00Z',
    updatedAt: '2024-02-05T09:30:00Z',
  },
  {
    id: 'ds4',
    name: '多轮对话数据集',
    type: 'text',
    format: 'json',
    sourceType: 'task',
    sourceId: 'ct2',
    dataUsage: '有监督微调SFT',
    sampleCount: 5600,
    isPublished: true,
    versions: [
      {
        version: 'v1.0',
        sampleCount: 5600,
        status: 'completed',
        createdAt: '2024-02-10T16:45:00Z',
      },
    ],
    createdAt: '2024-02-10T16:45:00Z',
    updatedAt: '2024-02-10T16:45:00Z',
  },
];

export const useDataStore = create<DataState>((set) => ({
  dataSources: mockDataSources,
  collectionTasks: mockCollectionTasks,
  datasets: mockDatasets,
  addDataSource: (source) => {
    const newSource: DataSource = {
      ...source,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      dataSources: [...state.dataSources, newSource],
    }));
  },
  updateDataSource: (id, source) => {
    set((state) => ({
      dataSources: state.dataSources.map((s) =>
        s.id === id ? { ...s, ...source } : s
      ),
    }));
  },
  deleteDataSource: (id) => {
    set((state) => ({
      dataSources: state.dataSources.filter((s) => s.id !== id),
    }));
  },
  addCollectionTask: (task) => {
    const newTask: CollectionTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      collectionTasks: [...state.collectionTasks, newTask],
    }));
  },
  updateCollectionTask: (id, task) => {
    set((state) => ({
      collectionTasks: state.collectionTasks.map((t) =>
        t.id === id
          ? { ...t, ...task, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },
  deleteCollectionTask: (id) => {
    set((state) => ({
      collectionTasks: state.collectionTasks.filter((t) => t.id !== id),
    }));
  },
  addDataset: (dataset) => {
    const newDataset: Dataset = {
      ...dataset,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      datasets: [...state.datasets, newDataset],
    }));
  },
  updateDataset: (id, dataset) => {
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === id
          ? { ...d, ...dataset, updatedAt: new Date().toISOString() }
          : d
      ),
    }));
  },
  deleteDataset: (id) => {
    set((state) => ({
      datasets: state.datasets.filter((d) => d.id !== id),
    }));
  },
  addDatasetVersion: (datasetId, version) => {
    set((state) => ({
      datasets: state.datasets.map((d) =>
        d.id === datasetId
          ? {
              ...d,
              versions: [
                ...d.versions,
                { ...version, createdAt: new Date().toISOString() },
              ],
            }
          : d
      ),
    }));
  },
}));

