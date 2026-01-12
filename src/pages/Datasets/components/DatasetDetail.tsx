import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Table,
  Modal,
  Input,
  Tabs,
  Form,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dataset, DatasetVersion } from '../../../store/dataStore';
import type { ColumnsType } from 'antd/es/table';

interface DatasetDetailProps {
  visible: boolean;
  dataset: Dataset | null;
  onClose: () => void;
  onAddVersion: (datasetId: string, version: string) => void;
}

const DatasetDetail: React.FC<DatasetDetailProps> = ({
  visible,
  dataset,
  onClose,
  onAddVersion,
}) => {
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [versionForm] = Form.useForm();
  const [fileData, setFileData] = useState<any[]>([]);
  const [fileColumns, setFileColumns] = useState<ColumnsType<any>>([]);

  useEffect(() => {
    if (dataset && dataset.sourceType === 'file') {
      // 模拟解析文件数据
      // 实际应该调用API解析文件
      const mockData = [
        { id: 1, system: 'You are a helpful assistant', prompt: 'What is AI?', response: 'AI is...' },
        { id: 2, system: 'You are a helpful assistant', prompt: 'What is ML?', response: 'ML is...' },
      ];
      setFileData(mockData);
      setFileColumns([
        { title: 'System', dataIndex: 'system', key: 'system' },
        { title: 'Prompt', dataIndex: 'prompt', key: 'prompt' },
        { title: 'Response', dataIndex: 'response', key: 'response' },
      ]);
    }
  }, [dataset]);

  const handleAddVersion = () => {
    versionForm.validateFields().then((values) => {
      if (dataset) {
        onAddVersion(dataset.id, values.version);
        setVersionModalVisible(false);
        versionForm.resetFields();
      }
    });
  };

  if (!dataset) return null;

  const versionColumns: ColumnsType<DatasetVersion> = [
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '样本数量',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          processing: { color: 'processing', text: '处理中' },
          completed: { color: 'success', text: '已完成' },
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
  ];

  return (
    <>
      <Drawer
        title="数据集详情"
        open={visible}
        onClose={onClose}
        width={800}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setVersionModalVisible(true)}
          >
            新增版本
          </Button>
        }
      >
        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="数据集名称">{dataset.name}</Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag color="blue">{dataset.type === 'text' ? '文本' : dataset.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="格式">{dataset.format}</Descriptions.Item>
          <Descriptions.Item label="数据来源">
            <Tag color={dataset.sourceType === 'task' ? 'green' : 'orange'}>
              {dataset.sourceType === 'task' ? '采集任务' : '文件导入'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="来源ID">{dataset.sourceId}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(dataset.createdAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24 }}>
          <Tabs defaultActiveKey="versions">
            <Tabs.TabPane tab="版本管理" key="versions">
              <Table
                columns={versionColumns}
                dataSource={dataset.versions}
                rowKey="version"
                pagination={false}
              />
            </Tabs.TabPane>
            {dataset.sourceType === 'file' && (
              <Tabs.TabPane tab="数据预览" key="preview">
                <Table
                  columns={fileColumns}
                  dataSource={fileData}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Tabs.TabPane>
            )}
          </Tabs>
        </div>
      </Drawer>

      <Modal
        title="新增版本"
        open={versionModalVisible}
        onOk={handleAddVersion}
        onCancel={() => {
          setVersionModalVisible(false);
          versionForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={versionForm} layout="vertical">
          <Form.Item
            name="version"
            label="版本号"
            rules={[{ required: true, message: '请输入版本号（如：V1.0）' }]}
          >
            <Input placeholder="例如：V1.0" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DatasetDetail;

