import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Tag,
  Radio,
  Checkbox,
  Input,
  message,
  Progress,
  Divider,
  Alert,
  Slider,
  Image,
  List,
  Avatar,
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  HighlightOutlined,
} from '@ant-design/icons';
import { useAnnotationStore } from '../../store/annotationStore';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import type { LabelResult } from '../../store/annotationStore';

const { TextArea } = Input;

const Annotate: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { tasks, projects, labelTemplates, addResult, updateTask } = useAnnotationStore();
  const { datasets, datasets: allDatasets } = useDataStore();
  const { user } = useAuthStore();

  const task = tasks.find((t) => t.id === taskId);
  const project = task ? projects.find((p) => p.id === task.projectId) : null;
  const template = project
    ? labelTemplates.find((t) => t.id === project.labelTemplateId)
    : null;
  const dataset = project
    ? allDatasets.find((d) => d.id === project.datasetId)
    : null;

  const [selectedLabels, setSelectedLabels] = useState<LabelResult[]>([]);
  const [customText, setCustomText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // 序列标注相关状态
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string } | null>(null);
  const [sequenceAnnotations, setSequenceAnnotations] = useState<Array<{ start: number; end: number; labelId: string; labelName: string; text: string }>>([]);
  const [currentLabelForSequence, setCurrentLabelForSequence] = useState<string>('');
  const textRef = useRef<HTMLDivElement>(null);

  // 获取当前项目的所有任务
  const projectTasks = task
    ? tasks.filter((t) => t.projectId === task.projectId)
    : [];
  const currentIndex = projectTasks.findIndex((t) => t.id === taskId);
  const prevTask = currentIndex > 0 ? projectTasks[currentIndex - 1] : null;
  const nextTask =
    currentIndex < projectTasks.length - 1
      ? projectTasks[currentIndex + 1]
      : null;

  useEffect(() => {
    if (task && task.annotations && task.annotations.length > 0) {
      // 加载已有的标注结果
      const latestAnnotation = task.annotations[task.annotations.length - 1];
      if (latestAnnotation && latestAnnotation.labels) {
        setSelectedLabels(latestAnnotation.labels);
      }
      // 加载序列标注结果
      if (latestAnnotation && latestAnnotation.content?.sequenceAnnotations) {
        setSequenceAnnotations(latestAnnotation.content.sequenceAnnotations);
      }
    }
  }, [task]);
  
  // 处理文本选择（用于序列标注）
  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      setSelectedText(null);
      return;
    }
    
    const text = sampleData.content.text;
    const start = range.startOffset;
    const end = range.endOffset;
    const selectedTextStr = text.substring(start, end);
    
    setSelectedText({ start, end, text: selectedTextStr });
  };
  
  // 添加序列标注
  const handleAddSequenceAnnotation = (labelId: string) => {
    if (!selectedText || !labelId) {
      message.warning('请先选择文本和标签');
      return;
    }
    
    const label = template.labels.find((l) => l.id === labelId);
    if (!label) return;
    
    // 检查是否与已有标注重叠
    const overlaps = sequenceAnnotations.some(
      (ann) =>
        (selectedText.start >= ann.start && selectedText.start < ann.end) ||
        (selectedText.end > ann.start && selectedText.end <= ann.end) ||
        (selectedText.start <= ann.start && selectedText.end >= ann.end)
    );
    
    if (overlaps) {
      message.warning('标注范围与已有标注重叠');
      return;
    }
    
    const newAnnotation = {
      start: selectedText.start,
      end: selectedText.end,
      labelId: label.id,
      labelName: label.name,
      text: selectedText.text,
    };
    
    setSequenceAnnotations([...sequenceAnnotations, newAnnotation].sort((a, b) => a.start - b.start));
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
    message.success('标注已添加');
  };
  
  // 删除序列标注
  const handleRemoveSequenceAnnotation = (index: number) => {
    setSequenceAnnotations(sequenceAnnotations.filter((_, i) => i !== index));
  };
  
  // 渲染带标注的文本（序列标注）
  const renderAnnotatedText = () => {
    const text = sampleData.content.text;
    if (!text) return null;
    
    const parts: Array<{ text: string; label?: string; color?: string }> = [];
    let lastIndex = 0;
    
    // 按起始位置排序
    const sortedAnnotations = [...sequenceAnnotations].sort((a, b) => a.start - b.start);
    
    sortedAnnotations.forEach((ann) => {
      // 添加标注前的文本
      if (ann.start > lastIndex) {
        parts.push({ text: text.substring(lastIndex, ann.start) });
      }
      
      // 添加标注的文本
      const label = template.labels.find((l) => l.id === ann.labelId);
      parts.push({
        text: text.substring(ann.start, ann.end),
        label: ann.labelName,
        color: label?.color,
      });
      
      lastIndex = ann.end;
    });
    
    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex) });
    }
    
    return (
      <div
        ref={textRef}
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '4px',
          lineHeight: '1.8',
          fontSize: '16px',
          userSelect: 'text',
          cursor: 'text',
        }}
        onMouseUp={handleTextSelect}
      >
        {parts.map((part, index) => {
          if (part.label) {
            return (
              <span
                key={index}
                style={{
                  background: part.color || '#1890ff',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  margin: '0 2px',
                  cursor: 'pointer',
                }}
                title={part.label}
                onClick={() => {
                  const annIndex = sequenceAnnotations.findIndex(
                    (ann) => ann.start <= index && ann.end > index
                  );
                  if (annIndex >= 0) {
                    handleRemoveSequenceAnnotation(annIndex);
                  }
                }}
              >
                {part.text}
              </span>
            );
          }
          return <span key={index}>{part.text}</span>;
        })}
      </div>
    );
  };

  if (!task || !project || !template) {
    return <div>任务不存在或数据不完整</div>;
  }

  // 从数据集获取样本数据
  const getSampleData = () => {
    // 模拟从数据集获取样本数据
    // 实际应该根据 task.sampleId 从数据集store中获取
    const mockSamples: Record<string, any> = {
      'sample_1': {
        text: '北京是中华人民共和国的首都，是一座历史悠久的城市。',
        prompt: '什么是人工智能？',
        response: '人工智能是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。',
      },
      'sample_2': {
        text: '上海是中国最大的城市之一，位于长江入海口。',
        prompt: '什么是机器学习？',
        response: '机器学习是人工智能的一个子领域，通过算法让计算机从数据中学习。',
      },
    };
    
    const defaultSample = {
      text: '这是一个示例文本，用于演示标注功能。',
      prompt: '什么是人工智能？',
      response: '人工智能是计算机科学的一个分支...',
    };
    
    return {
      id: task.sampleId,
      content: mockSamples[task.sampleId] || defaultSample,
    };
  };
  
  const sampleData = getSampleData();

  const handleLabelChange = (labelId: string, checked: boolean) => {
    const label = template.labels.find((l) => l.id === labelId);
    if (!label) return;

    if (template.config.allowMultiple) {
      // 多选模式
      if (checked) {
        setSelectedLabels([
          ...selectedLabels,
          {
            labelId: label.id,
            labelName: label.name,
            value: label.value,
          },
        ]);
      } else {
        setSelectedLabels(selectedLabels.filter((l) => l.labelId !== labelId));
      }
    } else {
      // 单选模式
      setSelectedLabels(
        checked
          ? [
              {
                labelId: label.id,
                labelName: label.name,
                value: label.value,
              },
            ]
          : []
      );
    }
  };

  const handleSave = async () => {
    // 验证必填项
    if (template.config.required) {
      if (project.taskType === 'sequence_labeling' || project.taskType === 'named_entity_recognition') {
        if (sequenceAnnotations.length === 0) {
          message.warning('请至少添加一个标注');
          return;
        }
      } else {
        if (selectedLabels.length === 0) {
          message.warning('请至少选择一个标签');
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      // 准备标注内容
      let content: Record<string, any> = {};
      if (customText) {
        content.customText = customText;
      }
      if (sequenceAnnotations.length > 0) {
        content.sequenceAnnotations = sequenceAnnotations;
      }

      // 创建标注结果
      addResult({
        taskId: task.id,
        annotatorId: user?.id || '1',
        labels: selectedLabels,
        content: Object.keys(content).length > 0 ? content : undefined,
        confidence: 1.0,
      });

      // 更新任务状态
      updateTask(task.id, {
        status: 'completed',
      });

      message.success('标注已保存');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (nextTask) {
      navigate(`/data-annotation/annotate/${nextTask.id}`);
    }
  };

  const handlePrev = () => {
    if (prevTask) {
      navigate(`/data-annotation/annotate/${prevTask.id}`);
    }
  };

  const progress =
    projectTasks.length > 0
      ? ((currentIndex + 1) / projectTasks.length) * 100
      : 0;

  // 根据任务类型渲染不同的标注界面
  const renderAnnotationArea = () => {
    switch (project.taskType) {
      case 'text_classification':
      case 'multi_label':
        return (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <strong>文本内容：</strong>
              <div style={{ marginTop: 8 }}>{sampleData.content.text}</div>
            </div>
            <Divider>选择标签</Divider>
            {template.config.allowMultiple ? (
              <Checkbox.Group
                value={selectedLabels.map((l) => l.labelId)}
                onChange={(checkedValues) => {
                  const checkedSet = new Set(checkedValues as string[]);
                  const newLabels = template.labels
                    .filter((l) => checkedSet.has(l.id))
                    .map((l) => ({
                      labelId: l.id,
                      labelName: l.name,
                      value: l.value,
                    }));
                  setSelectedLabels(newLabels);
                }}
              >
                <Space direction="vertical">
                  {template.labels.map((label) => (
                    <Checkbox key={label.id} value={label.id}>
                      <Tag color={label.color}>{label.name}</Tag>
                      {label.shortcut && (
                        <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                          ({label.shortcut})
                        </span>
                      )}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            ) : (
              <Radio.Group
                value={selectedLabels[0]?.labelId}
                onChange={(e) => {
                  const labelId = e.target.value;
                  handleLabelChange(labelId, true);
                }}
              >
                <Space direction="vertical">
                  {template.labels.map((label) => (
                    <Radio key={label.id} value={label.id}>
                      <Tag color={label.color}>{label.name}</Tag>
                      {label.shortcut && (
                        <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
                          ({label.shortcut})
                        </span>
                      )}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
          </div>
        );

      case 'sequence_labeling':
      case 'named_entity_recognition':
        return (
          <div>
            <Alert
              message="序列标注说明"
              description="请用鼠标选择文本中的实体，然后选择对应的标签进行标注。点击已标注的文本可以删除标注。"
              type="info"
              style={{ marginBottom: 16 }}
            />
            <div style={{ marginBottom: 16 }}>
              <strong>文本内容：</strong>
              {renderAnnotatedText()}
            </div>
            {selectedText && (
              <Alert
                message={`已选择文本: "${selectedText.text}"`}
                description={`位置: ${selectedText.start} - ${selectedText.end}`}
                type="success"
                style={{ marginBottom: 16 }}
                action={
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedText(null);
                      window.getSelection()?.removeAllRanges();
                    }}
                  >
                    取消选择
                  </Button>
                }
              />
            )}
            <Divider>选择标签</Divider>
            <Space wrap>
              {template.labels.map((label) => (
                <Button
                  key={label.id}
                  type={currentLabelForSequence === label.id ? 'primary' : 'default'}
                  onClick={() => {
                    if (selectedText) {
                      handleAddSequenceAnnotation(label.id);
                    } else {
                      setCurrentLabelForSequence(label.id);
                      message.info('请先选择要标注的文本');
                    }
                  }}
                  style={{
                    borderColor: label.color,
                    color: currentLabelForSequence === label.id ? '#fff' : label.color,
                    background: currentLabelForSequence === label.id ? label.color : undefined,
                  }}
                >
                  <Tag color={label.color}>{label.name}</Tag>
                  {label.shortcut && (
                    <span style={{ marginLeft: 4, fontSize: '12px' }}>({label.shortcut})</span>
                  )}
                </Button>
              ))}
            </Space>
            {sequenceAnnotations.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Divider>已标注实体</Divider>
                <List
                  size="small"
                  dataSource={sequenceAnnotations}
                  renderItem={(ann, index) => {
                    const label = template.labels.find((l) => l.id === ann.labelId);
                    return (
                      <List.Item
                        actions={[
                          <Button
                            type="link"
                            danger
                            onClick={() => handleRemoveSequenceAnnotation(index)}
                          >
                            删除
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Tag color={label?.color}>{ann.labelName}</Tag>}
                          title={ann.text}
                          description={`位置: ${ann.start} - ${ann.end}`}
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
          </div>
        );

      case 'text_qa':
        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <strong>问题：</strong>
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4, marginTop: 8 }}>
                  {sampleData.content.prompt}
                </div>
              </div>
              <div>
                <strong>回答：</strong>
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4, marginTop: 8 }}>
                  {sampleData.content.response}
                </div>
              </div>
            </div>
            <Divider>标注信息</Divider>
            <div style={{ marginBottom: 16 }}>
              <label>质量评分：</label>
              <Radio.Group
                value={selectedLabels.find((l) => l.labelName === 'quality')?.value}
                onChange={(e) => {
                  const newLabels = selectedLabels.filter((l) => l.labelName !== 'quality');
                  newLabels.push({
                    labelId: 'quality',
                    labelName: 'quality',
                    value: e.target.value,
                  });
                  setSelectedLabels(newLabels);
                }}
              >
                <Radio value="excellent">优秀</Radio>
                <Radio value="good">良好</Radio>
                <Radio value="fair">一般</Radio>
                <Radio value="poor">较差</Radio>
              </Radio.Group>
            </div>
            <div>
              <label>备注：</label>
              <TextArea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="请输入备注信息（可选）"
              />
            </div>
          </div>
        );

      case 'dialogue':
        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <List
                dataSource={[
                  { role: '用户', content: sampleData.content.prompt || '你好，我想了解一下产品信息。' },
                  { role: '助手', content: sampleData.content.response || '您好！很高兴为您服务，请问您想了解哪方面的信息？' },
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: index === 0 ? '#1890ff' : '#52c41a' }}>{item.role === '用户' ? 'U' : 'A'}</Avatar>}
                      title={item.role}
                      description={
                        <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                          {item.content}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
            <Divider>标注信息</Divider>
            <div style={{ marginBottom: 16 }}>
              <label>对话质量：</label>
              <Radio.Group
                value={selectedLabels.find((l) => l.labelName === 'quality')?.value}
                onChange={(e) => {
                  const newLabels = selectedLabels.filter((l) => l.labelName !== 'quality');
                  newLabels.push({
                    labelId: 'quality',
                    labelName: 'quality',
                    value: e.target.value,
                  });
                  setSelectedLabels(newLabels);
                }}
              >
                <Radio value="excellent">优秀</Radio>
                <Radio value="good">良好</Radio>
                <Radio value="fair">一般</Radio>
                <Radio value="poor">较差</Radio>
              </Radio.Group>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>对话类型：</label>
              <Checkbox.Group
                value={selectedLabels.filter((l) => l.labelName !== 'quality').map((l) => l.value)}
                onChange={(checkedValues) => {
                  const qualityLabel = selectedLabels.find((l) => l.labelName === 'quality');
                  const newLabels = (checkedValues as string[]).map((value) => ({
                    labelId: value,
                    labelName: value,
                    value: value,
                  }));
                  if (qualityLabel) {
                    newLabels.push(qualityLabel);
                  }
                  setSelectedLabels(newLabels);
                }}
              >
                <Space>
                  <Checkbox value="咨询">咨询</Checkbox>
                  <Checkbox value="投诉">投诉</Checkbox>
                  <Checkbox value="建议">建议</Checkbox>
                  <Checkbox value="其他">其他</Checkbox>
                </Space>
              </Checkbox.Group>
            </div>
            <div>
              <label>备注：</label>
              <TextArea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="请输入备注信息（可选）"
              />
            </div>
          </div>
        );

      case 'image_classification':
      case 'object_detection':
      case 'image_segmentation':
        return (
          <div>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Image
                width={600}
                src="https://via.placeholder.com/600x400?text=示例图像"
                alt="标注图像"
                style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
              />
            </div>
            <Divider>选择标签</Divider>
            {template.config.allowMultiple ? (
              <Checkbox.Group
                value={selectedLabels.map((l) => l.labelId)}
                onChange={(checkedValues) => {
                  const checkedSet = new Set(checkedValues as string[]);
                  const newLabels = template.labels
                    .filter((l) => checkedSet.has(l.id))
                    .map((l) => ({
                      labelId: l.id,
                      labelName: l.name,
                      value: l.value,
                    }));
                  setSelectedLabels(newLabels);
                }}
              >
                <Space wrap>
                  {template.labels.map((label) => (
                    <Checkbox key={label.id} value={label.id}>
                      <Tag color={label.color}>{label.name}</Tag>
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            ) : (
              <Radio.Group
                value={selectedLabels[0]?.labelId}
                onChange={(e) => {
                  const labelId = e.target.value;
                  handleLabelChange(labelId, true);
                }}
              >
                <Space wrap>
                  {template.labels.map((label) => (
                    <Radio key={label.id} value={label.id}>
                      <Tag color={label.color}>{label.name}</Tag>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
            {project.taskType === 'object_detection' && (
              <div style={{ marginTop: 16 }}>
                <Alert
                  message="目标检测说明"
                  description="请在图像上绘制边界框来标注目标物体（功能开发中）"
                  type="info"
                />
              </div>
            )}
          </div>
        );

      default:
        return (
          <div>
            <Alert
              message="暂不支持此任务类型"
              description={`任务类型 "${project.taskType}" 的标注界面正在开发中。`}
              type="info"
            />
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/data-annotation/my-tasks')}
            >
              返回
            </Button>
            <span>{project.name} - 标注任务</span>
          </Space>
        }
        extra={
          <Space>
            <span>
              任务 {currentIndex + 1} / {projectTasks.length}
            </span>
            <Progress
              percent={Math.round(progress)}
              size="small"
              style={{ width: 150 }}
            />
          </Space>
        }
      >
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handlePrev}
              disabled={!prevTask}
            >
              上一个
            </Button>
            <Button
              icon={<ArrowRightOutlined />}
              onClick={handleNext}
              disabled={!nextTask}
            >
              下一个
            </Button>
            <Divider type="vertical" />
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
            >
              保存标注
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                handleSave();
                if (nextTask) {
                  setTimeout(() => handleNext(), 500);
                }
              }}
              loading={isSaving}
            >
              保存并下一个
            </Button>
          </Space>
        </div>

        <Card title="标注区域" style={{ minHeight: 400 }}>
          {renderAnnotationArea()}
        </Card>

        {task.annotations && task.annotations.length > 0 && (
          <Card title="历史标注" style={{ marginTop: 16 }}>
            {task.annotations.map((annotation, index) => (
              <div key={annotation.id} style={{ marginBottom: 16 }}>
                <div>
                  <strong>标注 #{index + 1}</strong>
                  <span style={{ marginLeft: 16, color: '#999' }}>
                    {new Date(annotation.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ marginTop: 8 }}>
                  {annotation.labels.map((label, i) => (
                    <Tag key={i} color={label.labelName === 'quality' ? 'blue' : undefined}>
                      {label.labelName}: {label.value}
                    </Tag>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        )}
      </Card>
    </div>
  );
};

export default Annotate;


