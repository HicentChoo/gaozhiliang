import { create } from 'zustand';

// 模型管理接口
export interface Model {
  id: string;
  name: string; // 模型名称（用于管理员记忆）
  model: string; // model字段（用于指定调用哪一个模型，如 qwen-plus, qwen-max, qwen-turbo）
  apiKey: string; // API Key
  endpoint: string; // API端点，默认使用中国大陆地域
  description?: string; // 描述
  isActive: boolean; // 是否启用
  createdAt: string;
  updatedAt: string;
}

// 场景应用配置接口
export interface SceneConfig {
  id: string;
  sceneName: string; // 场景名称
  modelId: string; // 关联的模型ID
  prompt: string; // 基模提示词
  systemPrompt?: string; // 系统提示词（可选）
  temperature?: number; // 温度参数
  maxTokens?: number; // 最大token数
  description?: string; // 描述
  createdAt: string;
  updatedAt: string;
}

interface ToolboxState {
  models: Model[];
  sceneConfigs: SceneConfig[];
  addModel: (model: Omit<Model, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateModel: (id: string, model: Partial<Model>) => void;
  deleteModel: (id: string) => void;
  addSceneConfig: (config: Omit<SceneConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSceneConfig: (id: string, config: Partial<SceneConfig>) => void;
  deleteSceneConfig: (id: string) => void;
}

// 演示数据
const mockModels: Model[] = [
  {
    id: 'm1',
    name: '通义千问Plus',
    model: 'qwen-plus',
    apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '通义千问Plus模型，适用于通用对话和文本生成任务',
    isActive: true,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'm2',
    name: '通义千问Max',
    model: 'qwen-max',
    apiKey: 'sk-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '通义千问Max模型，性能最强，适用于复杂任务',
    isActive: true,
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-12T10:30:00Z',
  },
  {
    id: 'm3',
    name: '通义千问Turbo',
    model: 'qwen-turbo',
    apiKey: 'sk-zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    description: '通义千问Turbo模型，速度快，适用于实时场景',
    isActive: false,
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
  },
];

const mockSceneConfigs: SceneConfig[] = [
  {
    id: 'sc1',
    sceneName: '文本扩写增强',
    modelId: 'm1',
    prompt: '请对以下文本进行扩写，保持原意不变，增加更多细节和描述：\n{userInput}',
    systemPrompt: '你是一个专业的文本扩写助手，擅长在保持原意的基础上丰富文本内容。',
    temperature: 0.7,
    maxTokens: 2000,
    description: '用于数据增强中的文本扩写场景',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 'sc2',
    sceneName: '文本改写增强',
    modelId: 'm1',
    prompt: '请用不同的表达方式改写以下文本，保持核心意思不变：\n{userInput}',
    systemPrompt: '你是一个专业的文本改写助手，能够用多种方式表达相同的意思。',
    temperature: 0.8,
    maxTokens: 1500,
    description: '用于数据增强中的文本改写场景',
    createdAt: '2024-01-16T10:30:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 'sc3',
    sceneName: '问答对生成',
    modelId: 'm2',
    prompt: '基于以下文本内容，生成3-5个问答对：\n{userInput}',
    systemPrompt: '你是一个专业的问答对生成助手，能够根据文本内容生成高质量的问答对。',
    temperature: 0.6,
    maxTokens: 3000,
    description: '用于生成问答对数据',
    createdAt: '2024-01-18T11:15:00Z',
    updatedAt: '2024-01-18T11:15:00Z',
  },
  {
    id: 'sc4',
    sceneName: '文本摘要生成',
    modelId: 'm1',
    prompt: '请为以下文本生成一个简洁的摘要：\n{userInput}',
    systemPrompt: '你是一个专业的文本摘要生成助手，能够提取文本的核心信息。',
    temperature: 0.5,
    maxTokens: 500,
    description: '用于生成文本摘要',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
];

export const useToolboxStore = create<ToolboxState>((set) => ({
  models: mockModels,
  sceneConfigs: mockSceneConfigs,
  addModel: (model) => {
    const newModel: Model = {
      ...model,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      models: [...state.models, newModel],
    }));
  },
  updateModel: (id, model) => {
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id
          ? { ...m, ...model, updatedAt: new Date().toISOString() }
          : m
      ),
    }));
  },
  deleteModel: (id) => {
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
      // 删除模型时，同时删除关联的场景配置
      sceneConfigs: state.sceneConfigs.filter((c) => c.modelId !== id),
    }));
  },
  addSceneConfig: (config) => {
    const newConfig: SceneConfig = {
      ...config,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      sceneConfigs: [...state.sceneConfigs, newConfig],
    }));
  },
  updateSceneConfig: (id, config) => {
    set((state) => ({
      sceneConfigs: state.sceneConfigs.map((c) =>
        c.id === id
          ? { ...c, ...config, updatedAt: new Date().toISOString() }
          : c
      ),
    }));
  },
  deleteSceneConfig: (id) => {
    set((state) => ({
      sceneConfigs: state.sceneConfigs.filter((c) => c.id !== id),
    }));
  },
}));










