import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Popconfirm,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useToolboxStore, type SceneConfig } from '../../store/toolboxStore';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

const SceneConfigPage: React.FC = () => {
  const { sceneConfigs, models, addSceneConfig, updateSceneConfig, deleteSceneConfig } = useToolboxStore();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SceneConfig | null>(null);

  const handleCreate = () => {
    setEditingConfig(null);
    form.resetFields();
    form.setFieldsValue({
      temperature: 0.7,
      maxTokens: 2000,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (config: SceneConfig) => {
    setEditingConfig(config);
    form.setFieldsValue(config);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteSceneConfig(id);
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingConfig) {
        updateSceneConfig(editingConfig.id, values);
        message.success('更新成功');
      } else {
        addSceneConfig(values);
        message.success('创建成功');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingConfig(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<SceneConfig> = [
    {
      title: '场景名称',
      dataIndex: 'sceneName',
      key: 'sceneName',
      width: 200,
    },
    {
      title: '关联模型',
      dataIndex: 'modelId',
      key: 'modelId',
      width: 250,
      render: (modelId: string) => {
        const model = models.find((m) => m.id === modelId);
        if (!model) return <Tag color="default">未知模型</Tag>;
        return (
          <Tag color={model.isActive ? 'success' : 'default'}>
            {model.name} ({model.model})
          </Tag>
        );
      },
    },
    {
      title: '系统提示词',
      dataIndex: 'systemPrompt',
      key: 'systemPrompt',
      width: 200,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '基模提示词',
      dataIndex: 'prompt',
      key: 'prompt',
      width: 300,
      ellipsis: true,
    },
    {
      title: '温度',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      render: (temp: number) => temp?.toFixed(2) || '0.70',
    },
    {
      title: '最大Token',
      dataIndex: 'maxTokens',
      key: 'maxTokens',
      width: 120,
      render: (tokens: number) => tokens || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: SceneConfig) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个场景配置吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>场景应用配置</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          disabled={models.length === 0}
        >
          新增场景配置
        </Button>
      </div>

      {models.length === 0 && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fffbe6', borderRadius: 4, border: '1px solid #ffe58f' }}>
          <span style={{ color: '#ad6800' }}>
            提示：请先在"模型管理"中创建模型，然后再创建场景配置。
          </span>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={sceneConfigs}
        rowKey="id"
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingConfig ? '编辑场景配置' : '新增场景配置'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingConfig(null);
        }}
        width={700}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            temperature: 0.7,
            maxTokens: 2000,
          }}
        >
          <Form.Item
            name="sceneName"
            label="场景名称"
            rules={[{ required: true, message: '请输入场景名称' }]}
          >
            <Input placeholder="例如：文本分类、问答生成等" />
          </Form.Item>

          <Form.Item
            name="modelId"
            label="关联模型"
            rules={[{ required: true, message: '请选择关联模型' }]}
            tooltip="选择该场景使用的基模"
          >
            <Select
              placeholder="请选择模型"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={models
                .filter((m) => m.isActive)
                .map((model) => ({
                  label: `${model.name} (${model.model})`,
                  value: model.id,
                }))}
            />
          </Form.Item>

          <Form.Item
            name="systemPrompt"
            label="系统提示词"
            tooltip="系统级别的提示词，用于设定模型的角色和行为"
          >
            <TextArea
              rows={3}
              placeholder="例如：你是一个专业的数据分析师..."
            />
          </Form.Item>

          <Form.Item
            name="prompt"
            label="基模提示词"
            rules={[{ required: true, message: '请输入基模提示词' }]}
            tooltip="该场景的基础提示词模板"
          >
            <TextArea
              rows={5}
              placeholder="请输入基模提示词，可以使用 {变量名} 作为占位符"
            />
          </Form.Item>

          <Form.Item
            name="temperature"
            label="温度参数"
            tooltip="控制输出的随机性，范围0-2，值越大越随机"
          >
            <InputNumber
              min={0}
              max={2}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
              placeholder="0.7"
            />
          </Form.Item>

          <Form.Item
            name="maxTokens"
            label="最大Token数"
            tooltip="限制生成的最大token数量"
          >
            <InputNumber
              min={1}
              max={32000}
              style={{ width: '100%' }}
              placeholder="2000"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea
              rows={2}
              placeholder="请输入场景描述（可选）"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SceneConfigPage;

