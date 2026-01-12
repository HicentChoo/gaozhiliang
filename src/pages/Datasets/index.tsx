import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Input,
  message,
  Space,
  Tag,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  SendOutlined,
  EditOutlined as FileEditOutlined,
  CodeOutlined,
  FolderOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { Dataset } from '../../store/dataStore';
import { useDataStore } from '../../store/dataStore';
import DatasetDetail from './components/DatasetDetail';
import SampleManager from './components/SampleManager';
import CreateDatasetDrawer from './components/CreateDatasetDrawer';
import './index.css';

const { Text } = Typography;

const Datasets: React.FC = () => {
  const { datasets, addDataset, deleteDataset, addDatasetVersion, updateDataset } = useDataStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [sampleManagerVisible, setSampleManagerVisible] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [processCollapsed, setProcessCollapsed] = useState(true);

  const handleCreate = (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => {
    addDataset(dataset);
    message.success('创建成功');
  };

  const handleViewDetail = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setDetailDrawerVisible(true);
  };

  const handleAddVersion = (datasetId: string, version: string) => {
    addDatasetVersion(datasetId, {
      version,
      sampleCount: 0,
      status: 'draft',
    });
    message.success('版本创建成功');
  };

  const handlePublish = (dataset: Dataset) => {
    updateDataset(dataset.id, { isPublished: true });
    message.success('发布成功');
  };

  const handleImport = (_dataset: Dataset) => {
    message.info('导入功能待实现');
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的数据集');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个数据集吗？`,
      onOk: () => {
        selectedRowKeys.forEach((key) => {
          deleteDataset(key as string);
        });
        setSelectedRowKeys([]);
        message.success('删除成功');
      },
    });
  };

  const handleSearch = () => {
    message.info('搜索功能待实现');
  };

  const handleReset = () => {
    setSearchKeyword('');
    message.info('已重置');
  };

  const filteredDatasets = datasets.filter((dataset) =>
    dataset.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '是否发布',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (isPublished: boolean) => (
        <Tag color={isPublished ? 'success' : 'default'}>
          {isPublished ? '已发布' : '未发布'}
        </Tag>
      ),
    },
    {
      title: '数据用途',
      dataIndex: 'dataUsage',
      key: 'dataUsage',
      width: 150,
      render: (usage: string) => usage || '-',
    },
    {
      title: '数据格式',
      dataIndex: 'format',
      key: 'format',
      width: 200,
    },
    {
      title: '样本数',
      dataIndex: 'sampleCount',
      key: 'sampleCount',
      width: 100,
      render: (count: number | undefined, record: Dataset) => {
        if (count !== undefined) {
          return count;
        }
        // 如果没有sampleCount，从versions中计算
        return record.versions.reduce((sum, v) => sum + v.sampleCount, 0);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: 'right' as const,
      render: (_: any, record: Dataset) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              message.info('编辑功能待实现');
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => handleImport(record)}
          >
            导入
          </Button>
          {!record.isPublished && (
            <Button
              type="link"
              size="small"
              icon={<SendOutlined />}
              onClick={() => handlePublish(record)}
            >
              发布
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个数据集吗？',
                onOk: () => {
                  deleteDataset(record.id);
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div className="datasets-container">
      {/* 使用流程部分 */}
      {!processCollapsed && (
        <Card
          className="process-card"
          title="使用流程"
          extra={
            <Button
              type="text"
              size="small"
              icon={<UpOutlined />}
              onClick={() => setProcessCollapsed(true)}
            >
              收起
            </Button>
          }
        >
          <Row gutter={[24, 24]} className="process-steps">
            <Col xs={24} sm={8}>
              <div className="process-step">
                <div className="step-icon">
                  <FileEditOutlined />
                </div>
                <div className="step-title">创建数据集</div>
                <div className="step-description">
                  指定适用于文本生成/图像生成/图像理解的数据格式，创建对应数据集
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="process-step">
                <div className="step-arrow">→</div>
                <div className="step-icon">
                  <CodeOutlined />
                </div>
                <div className="step-title">加工数据集</div>
                <div className="step-description">
                  对数据集进行清洗、转换、增强等处理，提升数据质量
                </div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="process-step">
                <div className="step-arrow">→</div>
                <div className="step-icon">
                  <FolderOutlined />
                </div>
                <div className="step-title">发布并使用数据集</div>
                <div className="step-description">
                  发布该版本数据集，供后续大模型精调等环节使用
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}
      {processCollapsed && (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="text"
            size="small"
            icon={<DownOutlined />}
            onClick={() => setProcessCollapsed(false)}
          >
            展开使用流程
          </Button>
        </div>
      )}

      {/* 数据集列表 */}
      <Card
        className="datasets-list-card"
        title={
          <Space>
            <span>数据集</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {filteredDatasets.length}
            </Text>
          </Space>
        }
      >
        {/* 搜索和操作栏 */}
        <div className="datasets-toolbar">
          <Space>
            <Input
              placeholder="请输入数据集名称"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              查询
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              新增
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              删除
            </Button>
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredDatasets}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 创建数据集抽屉 */}
      <CreateDatasetDrawer
        visible={createModalVisible}
        onClose={() => {
          setCreateModalVisible(false);
        }}
        onOk={handleCreate}
      />

      <DatasetDetail
        visible={detailDrawerVisible}
        dataset={selectedDataset}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedDataset(null);
        }}
        onAddVersion={handleAddVersion}
      />

      <SampleManager
        visible={sampleManagerVisible}
        dataset={selectedDataset}
        onClose={() => {
          setSampleManagerVisible(false);
          setSelectedDataset(null);
        }}
      />
    </div>
  );
};

export default Datasets;
