import { create } from 'zustand';

// 标注任务类型 - 扩展版本，包含更多类型
export type AnnotationTaskType =
  // 文本类
  | 'text_classification' // 文本分类
  | 'text_qa' // 文本问答对
  | 'sequence_labeling' // 序列标注（NER等）
  | 'multi_label' // 多标签分类
  | 'dialogue' // 对话标注
  | 'text_summarization' // 文本摘要
  | 'text_generation' // 文本生成
  | 'text_translation' // 文本翻译
  | 'sentiment_analysis' // 情感分析
  | 'text_similarity' // 文本相似度
  | 'text_entailment' // 文本蕴含
  | 'text_clustering' // 文本聚类
  | 'named_entity_recognition' // 命名实体识别
  | 'relation_extraction' // 关系抽取
  | 'event_extraction' // 事件抽取
  | 'text_correction' // 文本纠错
  // 图像类
  | 'image_classification' // 图像分类
  | 'object_detection' // 目标检测
  | 'image_segmentation' // 图像分割
  | 'image_qa' // 图像问答
  | 'image_captioning' // 图像描述生成
  | 'ocr' // 光学字符识别
  | 'face_recognition' // 人脸识别
  | 'image_retrieval' // 图像检索
  | 'image_super_resolution' // 图像超分辨率
  | 'image_denoising' // 图像去噪
  | 'keypoint_detection' // 关键点检测
  | 'pose_estimation' // 姿态估计
  | 'image_generation' // 图像生成
  // 音频类
  | 'audio_classification' // 音频分类
  | 'speech_recognition' // 语音识别
  | 'speech_synthesis' // 语音合成
  | 'audio_segmentation' // 音频分割
  | 'speaker_diarization' // 说话人分离
  | 'emotion_recognition' // 情感识别（音频）
  | 'music_classification' // 音乐分类
  | 'audio_denoising' // 音频去噪
  // 视频类
  | 'video_classification' // 视频分类
  | 'video_object_detection' // 视频目标检测
  | 'video_segmentation' // 视频分割
  | 'action_recognition' // 动作识别
  | 'video_captioning' // 视频描述生成
  | 'video_qa' // 视频问答
  | 'video_summarization' // 视频摘要
  | 'video_tracking' // 视频跟踪
  // 多模态类
  | 'multimodal_classification' // 多模态分类
  | 'image_text_matching' // 图文匹配
  | 'video_text_matching' // 视频文本匹配
  | 'multimodal_qa' // 多模态问答
  | 'visual_question_answering' // 视觉问答
  // 其他
  | 'custom'; // 自定义

// 任务类型分类配置（用于多级联动）
export interface TaskTypeCategory {
  label: string;
  value: string;
  children: TaskTypeOption[];
}

export interface TaskTypeOption {
  label: string;
  value: AnnotationTaskType;
  description?: string;
}

export const TASK_TYPE_CATEGORIES: TaskTypeCategory[] = [
  // 参考 Label Studio，将一级类调整为“自然语言处理 / 计算机视觉 / 音频语音 / 视频 / 多模态 / 其他”
  {
    label: '自然语言处理（NLP）',
    value: 'text',
    children: [
      {
        label: '文本分类',
        value: 'text_classification',
        description: '类似 Label Studio 的 Text Classification，对文本进行单/多标签分类',
      },
      {
        label: '序列标注（分词/实体/槽位）',
        value: 'sequence_labeling',
        description: '类似 Label Studio 的 Sequence Labeling，对 token 级别做标签，如 NER、槽位填充',
      },
      {
        label: '文本问答对标注',
        value: 'text_qa',
        description: '构建问答对、抽取答案片段等 QA 相关任务',
      },
      {
        label: '多标签文本分类',
        value: 'multi_label',
        description: '一个文本对应多个类别的多标签分类任务',
      },
      {
        label: '对话/多轮会话标注',
        value: 'dialogue',
        description: '对多轮对话进行意图、槽位、质量等综合标注',
      },
      {
        label: '文本摘要生成',
        value: 'text_summarization',
        description: '对长文本生成抽取式或生成式摘要',
      },
      {
        label: '文本生成 / 改写',
        value: 'text_generation',
        description: '生成新文本、补全内容或改写文本',
      },
      {
        label: '机器翻译标注',
        value: 'text_translation',
        description: '源语言到目标语言的翻译标注与质量评估',
      },
      {
        label: '情感分析',
        value: 'sentiment_analysis',
        description: '对文本情感极性、多维情绪进行标注',
      },
      {
        label: '文本相似度 / 相关性',
        value: 'text_similarity',
        description: '判断两个文本是否等价、相似或无关',
      },
      {
        label: '文本蕴含（NLI）',
        value: 'text_entailment',
        description: '判断前提和假设之间的蕴含/矛盾/中立关系',
      },
      {
        label: '文本聚类标签确认',
        value: 'text_clustering',
        description: '对自动聚类结果进行人工命名与校正',
      },
      {
        label: '命名实体识别（NER）',
        value: 'named_entity_recognition',
        description: '识别人名、地名、机构名等实体边界和类型',
      },
      {
        label: '关系抽取',
        value: 'relation_extraction',
        description: '在已经标注的实体之间抽取语义关系',
      },
      {
        label: '事件抽取',
        value: 'event_extraction',
        description: '抽取触发词、事件类型以及论元角色',
      },
      {
        label: '文本纠错 / 规范化',
        value: 'text_correction',
        description: '拼写/语法纠错、正式化/口语化转换等',
      },
    ],
  },
  {
    label: '计算机视觉（CV）',
    value: 'image',
    children: [
      {
        label: '图像分类',
        value: 'image_classification',
        description: '类似 Label Studio 的 Image Classification，对整张图像打标签',
      },
      {
        label: '目标检测（矩形框）',
        value: 'object_detection',
        description: '类似 RectangleLabels，对对象进行边界框标注',
      },
      {
        label: '语义分割（多边形 / 掩码）',
        value: 'image_segmentation',
        description: '类似 Polygon / Brush，基于多边形或笔刷进行像素级分割',
      },
      {
        label: '图像问答（Visual QA）',
        value: 'image_qa',
        description: '基于图像内容回答自然语言问题',
      },
      {
        label: '图像描述生成（Caption）',
        value: 'image_captioning',
        description: '为图像生成一句或多句自然语言描述',
      },
      {
        label: '光学字符识别（OCR）',
        value: 'ocr',
        description: '对自然场景或扫描文档中的文字进行检测与识别',
      },
      {
        label: '人脸识别 / 属性标注',
        value: 'face_recognition',
        description: '对人脸进行检测、识别或属性（年龄/性别等）标注',
      },
      {
        label: '图像检索 / 相似图像标注',
        value: 'image_retrieval',
        description: '为图像库构建检索标签或相似度标注',
      },
      {
        label: '图像超分辨率',
        value: 'image_super_resolution',
        description: '为超分任务提供高/低分对齐数据',
      },
      {
        label: '图像去噪 / 增强',
        value: 'image_denoising',
        description: '构建带噪与干净图像对，用于去噪/增强训练',
      },
      {
        label: '关键点检测（关键点/骨架）',
        value: 'keypoint_detection',
        description: '类似 KeyPointLabels，为人体/物体打关键点、骨架',
      },
      {
        label: '姿态估计',
        value: 'pose_estimation',
        description: '识别人或物体的姿态（二维/三维关键点）',
      },
      {
        label: '图像生成 / 编辑',
        value: 'image_generation',
        description: '图像合成、风格迁移、编辑等生成式视觉任务',
      },
    ],
  },
  {
    label: '音频语音',
    value: 'audio',
    children: [
      {
        label: '音频事件分类',
        value: 'audio_classification',
        description: '对整段音频进行场景/事件分类',
      },
      {
        label: '语音识别（ASR）',
        value: 'speech_recognition',
        description: '对语音转写文本，类似 Label Studio 的 Audio Transcription',
      },
      {
        label: '语音合成标注（TTS）',
        value: 'speech_synthesis',
        description: '为语音合成构建文本-音频配对数据',
      },
      {
        label: '音频分段 / 对齐',
        value: 'audio_segmentation',
        description: '对音频时间轴进行切分、语句对齐等标注',
      },
      {
        label: '说话人分离 / 说话人标注',
        value: 'speaker_diarization',
        description: '对对话音频中不同说话人进行区分与标注',
      },
      {
        label: '语音情感识别',
        value: 'emotion_recognition',
        description: '对说话人情绪状态进行标注',
      },
      {
        label: '音乐分类 / 标签',
        value: 'music_classification',
        description: '为音乐片段打类型、风格等标签',
      },
      {
        label: '音频去噪 / 增强',
        value: 'audio_denoising',
        description: '为音频去噪、增强模型构建成对数据',
      },
    ],
  },
  {
    label: '视频理解',
    value: 'video',
    children: [
      {
        label: '视频分类',
        value: 'video_classification',
        description: '对整段视频进行场景/类型分类',
      },
      {
        label: '视频目标检测（时序框）',
        value: 'video_object_detection',
        description: '在视频帧序列上为对象画框并跟踪',
      },
      {
        label: '视频分割（时序掩码）',
        value: 'video_segmentation',
        description: '对视频中的目标进行像素级时序分割',
      },
      {
        label: '动作识别',
        value: 'action_recognition',
        description: '标注视频中的人物或物体动作类别',
      },
      {
        label: '视频描述生成',
        value: 'video_captioning',
        description: '为视频片段生成一段自然语言描述',
      },
      {
        label: '视频问答',
        value: 'video_qa',
        description: '基于视频内容进行问答标注',
      },
      {
        label: '视频摘要 / 关键帧选取',
        value: 'video_summarization',
        description: '为视频选取关键帧或生成摘要',
      },
      {
        label: '目标跟踪（Tracking）',
        value: 'video_tracking',
        description: '对视频中目标进行帧间关联与轨迹标注',
      },
    ],
  },
  {
    label: '多模态',
    value: 'multimodal',
    children: [
      {
        label: '多模态分类',
        value: 'multimodal_classification',
        description: '图文 / 语音文本等多模态共同输入的分类任务',
      },
      {
        label: '图文匹配 / 图文检索',
        value: 'image_text_matching',
        description: '判断图像与文本是否匹配或构建检索对',
      },
      {
        label: '视频文本匹配 / 检索',
        value: 'video_text_matching',
        description: '判断视频与文本相关性或构建检索样本',
      },
      {
        label: '多模态问答',
        value: 'multimodal_qa',
        description: '图文/视频/音频与文本组合输入的 QA 任务',
      },
      {
        label: '视觉问答（VQA）',
        value: 'visual_question_answering',
        description: '经典 VQA 任务：图像 + 文本问题 → 文本答案',
      },
    ],
  },
  {
    label: '其他 / 自定义',
    value: 'other',
    children: [
      { label: '自定义', value: 'custom', description: '自定义标注任务类型' },
    ],
  },
];

// 任务类型映射（用于显示）
export const TASK_TYPE_MAP: Record<AnnotationTaskType, string> = {
  // 文本类
  text_classification: '文本分类',
  text_qa: '文本问答对',
  sequence_labeling: '序列标注',
  multi_label: '多标签分类',
  dialogue: '对话标注',
  text_summarization: '文本摘要',
  text_generation: '文本生成',
  text_translation: '文本翻译',
  sentiment_analysis: '情感分析',
  text_similarity: '文本相似度',
  text_entailment: '文本蕴含',
  text_clustering: '文本聚类',
  named_entity_recognition: '命名实体识别',
  relation_extraction: '关系抽取',
  event_extraction: '事件抽取',
  text_correction: '文本纠错',
  // 图像类
  image_classification: '图像分类',
  object_detection: '目标检测',
  image_segmentation: '图像分割',
  image_qa: '图像问答',
  image_captioning: '图像描述生成',
  ocr: '光学字符识别',
  face_recognition: '人脸识别',
  image_retrieval: '图像检索',
  image_super_resolution: '图像超分辨率',
  image_denoising: '图像去噪',
  keypoint_detection: '关键点检测',
  pose_estimation: '姿态估计',
  image_generation: '图像生成',
  // 音频类
  audio_classification: '音频分类',
  speech_recognition: '语音识别',
  speech_synthesis: '语音合成',
  audio_segmentation: '音频分割',
  speaker_diarization: '说话人分离',
  emotion_recognition: '情感识别',
  music_classification: '音乐分类',
  audio_denoising: '音频去噪',
  // 视频类
  video_classification: '视频分类',
  video_object_detection: '视频目标检测',
  video_segmentation: '视频分割',
  action_recognition: '动作识别',
  video_captioning: '视频描述生成',
  video_qa: '视频问答',
  video_summarization: '视频摘要',
  video_tracking: '视频跟踪',
  // 多模态类
  multimodal_classification: '多模态分类',
  image_text_matching: '图文匹配',
  video_text_matching: '视频文本匹配',
  multimodal_qa: '多模态问答',
  visual_question_answering: '视觉问答',
  // 其他
  custom: '自定义',
};

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'reviewing' | 'rejected' | 'approved';

// 项目状态
export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

// 标签模板
export interface LabelTemplate {
  id: string;
  name: string;
  type: AnnotationTaskType;
  description?: string;
  labels: Label[];
  config: {
    // 标签配置
    allowMultiple?: boolean; // 是否允许多选
    required?: boolean; // 是否必填
    colors?: Record<string, string>; // 标签颜色映射
    shortcuts?: Record<string, string>; // 快捷键映射
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// 标签定义
export interface Label {
  id: string;
  name: string;
  value: string;
  color?: string;
  shortcut?: string; // 快捷键
  description?: string;
}

// 标注项目
export interface AnnotationProject {
  id: string;
  name: string;
  description?: string;
  datasetId: string; // 关联的数据集ID
  datasetVersion?: string; // 数据集版本
  taskType: AnnotationTaskType;
  labelTemplateId?: string; // 关联的标签模板ID
  status: ProjectStatus;
  ownerId: string; // 项目负责人ID
  annotatorIds: string[]; // 标注员ID列表
  reviewerIds: string[]; // 质检员ID列表
  // 任务统计
  totalTasks: number;
  completedTasks: number;
  reviewingTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  // 配置
  config: {
    allowMultipleAnnotations?: boolean; // 是否允许多个标注员标注同一任务
    requireReview?: boolean; // 是否需要质检
    minAgreement?: number; // 最小一致性要求（0-1）
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

// 标注任务
export interface AnnotationTask {
  id: string;
  projectId: string;
  sampleId: string; // 关联的数据集样本ID
  assigneeId?: string; // 分配给的用户ID
  reviewerId?: string; // 分配给质检员的ID
  status: TaskStatus;
  // 标注结果
  annotations: AnnotationResult[];
  // 质检信息
  reviewComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 标注结果
export interface AnnotationResult {
  id: string;
  taskId: string;
  annotatorId: string; // 标注员ID
  labels: LabelResult[]; // 标签结果
  content?: Record<string, any>; // 其他标注内容（如文本、坐标等）
  confidence?: number; // 置信度（0-1）
  duration?: number; // 标注耗时（秒）
  createdAt: string;
}

// 标签结果
export interface LabelResult {
  labelId: string;
  labelName: string;
  value: string | number | boolean;
  start?: number; // 序列标注起始位置
  end?: number; // 序列标注结束位置
  [key: string]: any;
}

interface AnnotationState {
  // 数据
  projects: AnnotationProject[];
  tasks: AnnotationTask[];
  results: AnnotationResult[];
  labelTemplates: LabelTemplate[];
  
  // 项目操作
  addProject: (project: Omit<AnnotationProject, 'id' | 'createdAt' | 'updatedAt' | 'totalTasks' | 'completedTasks' | 'reviewingTasks' | 'approvedTasks' | 'rejectedTasks'>) => void;
  updateProject: (id: string, project: Partial<AnnotationProject>) => void;
  deleteProject: (id: string) => void;
  
  // 任务操作
  addTask: (task: Omit<AnnotationTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addTasks: (tasks: Omit<AnnotationTask, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  updateTask: (id: string, task: Partial<AnnotationTask>) => void;
  deleteTask: (id: string) => void;
  
  // 标注结果操作
  addResult: (result: Omit<AnnotationResult, 'id' | 'createdAt'>) => void;
  updateResult: (id: string, result: Partial<AnnotationResult>) => void;
  deleteResult: (id: string) => void;
  
  // 标签模板操作
  addLabelTemplate: (template: Omit<LabelTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLabelTemplate: (id: string, template: Partial<LabelTemplate>) => void;
  deleteLabelTemplate: (id: string) => void;
  
  // 工具方法
  getProjectTasks: (projectId: string) => AnnotationTask[];
  getUserTasks: (userId: string) => AnnotationTask[];
  getTaskResults: (taskId: string) => AnnotationResult[];
}

// 演示数据
const mockLabelTemplates: LabelTemplate[] = [
  {
    id: 'lt1',
    name: '情感分析标签模板',
    type: 'text_classification',
    description: '用于文本情感分析的标签模板',
    labels: [
      { id: 'l1', name: '正面', value: 'positive', color: '#52c41a', shortcut: '1' },
      { id: 'l2', name: '负面', value: 'negative', color: '#ff4d4f', shortcut: '2' },
      { id: 'l3', name: '中性', value: 'neutral', color: '#faad14', shortcut: '3' },
    ],
    config: {
      allowMultiple: false,
      required: true,
    },
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'lt2',
    name: '命名实体识别模板',
    type: 'sequence_labeling',
    description: '用于NER任务的实体标签模板',
    labels: [
      { id: 'l4', name: '人名', value: 'PERSON', color: '#1890ff', shortcut: 'P' },
      { id: 'l5', name: '地名', value: 'LOCATION', color: '#52c41a', shortcut: 'L' },
      { id: 'l6', name: '机构名', value: 'ORG', color: '#722ed1', shortcut: 'O' },
      { id: 'l7', name: '时间', value: 'TIME', color: '#fa8c16', shortcut: 'T' },
    ],
    config: {
      allowMultiple: false,
      required: true,
    },
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: 'lt3',
    name: '文本分类多标签模板',
    type: 'multi_label',
    description: '支持多标签的文本分类模板',
    labels: [
      { id: 'l8', name: '科技', value: 'tech', color: '#1890ff', shortcut: '1' },
      { id: 'l9', name: '财经', value: 'finance', color: '#52c41a', shortcut: '2' },
      { id: 'l10', name: '体育', value: 'sports', color: '#faad14', shortcut: '3' },
      { id: 'l11', name: '娱乐', value: 'entertainment', color: '#eb2f96', shortcut: '4' },
    ],
    config: {
      allowMultiple: true,
      required: true,
    },
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
];

const mockProjects: AnnotationProject[] = [
  {
    id: 'p1',
    name: '情感分析标注项目',
    description: '对用户评论进行情感分析标注',
    datasetId: 'ds1',
    datasetVersion: 'v1.1',
    taskType: 'text_classification',
    labelTemplateId: 'lt1',
    status: 'active',
    ownerId: '1',
    annotatorIds: ['1', '2'],
    reviewerIds: ['1'],
    totalTasks: 100,
    completedTasks: 75,
    reviewingTasks: 15,
    approvedTasks: 60,
    rejectedTasks: 5,
    config: {
      allowMultipleAnnotations: false,
      requireReview: true,
      minAgreement: 0.8,
    },
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-01T16:30:00Z',
  },
  {
    id: 'p2',
    name: '命名实体识别项目',
    description: '对新闻文本进行命名实体识别标注',
    datasetId: 'ds3',
    datasetVersion: 'v1.0',
    taskType: 'sequence_labeling',
    labelTemplateId: 'lt2',
    status: 'active',
    ownerId: '1',
    annotatorIds: ['1', '2', '3'],
    reviewerIds: ['1'],
    totalTasks: 200,
    completedTasks: 120,
    reviewingTasks: 30,
    approvedTasks: 90,
    rejectedTasks: 10,
    config: {
      allowMultipleAnnotations: true,
      requireReview: true,
      minAgreement: 0.85,
    },
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-10T14:20:00Z',
  },
  {
    id: 'p3',
    name: '多轮对话标注项目',
    description: '对多轮对话进行意图和槽位标注',
    datasetId: 'ds4',
    datasetVersion: 'v1.0',
    taskType: 'dialogue',
    status: 'paused',
    ownerId: '1',
    annotatorIds: ['2'],
    reviewerIds: ['1'],
    totalTasks: 50,
    completedTasks: 20,
    reviewingTasks: 5,
    approvedTasks: 15,
    rejectedTasks: 2,
    config: {
      allowMultipleAnnotations: false,
      requireReview: true,
    },
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-12T09:15:00Z',
  },
];

const mockTasks: AnnotationTask[] = [
  {
    id: 't1',
    projectId: 'p1',
    sampleId: 'sample1',
    assigneeId: '1',
    reviewerId: '1',
    status: 'approved',
    annotations: [],
    reviewedAt: '2024-01-25T10:30:00Z',
    reviewedBy: '1',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-25T10:30:00Z',
  },
  {
    id: 't2',
    projectId: 'p1',
    sampleId: 'sample2',
    assigneeId: '2',
    reviewerId: '1',
    status: 'reviewing',
    annotations: [],
    createdAt: '2024-01-20T09:05:00Z',
    updatedAt: '2024-01-28T14:20:00Z',
  },
  {
    id: 't3',
    projectId: 'p2',
    sampleId: 'sample3',
    assigneeId: '1',
    reviewerId: '1',
    status: 'in_progress',
    annotations: [],
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-02-08T11:15:00Z',
  },
  {
    id: 't4',
    projectId: 'p2',
    sampleId: 'sample4',
    assigneeId: '2',
    status: 'pending',
    annotations: [],
    createdAt: '2024-02-05T10:05:00Z',
    updatedAt: '2024-02-05T10:05:00Z',
  },
  {
    id: 't5',
    projectId: 'p3',
    sampleId: 'sample5',
    assigneeId: '2',
    status: 'completed',
    annotations: [],
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-11T15:30:00Z',
  },
];

const mockResults: AnnotationResult[] = [
  {
    id: 'r1',
    taskId: 't1',
    annotatorId: '1',
    labels: [
      { labelId: 'l1', labelName: '正面', value: 'positive' },
    ],
    confidence: 0.95,
    duration: 120,
    createdAt: '2024-01-22T10:00:00Z',
  },
  {
    id: 'r2',
    taskId: 't2',
    annotatorId: '2',
    labels: [
      { labelId: 'l2', labelName: '负面', value: 'negative' },
    ],
    confidence: 0.88,
    duration: 95,
    createdAt: '2024-01-26T14:20:00Z',
  },
  {
    id: 'r3',
    taskId: 't3',
    annotatorId: '1',
    labels: [
      { labelId: 'l4', labelName: '人名', value: 'PERSON', start: 0, end: 2 },
      { labelId: 'l5', labelName: '地名', value: 'LOCATION', start: 5, end: 8 },
    ],
    confidence: 0.92,
    duration: 180,
    createdAt: '2024-02-06T09:30:00Z',
  },
];

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  projects: mockProjects,
  tasks: mockTasks,
  results: mockResults,
  labelTemplates: mockLabelTemplates,
  
  addProject: (project) => {
    const newProject: AnnotationProject = {
      ...project,
      id: Date.now().toString(),
      totalTasks: 0,
      completedTasks: 0,
      reviewingTasks: 0,
      approvedTasks: 0,
      rejectedTasks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
  },
  
  updateProject: (id, project) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id
          ? { ...p, ...project, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
    
    // 更新项目统计
    if (project.totalTasks !== undefined || project.completedTasks !== undefined) {
      const tasks = get().tasks.filter((t) => t.projectId === id);
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
      const reviewingTasks = tasks.filter((t) => t.status === 'reviewing').length;
      const approvedTasks = tasks.filter((t) => t.status === 'approved').length;
      const rejectedTasks = tasks.filter((t) => t.status === 'rejected').length;
      
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id
            ? {
                ...p,
                totalTasks,
                completedTasks,
                reviewingTasks,
                approvedTasks,
                rejectedTasks,
                updatedAt: new Date().toISOString(),
              }
            : p
        ),
      }));
    }
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.projectId !== id),
      results: state.results.filter((r) => {
        const task = state.tasks.find((t) => t.id === r.taskId);
        return task && task.projectId !== id;
      }),
    }));
  },
  
  addTask: (task) => {
    const newTask: AnnotationTask = {
      ...task,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
    
    // 更新项目统计
    const project = get().projects.find((p) => p.id === task.projectId);
    if (project) {
      get().updateProject(project.id, {});
    }
  },
  
  addTasks: (tasks) => {
    const newTasks: AnnotationTask[] = tasks.map((task) => ({
      ...task,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      annotations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    set((state) => ({
      tasks: [...state.tasks, ...newTasks],
    }));
    
    // 更新项目统计
    if (tasks.length > 0) {
      const projectId = tasks[0].projectId;
      const project = get().projects.find((p) => p.id === projectId);
      if (project) {
        get().updateProject(project.id, {});
      }
    }
  },
  
  updateTask: (id, task) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, ...task, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
    
    // 更新项目统计
    const updatedTask = get().tasks.find((t) => t.id === id);
    if (updatedTask) {
      const project = get().projects.find((p) => p.id === updatedTask.projectId);
      if (project) {
        get().updateProject(project.id, {});
      }
    }
  },
  
  deleteTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      results: state.results.filter((r) => r.taskId !== id),
    }));
    
    // 更新项目统计
    if (task) {
      const project = get().projects.find((p) => p.id === task.projectId);
      if (project) {
        get().updateProject(project.id, {});
      }
    }
  },
  
  addResult: (result) => {
    const newResult: AnnotationResult = {
      ...result,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      results: [...state.results, newResult],
    }));
    
    // 更新任务状态
    const task = get().tasks.find((t) => t.id === result.taskId);
    if (task) {
      const updatedAnnotations = [...(task.annotations || []), newResult];
      get().updateTask(task.id, {
        annotations: updatedAnnotations,
        status: 'completed',
      });
    }
  },
  
  updateResult: (id, result) => {
    set((state) => ({
      results: state.results.map((r) =>
        r.id === id ? { ...r, ...result } : r
      ),
    }));
  },
  
  deleteResult: (id) => {
    const result = get().results.find((r) => r.id === id);
    set((state) => ({
      results: state.results.filter((r) => r.id !== id),
    }));
    
    // 更新任务
    if (result) {
      const task = get().tasks.find((t) => t.id === result.taskId);
      if (task) {
        const updatedAnnotations = task.annotations.filter((a) => a.id !== id);
        get().updateTask(task.id, {
          annotations: updatedAnnotations,
          status: updatedAnnotations.length === 0 ? 'pending' : 'completed',
        });
      }
    }
  },
  
  addLabelTemplate: (template) => {
    const newTemplate: LabelTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      labelTemplates: [...state.labelTemplates, newTemplate],
    }));
  },
  
  updateLabelTemplate: (id, template) => {
    set((state) => ({
      labelTemplates: state.labelTemplates.map((t) =>
        t.id === id
          ? { ...t, ...template, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },
  
  deleteLabelTemplate: (id) => {
    set((state) => ({
      labelTemplates: state.labelTemplates.filter((t) => t.id !== id),
    }));
  },
  
  getProjectTasks: (projectId) => {
    return get().tasks.filter((t) => t.projectId === projectId);
  },
  
  getUserTasks: (userId) => {
    return get().tasks.filter(
      (t) => t.assigneeId === userId || t.reviewerId === userId
    );
  },
  
  getTaskResults: (taskId) => {
    return get().results.filter((r) => r.taskId === taskId);
  },
}));


