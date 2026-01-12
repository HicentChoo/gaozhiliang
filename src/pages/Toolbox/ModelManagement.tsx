import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Tag,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useToolboxStore, type Model } from '../../store/toolboxStore';
import { testModelConnection } from '../../api/qwenApi';
import type { ColumnsType } from 'antd/es/table';

const ModelManagement: React.FC = () => {
  const { models, addModel, updateModel, deleteModel } = useToolboxStore();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingModelId, setTestingModelId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingModel(null);
    form.resetFields();
    form.setFieldsValue({
      endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (model: Model) => {
    setEditingModel(model);
    form.setFieldsValue(model);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteModel(id);
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingModel) {
        updateModel(editingModel.id, values);
        message.success('更新成功');
      } else {
        addModel(values);
        message.success('创建成功');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingModel(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '****';
    return `${apiKey.substring(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`;
  };

  const handleTestConnection = async (model: Model) => {
    setTestingModelId(model.id);
    try {
      const success = await testModelConnection(model);
      if (success) {
        message.success('连接测试成功！');
      } else {
        message.error('连接测试失败，请检查API Key和端点配置');
      }
    } catch (error: any) {
      message.error(`连接测试失败: ${error.message || '未知错误'}`);
    } finally {
      setTestingModelId(null);
    }
  };

  const columns: ColumnsType<Model> = [
    {
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Model字段',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      render: (model: string) => <Tag color="blue">{model}</Tag>,
    },
    {
      title: 'API Key',
      dataIndex: 'apiKey',
      key: 'apiKey',
      width: 250,
      render: (apiKey: string, record: Model) => (
        <Space>
          <span style={{ fontFamily: 'monospace' }}>
            {showApiKeys[record.id] ? apiKey : maskApiKey(apiKey)}
          </span>
          <Button
            type="text"
            size="small"
            icon={showApiKeys[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleApiKeyVisibility(record.id)}
          />
        </Space>
      ),
    },
    {
      title: 'API端点',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
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
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: Model) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<ThunderboltOutlined />}
            onClick={() => handleTestConnection(record)}
            loading={testingModelId === record.id}
          >
            测试连接
          </Button>
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
            description="确定要删除这个模型吗？删除后关联的场景配置也会被删除。"
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
        <h2 style={{ margin: 0 }}>模型管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增模型
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={models}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title={editingModel ? '编辑模型' : '新增模型'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingModel(null);
        }}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            isActive: true,
          }}
        >
          <Form.Item
            name="name"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
            tooltip="用于管理员记忆和识别"
          >
            <Input placeholder="例如：通义千问Plus" />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model字段"
            rules={[{ required: true, message: '请输入Model字段' }]}
            tooltip="用于指定调用哪一个模型，如 qwen-plus, qwen-max, qwen-turbo"
          >
            <Input placeholder="例如：qwen-plus" />
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: '请输入API Key' }]}
            tooltip="阿里云百炼控制台创建的API Key"
          >
            <Input.Password placeholder="请输入API Key" />
          </Form.Item>

          <Form.Item
            name="endpoint"
            label="API端点"
            rules={[{ required: true, message: '请输入API端点' }]}
            tooltip="中国大陆地域端点：https://dashscope.aliyuncs.com/compatible-mode/v1"
          >
            <Input placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入模型描述（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagement;

