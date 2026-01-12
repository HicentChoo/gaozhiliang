import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Modal,
  message,
  Tabs,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useDataStore } from '../../store/dataStore';
import type { DataSource, CollectionTask } from '../../store/dataStore';
import DataSourceModal from './components/DataSourceModal';
import CollectionTaskCanvas from './components/CollectionTaskCanvas';

const { TabPane } = Tabs;

const DataCollection: React.FC = () => {
  const { dataSources, collectionTasks, addDataSource, deleteDataSource } =
    useDataStore();
  const [dataSourceModalVisible, setDataSourceModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<CollectionTask | null>(null);

  const handleCreateTask = () => {
    setEditingTask(null);
    setTaskModalVisible(true);
  };

  const handleEditTask = (task: CollectionTask) => {
    setEditingTask(task);
    setTaskModalVisible(true);
  };

  const handleDeleteTask = (_id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个采集任务吗？',
      onOk: () => {
        // 这里应该调用删除方法
        message.success('删除成功');
      },
    });
  };

  const dataSourceColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          structured: { color: 'blue', text: '结构化' },
          'semi-structured': { color: 'orange', text: '半结构化' },
          unstructured: { color: 'green', text: '非结构化' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
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
      render: (_: any, record: DataSource) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              // 编辑数据源
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              deleteDataSource(record.id);
              message.success('删除成功');
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
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
        title="数据采集"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setDataSourceModalVisible(true)}
            >
              新增数据源
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
            >
              创建采集任务
            </Button>
          </Space>
        }
      >
        <Tabs defaultActiveKey="tasks">
          <TabPane tab="采集任务" key="tasks">
            <Table
              columns={taskColumns}
              dataSource={collectionTasks}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab="数据源管理" key="sources">
            <Table
              columns={dataSourceColumns}
              dataSource={dataSources}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <DataSourceModal
        visible={dataSourceModalVisible}
        onCancel={() => setDataSourceModalVisible(false)}
        onOk={(values) => {
          addDataSource({
            name: values.name,
            type: values.type,
            config: {},
          });
          setDataSourceModalVisible(false);
          message.success('创建成功');
        }}
      />

      <CollectionTaskCanvas
        visible={taskModalVisible}
        task={editingTask}
        onCancel={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
        }}
        onSave={(_task) => {
          if (editingTask) {
            // 更新任务
            message.success('更新成功');
          } else {
            // 创建任务
            message.success('创建成功');
          }
          setTaskModalVisible(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
};

export default DataCollection;

