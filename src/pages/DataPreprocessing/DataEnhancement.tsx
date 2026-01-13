import React, { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Progress,
  Descriptions,
  Tooltip,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useEnhancementStore, type EnhancementTask } from '../../store/enhancementStore';
import { useDataStore } from '../../store/dataStore';
import { useToolboxStore } from '../../store/toolboxStore';
import { callQwenWithSceneConfig } from '../../api/qwenApi';
import type { DatasetSample } from '../../store/dataStore';

const DataEnhancement: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useEnhancementStore();
  const { datasets } = useDataStore();
  const { sceneConfigs, models } = useToolboxStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<EnhancementTask | null>(null);
  const [form] = Form.useForm();

  // 获取场景配置名称
  const getSceneConfigName = (sceneConfigId: string) => {
    const config = sceneConfigs.find((sc) => sc.id === sceneConfigId);
    return config ? config.sceneName : '未知配置';
  };

  // 获取数据集名称
  const getDatasetName = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    return dataset ? dataset.name : '未知数据集';
  };

  // 获取模型名称
  const getModelName = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    return model ? `${model.name} (${model.model})` : '未知模型';
  };

  // 获取场景配置详情
  const getSceneConfigDetail = (sceneConfigId: string) => {
    return sceneConfigs.find((sc) => sc.id === sceneConfigId);
  };

  // 过滤可用的场景配置（只显示启用的模型对应的场景配置）
  const availableSceneConfigs = useMemo(() => {
    const activeModelIds = new Set(models.filter((m) => m.isActive).map((m) => m.id));
    return sceneConfigs.filter((sc) => activeModelIds.has(sc.modelId));
  }, [sceneConfigs, models]);

  const handleCreate = () => {
    form.validateFields().then((values) => {
      addTask({
        name: values.name,
        datasetId: values.datasetId,
        sceneConfigId: values.sceneConfigId,
        status: 'draft',
      });
      setModalVisible(false);
      form.resetFields();
      message.success('创建成功');
    });
  };

  // 运行增强任务
  const handleRunTask = async (task: EnhancementTask) => {
    const sceneConfig = getSceneConfigDetail(task.sceneConfigId);
    if (!sceneConfig) {
      message.error('场景配置不存在');
      return;
    }

    const model = models.find((m) => m.id === sceneConfig.modelId);
    if (!model) {
      message.error('关联的模型不存在');
      return;
    }

    if (!model.isActive) {
      message.error('关联的模型未启用');
      return;
    }

    const dataset = datasets.find((d) => d.id === task.datasetId);
    if (!dataset) {
      message.error('数据集不存在');
      return;
    }

    // 更新任务状态为运行中
    updateTask(task.id, {
      status: 'running',
      progress: 0,
    });

    try {
      // 模拟获取数据集样本（实际应该从数据集store或API中获取）
      // 根据数据集格式生成模拟样本
      let mockSamples: DatasetSample[] = [];
      
      // 根据数据集格式生成不同结构的样本
      if (dataset.format.includes('system') || dataset.format.includes('prompt') || dataset.format.includes('response')) {
        // 问答对格式
        mockSamples = [
          {
            id: '1',
            content: {
              system: 'You are a helpful assistant',
              prompt: '什么是人工智能？',
              response: '人工智能是计算机科学的一个分支...',
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            content: {
              system: 'You are a helpful assistant',
              prompt: '什么是机器学习？',
              response: '机器学习是人工智能的一个子领域...',
            },
            createdAt: new Date().toISOString(),
          },
        ];
      } else {
        // 普通文本格式
        mockSamples = [
          { id: '1', content: { text: '这是一个测试样本' }, createdAt: new Date().toISOString() },
          { id: '2', content: { text: '另一个测试样本' }, createdAt: new Date().toISOString() },
        ];
      }

      const totalSamples = mockSamples.length;
      const enhancedSamples: DatasetSample[] = [];

      // 逐个处理样本
      for (let i = 0; i < mockSamples.length; i++) {
        const sample = mockSamples[i];
        
        // 根据样本格式提取文本内容
        let originalText = '';
        if (sample.content.text) {
          originalText = sample.content.text;
        } else if (sample.content.prompt && sample.content.response) {
          // 问答对格式：将prompt和response组合
          originalText = `问题：${sample.content.prompt}\n回答：${sample.content.response}`;
        } else {
          // 其他格式：转换为JSON字符串
          originalText = JSON.stringify(sample.content);
        }

        try {
          // 调用场景配置进行增强
          // 如果场景配置的prompt中包含特定字段的占位符，使用variables参数
          const variables: Record<string, string> = {};
          if (sample.content.prompt) variables.prompt = sample.content.prompt;
          if (sample.content.response) variables.response = sample.content.response;
          if (sample.content.system) variables.system = sample.content.system;
          if (sample.content.text) variables.text = sample.content.text;

          const response = await callQwenWithSceneConfig(
            model,
            sceneConfig,
            originalText,
            Object.keys(variables).length > 0 ? variables : undefined
          );

          const enhancedText = response.choices[0]?.message?.content || originalText;
          
          // 根据原始样本格式构建增强后的样本
          let enhancedContent: Record<string, any>;
          if (sample.content.prompt && sample.content.response) {
            // 问答对格式：尝试解析增强结果
            enhancedContent = {
              ...sample.content,
              enhanced: enhancedText,
              originalPrompt: sample.content.prompt,
              originalResponse: sample.content.response,
            };
          } else {
            enhancedContent = {
              ...sample.content,
              enhanced: enhancedText,
              original: originalText,
            };
          }

          enhancedSamples.push({
            id: `enhanced_${sample.id}`,
            content: enhancedContent,
            createdAt: new Date().toISOString(),
          });

          // 更新进度
          const progress = Math.round(((i + 1) / totalSamples) * 100);
          updateTask(task.id, { progress });
        } catch (error) {
          console.error(`处理样本 ${i + 1} 失败:`, error);
          // 继续处理下一个样本
        }
      }

      // 创建增强后的数据集
      const resultDatasetId = `enhanced_${task.id}_${Date.now()}`;
      
      // 更新任务状态为已完成
      updateTask(task.id, {
        status: 'completed',
        progress: 100,
        resultDatasetId,
      });

      message.success(`增强任务完成，共处理 ${enhancedSamples.length} 个样本`);
    } catch (error) {
      console.error('增强任务失败:', error);
      updateTask(task.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : '未知错误',
      });
      message.error('增强任务失败');
    }
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '源数据集',
      dataIndex: 'datasetId',
      key: 'datasetId',
      width: 200,
      render: (datasetId: string) => getDatasetName(datasetId),
    },
    {
      title: '增强方式',
      dataIndex: 'sceneConfigId',
      key: 'sceneConfigId',
      width: 200,
      render: (sceneConfigId: string) => {
        const config = getSceneConfigDetail(sceneConfigId);
        if (!config) return <Tag>未知配置</Tag>;
        const model = models.find((m) => m.id === config.modelId);
        return (
          <Tooltip
            title={
              <div>
                <div>场景: {config.sceneName}</div>
                <div>模型: {model ? `${model.name} (${model.model})` : '未知'}</div>
                {config.description && <div>描述: {config.description}</div>}
              </div>
            }
          >
            <Tag color="blue">{config.sceneName}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: EnhancementTask) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          running: { color: 'processing', text: '运行中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Tag color={config.color}>{config.text}</Tag>
            {status === 'running' && record.progress !== undefined && (
              <Progress percent={record.progress} size="small" />
            )}
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: EnhancementTask) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentTask(record);
              setDetailVisible(true);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                name: record.name,
                datasetId: record.datasetId,
                sceneConfigId: record.sceneConfigId,
              });
              setCurrentTask(record);
              setModalVisible(true);
            }}
            disabled={record.status === 'running'}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunTask(record)}
            disabled={record.status === 'running'}
          >
            运行
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个增强任务吗？',
                onOk: () => {
                  deleteTask(record.id);
                  message.success('删除成功');
                },
              });
            }}
            disabled={record.status === 'running'}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="数据增强"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentTask(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            创建增强任务
          </Button>
        }
      >
        {availableSceneConfigs.length === 0 && (
          <Alert
            message="提示"
            description="当前没有可用的场景应用配置。请先在工具箱中创建场景应用配置，并确保关联的模型已启用。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={currentTask ? '编辑增强任务' : '创建增强任务'}
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setCurrentTask(null);
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Form.Item
            name="datasetId"
            label="源数据集"
            rules={[{ required: true, message: '请选择数据集' }]}
          >
            <Select
              placeholder="请选择数据集"
              showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            >
              {datasets.map((dataset) => (
                <Select.Option key={dataset.id} value={dataset.id} label={dataset.name}>
                  {dataset.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="sceneConfigId"
            label="增强方式（场景应用配置）"
            rules={[{ required: true, message: '请选择增强方式' }]}
            extra="每种增强方式对应工具箱中的一个场景应用配置，包含基模和提示词配置"
          >
            <Select
              placeholder="请选择增强方式"
              showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            >
              {availableSceneConfigs.map((config) => {
                const model = models.find((m) => m.id === config.modelId);
                return (
                  <Select.Option
                    key={config.id}
                    value={config.id}
                    label={config.sceneName}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{config.sceneName}</div>
                      {model && (
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          模型: {model.name} ({model.model})
                        </div>
                      )}
                      {config.description && (
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {config.description}
                        </div>
                      )}
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="任务详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setCurrentTask(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailVisible(false);
            setCurrentTask(null);
          }}>
            关闭
          </Button>,
          currentTask && currentTask.status !== 'running' && (
            <Button
              key="run"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                if (currentTask) {
                  handleRunTask(currentTask);
                  setDetailVisible(false);
                }
              }}
            >
              运行任务
            </Button>
          ),
        ]}
        width={800}
      >
        {currentTask && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="任务名称">{currentTask.name}</Descriptions.Item>
            <Descriptions.Item label="源数据集">
              {getDatasetName(currentTask.datasetId)}
            </Descriptions.Item>
            <Descriptions.Item label="增强方式">
              {getSceneConfigName(currentTask.sceneConfigId)}
            </Descriptions.Item>
            <Descriptions.Item label="关联模型">
              {(() => {
                const config = getSceneConfigDetail(currentTask.sceneConfigId);
                return config ? getModelName(config.modelId) : '未知';
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag
                color={
                  currentTask.status === 'completed'
                    ? 'success'
                    : currentTask.status === 'failed'
                    ? 'error'
                    : currentTask.status === 'running'
                    ? 'processing'
                    : 'default'
                }
              >
                {currentTask.status === 'draft'
                  ? '草稿'
                  : currentTask.status === 'running'
                  ? '运行中'
                  : currentTask.status === 'completed'
                  ? '已完成'
                  : '失败'}
              </Tag>
            </Descriptions.Item>
            {currentTask.status === 'running' && currentTask.progress !== undefined && (
              <Descriptions.Item label="进度">
                <Progress percent={currentTask.progress} />
              </Descriptions.Item>
            )}
            {currentTask.status === 'failed' && currentTask.errorMessage && (
              <Descriptions.Item label="错误信息">
                <Alert message={currentTask.errorMessage} type="error" />
              </Descriptions.Item>
            )}
            {currentTask.resultDatasetId && (
              <Descriptions.Item label="增强结果数据集ID">
                {currentTask.resultDatasetId}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">
              {new Date(currentTask.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(currentTask.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default DataEnhancement;
