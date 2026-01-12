import React, { useState } from 'react';
import {
  Drawer,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Dataset, DatasetSample } from '../../../store/dataStore';
import type { ColumnsType } from 'antd/es/table';

interface SampleManagerProps {
  visible: boolean;
  dataset: Dataset | null;
  onClose: () => void;
}

const SampleManager: React.FC<SampleManagerProps> = ({
  visible,
  dataset,
  onClose,
}) => {
  const [samples, setSamples] = useState<DatasetSample[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (dataset) {
      // 模拟加载样本数据
      // 实际应该调用API
      const mockSamples: DatasetSample[] = [
        {
          id: '1',
          content: {
            system: 'You are a helpful assistant',
            prompt: 'What is AI?',
            response: 'AI is artificial intelligence...',
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          content: {
            system: 'You are a helpful assistant',
            prompt: 'What is ML?',
            response: 'ML is machine learning...',
          },
          createdAt: new Date().toISOString(),
        },
      ];
      setSamples(mockSamples);
    }
  }, [dataset]);

  const handleAddSample = () => {
    form.validateFields().then((values) => {
      const newSample: DatasetSample = {
        id: Date.now().toString(),
        content: values,
        createdAt: new Date().toISOString(),
      };
      setSamples([...samples, newSample]);
      setAddModalVisible(false);
      form.resetFields();
      message.success('添加成功');
    });
  };

  const handleDeleteSample = (id: string) => {
    setSamples(samples.filter((s) => s.id !== id));
    message.success('删除成功');
  };

  if (!dataset) return null;

  // 根据数据集格式动态生成列
  const getColumns = (): ColumnsType<DatasetSample> => {
    if (dataset.format === 'system+prompt+response') {
      return [
        {
          title: 'System',
          dataIndex: ['content', 'system'],
          key: 'system',
          width: 200,
        },
        {
          title: 'Prompt',
          dataIndex: ['content', 'prompt'],
          key: 'prompt',
          width: 200,
        },
        {
          title: 'Response',
          dataIndex: ['content', 'response'],
          key: 'response',
          ellipsis: true,
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
          width: 100,
          render: (_: any, record: DatasetSample) => (
            <Popconfirm
              title="确定要删除这个样本吗？"
              onConfirm={() => handleDeleteSample(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          ),
        },
      ];
    }
    // 其他格式的列定义
    return [];
  };

  const getFormFields = () => {
    if (dataset.format === 'system+prompt+response') {
      return (
        <>
          <Form.Item
            name="system"
            label="System"
            rules={[{ required: true, message: '请输入System' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入System" />
          </Form.Item>
          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: '请输入Prompt' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入Prompt" />
          </Form.Item>
          <Form.Item
            name="response"
            label="Response"
            rules={[{ required: true, message: '请输入Response' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入Response" />
          </Form.Item>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <Drawer
        title={`管理样本 - ${dataset.name}`}
        open={visible}
        onClose={onClose}
        width={1200}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            新增样本
          </Button>
        }
      >
        <Table
          columns={getColumns()}
          dataSource={samples}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Drawer>

      <Modal
        title="新增样本"
        open={addModalVisible}
        onOk={handleAddSample}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          {getFormFields()}
        </Form>
      </Modal>
    </>
  );
};

export default SampleManager;

