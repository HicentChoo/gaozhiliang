import React, { useState } from 'react';
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
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const EvaluationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const newTemplate = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
      };
      setTemplates([...templates, newTemplate]);
      setModalVisible(false);
      form.resetFields();
      message.success('创建成功');
    });
  };

  const handleViewDetail = (template: any) => {
    setSelectedTemplate(template);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '评估类型',
      dataIndex: 'evaluationType',
      key: 'evaluationType',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          quality: { color: 'blue', text: '质量评估' },
          accuracy: { color: 'green', text: '准确率评估' },
          completeness: { color: 'orange', text: '完整性评估' },
          consistency: { color: 'purple', text: '一致性评估' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '指标数量',
      dataIndex: 'metrics',
      key: 'metrics',
      render: (metrics: string[]) => metrics?.length || 0,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              message.info('编辑功能待实现');
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个评估模板吗？',
                onOk: () => {
                  setTemplates(templates.filter((t) => t.id !== record.id));
                  message.success('删除成功');
                },
              });
            }}
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
        title="评估模板"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            新增模板
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增评估模板"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item
            name="evaluationType"
            label="评估类型"
            rules={[{ required: true, message: '请选择评估类型' }]}
          >
            <Select placeholder="请选择评估类型">
              <Select.Option value="quality">质量评估</Select.Option>
              <Select.Option value="accuracy">准确率评估</Select.Option>
              <Select.Option value="completeness">完整性评估</Select.Option>
              <Select.Option value="consistency">一致性评估</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>
          <Form.Item
            name="metrics"
            label="评估指标"
            rules={[{ required: true, message: '请选择评估指标' }]}
          >
            <Select mode="multiple" placeholder="请选择评估指标">
              <Select.Option value="accuracy">准确率</Select.Option>
              <Select.Option value="precision">精确率</Select.Option>
              <Select.Option value="recall">召回率</Select.Option>
              <Select.Option value="f1">F1分数</Select.Option>
              <Select.Option value="bleu">BLEU</Select.Option>
              <Select.Option value="rouge">ROUGE</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="模板详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedTemplate(null);
        }}
        footer={null}
        width={800}
      >
        {selectedTemplate && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="模板名称">{selectedTemplate.name}</Descriptions.Item>
            <Descriptions.Item label="评估类型">{selectedTemplate.evaluationType}</Descriptions.Item>
            <Descriptions.Item label="描述">{selectedTemplate.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="评估指标">
              <Space>
                {selectedTemplate.metrics?.map((metric: string) => (
                  <Tag key={metric}>{metric}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EvaluationTemplates;
















