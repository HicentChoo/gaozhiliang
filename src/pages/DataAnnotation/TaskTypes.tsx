import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Tag,
  Button,
  Modal,
  Descriptions,
} from 'antd';
import {
  EyeOutlined,
  // 文本类图标
  FileTextOutlined,
  QuestionCircleOutlined,
  HighlightOutlined,
  TagsOutlined,
  MessageOutlined,
  FileSearchOutlined,
  EditOutlined,
  TranslationOutlined,
  HeartOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  UserOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  // 图像类图标
  PictureOutlined,
  BorderOutlined,
  ScanOutlined,
  CameraOutlined,
  EyeInvisibleOutlined,
  BarcodeOutlined,
  SmileOutlined,
  SearchOutlined,
  ZoomInOutlined,
  ToolOutlined,
  AimOutlined,
  RobotOutlined,
  // 音频类图标
  SoundOutlined,
  AudioOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  // 视频类图标
  VideoCameraOutlined,
  PlayCircleOutlined,
  // 多模态图标
  AppstoreOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import {
  TASK_TYPE_CATEGORIES,
  type TaskTypeCategory,
  type TaskTypeOption,
  type AnnotationTaskType,
} from '../../store/annotationStore';
import './TaskTypes.css';

// 任务类型图标映射
const TASK_TYPE_ICONS: Record<AnnotationTaskType, React.ReactNode> = {
  // 文本类
  text_classification: <FileTextOutlined />,
  text_qa: <QuestionCircleOutlined />,
  sequence_labeling: <HighlightOutlined />,
  multi_label: <TagsOutlined />,
  dialogue: <MessageOutlined />,
  text_summarization: <FileSearchOutlined />,
  text_generation: <EditOutlined />,
  text_translation: <TranslationOutlined />,
  sentiment_analysis: <HeartOutlined />,
  text_similarity: <LinkOutlined />,
  text_entailment: <CheckCircleOutlined />,
  text_clustering: <ApartmentOutlined />,
  named_entity_recognition: <UserOutlined />,
  relation_extraction: <TeamOutlined />,
  event_extraction: <ThunderboltOutlined />,
  text_correction: <EditOutlined />,
  // 图像类
  image_classification: <PictureOutlined />,
  object_detection: <BorderOutlined />,
  image_segmentation: <ScanOutlined />,
  image_qa: <CameraOutlined />,
  image_captioning: <EyeInvisibleOutlined />,
  ocr: <BarcodeOutlined />,
  face_recognition: <SmileOutlined />,
  image_retrieval: <SearchOutlined />,
  image_super_resolution: <ZoomInOutlined />,
  image_denoising: <ToolOutlined />,
  keypoint_detection: <AimOutlined />,
  pose_estimation: <RobotOutlined />,
  image_generation: <PictureOutlined />,
  // 音频类
  audio_classification: <SoundOutlined />,
  speech_recognition: <AudioOutlined />,
  speech_synthesis: <CustomerServiceOutlined />,
  audio_segmentation: <PhoneOutlined />,
  speaker_diarization: <UserOutlined />,
  emotion_recognition: <HeartOutlined />,
  music_classification: <SoundOutlined />,
  audio_denoising: <ToolOutlined />,
  // 视频类
  video_classification: <VideoCameraOutlined />,
  video_object_detection: <BorderOutlined />,
  video_segmentation: <ScanOutlined />,
  action_recognition: <PlayCircleOutlined />,
  video_captioning: <EyeInvisibleOutlined />,
  video_qa: <QuestionCircleOutlined />,
  video_summarization: <FileSearchOutlined />,
  video_tracking: <AimOutlined />,
  // 多模态类
  multimodal_classification: <AppstoreOutlined />,
  image_text_matching: <FileImageOutlined />,
  video_text_matching: <VideoCameraOutlined />,
  multimodal_qa: <QuestionCircleOutlined />,
  visual_question_answering: <CameraOutlined />,
  // 其他
  custom: <TagsOutlined />,
};

// 任务类型颜色映射（用于渐变背景）
const TASK_TYPE_COLORS: Record<string, { from: string; to: string }> = {
  text: { from: '#667eea', to: '#764ba2' }, // 紫色渐变
  image: { from: '#f093fb', to: '#f5576c' }, // 粉色渐变
  audio: { from: '#4facfe', to: '#00f2fe' }, // 蓝色渐变
  video: { from: '#43e97b', to: '#38f9d7' }, // 绿色渐变
  multimodal: { from: '#fa709a', to: '#fee140' }, // 橙红渐变
  other: { from: '#a8edea', to: '#fed6e3' }, // 青绿渐变
};

// 获取任务类型的图标
const getTaskTypeIcon = (type: AnnotationTaskType): React.ReactNode => {
  return TASK_TYPE_ICONS[type] || <TagsOutlined />;
};

// 获取任务类型的渐变颜色
const getTaskTypeGradient = (categoryValue: string): { from: string; to: string } => {
  return TASK_TYPE_COLORS[categoryValue] || TASK_TYPE_COLORS.other;
};

const TaskTypes: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    TASK_TYPE_CATEGORIES[0]?.value || ''
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingTaskType, setViewingTaskType] = useState<{
    category: TaskTypeCategory;
    option: TaskTypeOption;
  } | null>(null);

  // 获取当前选中的分类
  const currentCategory = TASK_TYPE_CATEGORIES.find(
    (cat) => cat.value === selectedCategory
  );

  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
  };

  const handleView = (category: TaskTypeCategory, option: TaskTypeOption) => {
    setViewingTaskType({ category, option });
    setDetailModalVisible(true);
  };

  return (
    <div className="task-types-container">
      <div className="task-types-layout">
        {/* 左侧：一级分类列表 */}
        <div className="task-types-sidebar">
          <Card
            title="任务类型分类"
            bordered={false}
            style={{ height: '100%' }}
          >
            <div className="category-list">
              {TASK_TYPE_CATEGORIES.map((category) => (
                <div
                  key={category.value}
                  className={`category-item ${
                    selectedCategory === category.value ? 'active' : ''
                  }`}
                  onClick={() => handleCategorySelect(category.value)}
                >
                  <span className="category-label">{category.label}</span>
                  <span className="category-count">({category.children.length})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 右侧：二级分类卡片网格 */}
        <div className="task-types-content">
          <Card
            title={currentCategory?.label || '选择分类'}
            bordered={false}
            style={{ minHeight: '600px' }}
          >
            {currentCategory && (
              <Row gutter={[16, 16]}>
                {currentCategory.children.map((option) => (
                  <Col key={option.value} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      className="task-type-card"
                      cover={
                        <div
                          className="task-type-image-wrapper"
                          style={{
                            background: `linear-gradient(135deg, ${getTaskTypeGradient(currentCategory.value).from} 0%, ${getTaskTypeGradient(currentCategory.value).to} 100%)`,
                          }}
                        >
                          <div className="task-type-icon">
                            {getTaskTypeIcon(option.value as AnnotationTaskType)}
                          </div>
                        </div>
                      }
                      actions={[
                        <Button
                          key="view"
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handleView(currentCategory, option)}
                        >
                          查看详情
                        </Button>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <div className="task-type-title">
                            <Tag color="blue">{option.label}</Tag>
                          </div>
                        }
                        description={
                          <div className="task-type-description">
                            {option.description || '暂无描述'}
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </div>
      </div>

      {/* 详情模态框 */}
      <Modal
        title="任务类型详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingTaskType(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setViewingTaskType(null);
            }}
          >
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingTaskType && (
          <div>
            <div
              style={{
                marginBottom: 16,
                textAlign: 'center',
                padding: '40px',
                borderRadius: 8,
                background: `linear-gradient(135deg, ${getTaskTypeGradient(viewingTaskType.category.value).from} 0%, ${getTaskTypeGradient(viewingTaskType.category.value).to} 100%)`,
              }}
            >
              <div
                style={{
                  fontSize: '64px',
                  color: '#fff',
                  display: 'inline-block',
                }}
              >
                {getTaskTypeIcon(viewingTaskType.option.value as AnnotationTaskType)}
              </div>
            </div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="类型名称">
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {viewingTaskType.option.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="类型标识">
                <code style={{ fontSize: '13px' }}>{viewingTaskType.option.value}</code>
              </Descriptions.Item>
              <Descriptions.Item label="所属分类">
                <Tag>{viewingTaskType.category.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="详细描述">
                {viewingTaskType.option.description || '-'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskTypes;



