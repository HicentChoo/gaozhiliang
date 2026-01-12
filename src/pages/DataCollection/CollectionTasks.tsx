import React from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Modal,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import type { CollectionTask } from '../../store/dataStore';
import { Typography } from 'antd';

const { Text } = Typography;

const CollectionTasks: React.FC = () => {
  const navigate = useNavigate();
  const { collectionTasks } = useDataStore();

  const handleCreateTask = () => {
    navigate('/data-collection/tasks/create');
  };

  const handleEditTask = (task: CollectionTask) => {
    navigate(`/data-collection/tasks/${task.id}`);
  };

  const handleDeleteTask = (_id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个采集任务吗？',
      onOk: () => {
        message.success('删除成功');
      },
    });
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      title: '定时任务',
      dataIndex: 'cron',
      key: 'cron',
      render: (cron: string, record: CollectionTask) => {
        if (cron) {
          return (
            <Space>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text code style={{ fontSize: 12 }}>{cron}</Text>
              {record.cronDescription && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ({record.cronDescription})
                </Text>
              )}
            </Space>
          );
        }
        return <Text type="secondary">未配置</Text>;
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
      render: (_: any, record: CollectionTask) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTask(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => {
              message.info('启动任务功能待实现');
            }}
          >
            运行
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTask(record.id)}
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
        title="采集任务"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
          >
            创建采集任务
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={collectionTasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default CollectionTasks;

