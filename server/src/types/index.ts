// 共享类型定义（与前端保持一致）

export interface User {
  id: string;
  username: string;
  nickname?: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'other';
  config: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionTask {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  status: 'draft' | 'running' | 'completed' | 'failed';
  cron?: string;
  cronDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dataset {
  id: string;
  name: string;
  type: string;
  format: string;
  sourceType: string;
  sourceId: string;
  dataUsage: string;
  sampleCount: number;
  isPublished: boolean;
  versions: Array<{
    version: string;
    sampleCount: number;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type AnnotationTaskType =
  | 'text_classification'
  | 'text_qa'
  | 'sequence_labeling'
  | 'multi_label'
  | 'dialogue'
  | 'text_summarization'
  | 'text_generation'
  | 'text_translation'
  | 'sentiment_analysis'
  | 'text_similarity'
  | 'text_entailment'
  | 'text_clustering'
  | 'named_entity_recognition'
  | 'relation_extraction'
  | 'event_extraction'
  | 'text_correction'
  | 'image_classification'
  | 'object_detection'
  | 'image_segmentation'
  | 'image_qa'
  | 'image_captioning'
  | 'ocr'
  | 'face_recognition'
  | 'image_retrieval'
  | 'image_super_resolution'
  | 'image_denoising'
  | 'keypoint_detection'
  | 'pose_estimation'
  | 'image_generation'
  | 'audio_classification'
  | 'speech_recognition'
  | 'speech_synthesis'
  | 'audio_segmentation'
  | 'speaker_diarization'
  | 'emotion_recognition'
  | 'music_classification'
  | 'audio_denoising'
  | 'video_classification'
  | 'video_object_detection'
  | 'video_segmentation'
  | 'action_recognition'
  | 'video_captioning'
  | 'video_qa'
  | 'video_summarization'
  | 'video_tracking'
  | 'multimodal_classification'
  | 'image_text_matching'
  | 'video_text_matching'
  | 'multimodal_qa'
  | 'visual_question_answering'
  | 'custom';

export interface LabelTemplate {
  id: string;
  name: string;
  taskType: AnnotationTaskType;
  description?: string;
  labels: Array<{
    id: string;
    name: string;
    value: string | number | boolean;
    color?: string;
  }>;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationProject {
  id: string;
  name: string;
  description?: string;
  datasetId: string;
  datasetVersion?: string;
  taskType: AnnotationTaskType;
  labelTemplateId?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  ownerId: string;
  annotatorIds: string[];
  reviewerIds: string[];
  totalTasks: number;
  completedTasks: number;
  reviewingTasks: number;
  approvedTasks: number;
  rejectedTasks: number;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationTask {
  id: string;
  projectId: string;
  sampleId: string;
  assigneeId?: string;
  reviewerId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewing' | 'approved' | 'rejected';
  annotations: any[];
  reviewComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationResult {
  id: string;
  taskId: string;
  annotatorId: string;
  labels: Array<{
    labelId: string;
    labelName: string;
    value: string | number | boolean;
    [key: string]: any;
  }>;
  content?: Record<string, any>;
  confidence?: number;
  duration?: number;
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  endpoint: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SceneConfig {
  id: string;
  sceneName: string;
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancementTask {
  id: string;
  name: string;
  datasetId: string;
  sceneConfigId: string;
  status: 'draft' | 'running' | 'completed' | 'failed';
  progress?: number;
  resultDatasetId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}




