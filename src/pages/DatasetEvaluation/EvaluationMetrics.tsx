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

const EvaluationMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const newMetric = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
      };
      setMetrics([...metrics, newMetric]);
      setModalVisible(false);
      form.resetFields();
      message.success('创建成功');
    });
  };

  const handleViewDetail = (metric: any) => {
    setSelectedMetric(metric);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '指标类型',
      dataIndex: 'metricType',
      key: 'metricType',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          classification: { color: 'blue', text: '分类指标' },
          regression: { color: 'green', text: '回归指标' },
          nlp: { color: 'orange', text: 'NLP指标' },
          vision: { color: 'purple', text: '视觉指标' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '计算公式',
      dataIndex: 'formula',
      key: 'formula',
      ellipsis: true,
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
                content: '确定要删除这个评估指标吗？',
                onOk: () => {
                  setMetrics(metrics.filter((m) => m.id !== record.id));
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
        title="评估指标"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            新增指标
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={metrics}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增评估指标"
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
            label="指标名称"
            rules={[{ required: true, message: '请输入指标名称' }]}
          >
            <Input placeholder="例如：准确率、F1分数" />
          </Form.Item>
          <Form.Item
            name="metricType"
            label="指标类型"
            rules={[{ required: true, message: '请选择指标类型' }]}
          >
            <Select placeholder="请选择指标类型">
              <Select.Option value="classification">分类指标</Select.Option>
              <Select.Option value="regression">回归指标</Select.Option>
              <Select.Option value="nlp">NLP指标</Select.Option>
              <Select.Option value="vision">视觉指标</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="formula"
            label="计算公式"
            rules={[{ required: true, message: '请输入计算公式' }]}
          >
            <Input placeholder="例如：accuracy = (TP + TN) / (TP + TN + FP + FN)" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入指标描述" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="指标详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedMetric(null);
        }}
        footer={null}
        width={800}
      >
        {selectedMetric && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="指标名称">{selectedMetric.name}</Descriptions.Item>
            <Descriptions.Item label="指标类型">{selectedMetric.metricType}</Descriptions.Item>
            <Descriptions.Item label="计算公式">
              <code style={{ background: '#f5f5f5', padding: '4px 8px', borderRadius: 4 }}>
                {selectedMetric.formula}
              </code>
            </Descriptions.Item>
            <Descriptions.Item label="描述">{selectedMetric.description || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EvaluationMetrics;
















