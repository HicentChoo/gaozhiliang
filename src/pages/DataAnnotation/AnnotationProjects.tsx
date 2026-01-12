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
  EyeOutlined,
} from '@ant-design/icons';

const AnnotationProjects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.validateFields().then((values) => {
      const newProject = {
        id: Date.now().toString(),
        ...values,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      setProjects([...projects, newProject]);
      setModalVisible(false);
      form.resetFields();
      message.success('创建成功');
    });
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '标注场景',
      dataIndex: 'scenario',
      key: 'scenario',
    },
    {
      title: '数据集',
      dataIndex: 'dataset',
      key: 'dataset',
    },
    {
      title: '标签模板',
      dataIndex: 'template',
      key: 'template',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          running: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          paused: { color: 'warning', text: '已暂停' },
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
            icon={<EyeOutlined />}
            onClick={() => {
              message.info('查看详情功能待实现');
            }}
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
                content: '确定要删除这个标注项目吗？',
                onOk: () => {
                  setProjects(projects.filter((p) => p.id !== record.id));
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
        title="标注项目"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            创建项目
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="创建标注项目"
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
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="scenario"
            label="标注场景"
            rules={[{ required: true, message: '请选择标注场景' }]}
          >
            <Select placeholder="请选择标注场景">
              <Select.Option value="multi-turn-dialogue">多轮对话</Select.Option>
              <Select.Option value="single-turn-dialogue">单轮对话</Select.Option>
              <Select.Option value="object-detection">目标检测</Select.Option>
              <Select.Option value="image-classification">图像分类</Select.Option>
            </Select>
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
            name="template"
            label="标签模板"
            rules={[{ required: true, message: '请选择标签模板' }]}
          >
            <Select placeholder="请选择标签模板">
              {/* 这里应该从标签模板列表中选择 */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnnotationProjects;
















