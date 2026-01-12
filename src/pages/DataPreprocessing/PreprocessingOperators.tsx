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

const PreprocessingOperators: React.FC = () => {
  const [operators, setOperators] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<any>(null);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const newOperator = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
      };
      setOperators([...operators, newOperator]);
      setModalVisible(false);
      form.resetFields();
      message.success('创建成功');
    });
  };

  const handleViewDetail = (operator: any) => {
    setSelectedOperator(operator);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '算子名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '算子类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          cleaning: { color: 'blue', text: '清洗' },
          transformation: { color: 'green', text: '转换' },
          filtering: { color: 'orange', text: '过滤' },
          validation: { color: 'purple', text: '验证' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
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
                content: '确定要删除这个算子吗？',
                onOk: () => {
                  setOperators(operators.filter((o) => o.id !== record.id));
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
        title="预处理算子"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            新增算子
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={operators}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增预处理算子"
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
            label="算子名称"
            rules={[{ required: true, message: '请输入算子名称' }]}
          >
            <Input placeholder="请输入算子名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="算子类型"
            rules={[{ required: true, message: '请选择算子类型' }]}
          >
            <Select placeholder="请选择算子类型">
              <Select.Option value="cleaning">清洗</Select.Option>
              <Select.Option value="transformation">转换</Select.Option>
              <Select.Option value="filtering">过滤</Select.Option>
              <Select.Option value="validation">验证</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} placeholder="请输入算子描述" />
          </Form.Item>
          <Form.Item
            name="code"
            label="算子代码"
            rules={[{ required: true, message: '请输入算子代码' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入算子代码（Python）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="算子详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setSelectedOperator(null);
        }}
        footer={null}
        width={800}
      >
        {selectedOperator && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="算子名称">{selectedOperator.name}</Descriptions.Item>
            <Descriptions.Item label="算子类型">{selectedOperator.type}</Descriptions.Item>
            <Descriptions.Item label="描述">{selectedOperator.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="算子代码">
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {selectedOperator.code || '-'}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PreprocessingOperators;
















