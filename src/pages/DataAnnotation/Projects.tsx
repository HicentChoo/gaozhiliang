import React, { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Progress,
  Modal,
  message,
  Input,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAnnotationStore, TASK_TYPE_MAP } from '../../store/annotationStore';
import { useDataStore } from '../../store/dataStore';
import type { ColumnsType } from 'antd/es/table';
import CreateProjectWizard from './components/CreateProjectWizard';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject, updateProject } = useAnnotationStore();
  const { datasets } = useDataStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 获取数据集名称
  const getDatasetName = (datasetId: string) => {
    const dataset = datasets.find((d) => d.id === datasetId);
    return dataset ? dataset.name : '未知数据集';
  };

  // 过滤项目
  const filteredProjects = useMemo(() => {
    let filtered = projects;
    
    if (searchText) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    
    return filtered;
  }, [projects, searchText, statusFilter]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个标注项目吗？删除后无法恢复。',
      onOk: () => {
        deleteProject(id);
        message.success('删除成功');
      },
    });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateProject(id, { status: status as any });
    message.success('状态更新成功');
  };

  const columns: ColumnsType<any> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/data-annotation/projects/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: '关联数据集',
      dataIndex: 'datasetId',
      key: 'datasetId',
      width: 200,
      render: (datasetId: string) => getDatasetName(datasetId),
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 150,
      render: (type: string) => {
        return <Tag>{TASK_TYPE_MAP[type as keyof typeof TASK_TYPE_MAP] || type}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          draft: { color: 'default', text: '草稿' },
          active: { color: 'processing', text: '进行中' },
          paused: { color: 'warning', text: '已暂停' },
          completed: { color: 'success', text: '已完成' },
          archived: { color: 'default', text: '已归档' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '进度',
      key: 'progress',
      width: 200,
      render: (_: any, record: any) => {
        const progress =
          record.totalTasks > 0
            ? (record.completedTasks / record.totalTasks) * 100
            : 0;
        return (
          <Progress
            percent={Math.round(progress)}
            size="small"
            format={(percent) => `${record.completedTasks}/${record.totalTasks}`}
          />
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/data-annotation/projects/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'active' && (
            <Button
              type="link"
              icon={<PauseCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'paused')}
            >
              暂停
            </Button>
          )}
          {record.status === 'paused' && (
            <Button
              type="link"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'active')}
            >
              继续
            </Button>
          )}
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        className="card-elevated"
        title="标注项目"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            创建项目
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input.Search
              placeholder="搜索项目名称"
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="draft">草稿</Select.Option>
              <Select.Option value="active">进行中</Select.Option>
              <Select.Option value="paused">已暂停</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="archived">已归档</Select.Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowClassName={() => 'table-row-hover'}
          scroll={{ x: 1200 }}
        />
      </Card>

      <CreateProjectWizard
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          message.success('项目创建成功');
        }}
      />
    </div>
  );
};

export default Projects;


