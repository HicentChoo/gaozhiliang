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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const DataCleaning: React.FC = () => {
  const [cleaningTasks, setCleaningTasks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const newTask = {
        id: Date.now().toString(),
        ...values,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      setCleaningTasks([...cleaningTasks, newTask]);
      setModalVisible(false);
      form.resetFields();
      message.success('创建成功');
    });
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数据集',
      dataIndex: 'dataset',
      key: 'dataset',
    },
    {
      title: '清洗算子',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          running: { color: 'processing', text: '运行中' },
          completed: { color: 'success', text: '已完成' },
          failed: { color: 'error', text: '失败' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
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
            icon={<EditOutlined />}
            onClick={() => {
              message.info('编辑功能待实现');
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              message.info('运行功能待实现');
            }}
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
                content: '确定要删除这个清洗任务吗？',
                onOk: () => {
                  setCleaningTasks(cleaningTasks.filter((t) => t.id !== record.id));
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
        title="数据清洗"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            创建清洗任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={cleaningTasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="创建清洗任务"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
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
            name="dataset"
            label="数据集"
            rules={[{ required: true, message: '请选择数据集' }]}
          >
            <Select placeholder="请选择数据集">
              {/* 这里应该从数据集列表中选择 */}
            </Select>
          </Form.Item>
          <Form.Item
            name="operator"
            label="清洗算子"
            rules={[{ required: true, message: '请选择清洗算子' }]}
          >
            <Select placeholder="请选择清洗算子">
              {/* 这里应该从算子列表中选择 */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DataCleaning;

