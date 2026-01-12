import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  message,
  Tag,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useDataStore } from '../../store/dataStore';
import DataSourceForm from './components/DataSourceForm';
import type { DataSource } from '../../store/dataStore';

const DataSourceManagement: React.FC = () => {
  const { dataSources, addDataSource, updateDataSource, deleteDataSource } = useDataStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);

  const handleEdit = (record: DataSource) => {
    setEditingSource(record);
    setModalVisible(true);
  };

  const handleDelete = (record: DataSource) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除数据源"${record.name}"吗？`,
      onOk: () => {
        deleteDataSource(record.id);
        message.success('删除成功');
      },
    });
  };

  const columns = [
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
          database: { color: 'blue', text: '数据库' },
          api: { color: 'green', text: 'API接口' },
          file: { color: 'orange', text: '文件存储' },
          other: { color: 'default', text: '其他' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '连接信息',
      key: 'connection',
      render: (_: any, record: DataSource) => {
        if (record.type === 'database') {
          return `${record.config.driver || ''}://${record.config.host || ''}:${record.config.port || ''}/${record.config.database || ''}`;
        }
        if (record.type === 'api') {
          return record.config.endpoint || '-';
        }
        if (record.type === 'file') {
          return `${record.config.path || ''} (${record.config.format || ''})`;
        }
        return record.config.connectionString || '-';
      },
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <Tag icon={<CheckCircleOutlined />} color="success">
          正常
        </Tag>
      ),
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
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
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
        title="数据源管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            新增数据源
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSources}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <DataSourceForm
        visible={modalVisible}
        editingSource={editingSource || undefined}
        onCancel={() => {
          setModalVisible(false);
          setEditingSource(null);
        }}
        onOk={(values) => {
          if (editingSource) {
            updateDataSource(editingSource.id, {
              name: values.name,
              type: values.type,
              config: values.config,
            });
            message.success('更新成功');
          } else {
            addDataSource({
              name: values.name,
              type: values.type,
              config: values.config,
            });
            message.success('创建成功');
          }
          setModalVisible(false);
          setEditingSource(null);
        }}
      />
    </div>
  );
};

export default DataSourceManagement;

