import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Radio,
  Button,
  Space,
  Upload,
  Select,
  message,
} from 'antd';
import {
  InboxOutlined,
} from '@ant-design/icons';
import type { Dataset } from '../../../store/dataStore';
import { useDataStore } from '../../../store/dataStore';

const { Dragger } = Upload;

interface CreateDatasetDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOk: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const CreateDatasetDrawer: React.FC<CreateDatasetDrawerProps> = ({
  visible,
  onClose,
  onOk,
}) => {
  const [form] = Form.useForm();
  const { datasets } = useDataStore();
  const [dataSource, setDataSource] = useState<'file' | 'collection'>('file');
  const [selectedDataset, setSelectedDataset] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setDataSource('file');
      setSelectedDataset(undefined);
      form.setFieldsValue({
        dataUsage: '有监督微调SFT',
        dataSource: 'file',
        dataFormat: '',
      });
    }
  }, [visible, form]);

  const handleDataSourceChange = (e: any) => {
    const value = e.target.value;
    setDataSource(value);
    setSelectedDataset(undefined);
    form.setFieldsValue({ sourceId: undefined });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newDataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'> = {
        name: values.name,
        type: 'text',
        format: values.dataFormat || 'custom',
        sourceType: values.dataSource,
        sourceId: values.sourceId || '',
        versions: [],
        isPublished: false,
        dataUsage: values.dataUsage,
        sampleCount: 0,
      };
      onOk(newDataset);
      form.resetFields();
      onClose();
    });
  };

  // 文件上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: (file: File) => {
      // 这里可以添加文件验证逻辑
      const isValidType = ['text/plain', 'text/csv', 'application/json'].includes(file.type) ||
        file.name.endsWith('.txt') || file.name.endsWith('.csv') || file.name.endsWith('.json');
      if (!isValidType) {
        message.error('只支持上传 txt、csv、json 格式的文件');
        return Upload.LIST_IGNORE;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB');
        return Upload.LIST_IGNORE;
      }
      return false; // 阻止自动上传，后续处理
    },
    onChange: (info: any) => {
      // 处理文件变化
      console.log('File changed:', info);
    },
  };

  return (
    <Drawer
      title="新增数据集"
      open={visible}
      onClose={onClose}
      width={600}
      placement="right"
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            确认
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={
            <span>
              <span style={{ color: '#ff4d4f' }}>*</span> 数据集名称
            </span>
          }
          rules={[
            { required: true, message: '请输入数据集名称' },
            {
              pattern: /^[a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_-]*$/,
              message: '支持中英文、数字、中划线(-)、下划线(_)，2-64个字符，不能以下划线和中划线开头',
            },
            { min: 2, message: '至少2个字符' },
            { max: 64, message: '最多64个字符' },
          ]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea
            rows={3}
            placeholder="请输入描述"
          />
        </Form.Item>

        <Form.Item
          name="dataUsage"
          label={
            <span>
              <span style={{ color: '#ff4d4f' }}>*</span> 数据用途
            </span>
          }
          rules={[{ required: true, message: '请选择数据用途' }]}
        >
          <Radio.Group>
            <Radio value="有监督微调SFT">有监督微调SFT</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="dataFormat"
          label="数据格式"
        >
          <Input
            placeholder="请输入自定义数据格式"
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="dataSource"
          label="数据来源"
          initialValue="file"
        >
          <Radio.Group onChange={handleDataSourceChange} value={dataSource}>
            <Radio value="file">文件导入</Radio>
            <Radio value="collection">平台采集</Radio>
          </Radio.Group>
        </Form.Item>

        {dataSource === 'file' && (
          <Form.Item
            name="file"
            label="上传文件"
            rules={[{ required: true, message: '请上传文件' }]}
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">
                支持 txt、csv、json 格式，文件大小不超过 10MB
              </p>
            </Dragger>
          </Form.Item>
        )}

        {dataSource === 'collection' && (
          <Form.Item
            name="sourceId"
            label="选择数据集"
            rules={[{ required: true, message: '请选择数据集' }]}
          >
            <Select
              showSearch
              placeholder="请搜索并选择数据集"
              value={selectedDataset}
              onChange={(value) => {
                setSelectedDataset(value);
                form.setFieldsValue({ sourceId: value });
              }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={datasets.map((ds) => ({
                value: ds.id,
                label: ds.name,
              }))}
              notFoundContent={datasets.length === 0 ? '暂无数据集，请先创建数据集' : '未找到匹配的数据集'}
            />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CreateDatasetDrawer;
