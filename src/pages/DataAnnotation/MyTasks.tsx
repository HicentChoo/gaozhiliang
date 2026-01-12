import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Space,
  Tag,
  Button,
  Select,
  Input,
  message,
} from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAnnotationStore } from '../../store/annotationStore';
import { useAuthStore } from '../../store/authStore';
import type { ColumnsType } from 'antd/es/table';

const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, projects, updateTask } = useAnnotationStore();
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<'annotator' | 'reviewer'>('annotator');

  // 获取我的任务
  const myTasks = useMemo(() => {
    if (!user) return [];
    
    let filtered = tasks;
    
    if (roleFilter === 'annotator') {
      filtered = filtered.filter((t) => t.assigneeId === user.id);
    } else {
      filtered = filtered.filter((t) => t.reviewerId === user.id);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    
    return filtered;
  }, [tasks, user, statusFilter, roleFilter]);

  // 获取项目名称
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : '未知项目';
  };

  const handleStartAnnotation = (taskId: string) => {
    navigate(`/data-annotation/annotate/${taskId}`);
  };

  const handleReview = (taskId: string, action: 'approve' | 'reject') => {
    updateTask(taskId, {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: user?.id,
    });
    message.success(action === 'approve' ? '审核通过' : '已退回');
  };

  const columns: ColumnsType<any> = [
    {
      title: '项目名称',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 200,
      render: (projectId: string) => getProjectName(projectId),
    },
    {
      title: '样本ID',
      dataIndex: 'sampleId',
      key: 'sampleId',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: '待处理' },
          in_progress: { color: 'processing', text: '进行中' },
          completed: { color: 'success', text: '已完成' },
          reviewing: { color: 'warning', text: '质检中' },
          rejected: { color: 'error', text: '已退回' },
          approved: { color: 'success', text: '已通过' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '标注结果数',
      key: 'annotationCount',
      width: 120,
      render: (_: any, record: any) => record.annotations?.length || 0,
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
          {roleFilter === 'annotator' && (
            <>
              {(record.status === 'pending' || record.status === 'in_progress') && (
                <Button
                  type="link"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStartAnnotation(record.id)}
                >
                  开始标注
                </Button>
              )}
              {record.status === 'completed' && (
                <Button
                  type="link"
                  onClick={() => handleStartAnnotation(record.id)}
                >
                  查看/编辑
                </Button>
              )}
            </>
          )}
          {roleFilter === 'reviewer' && record.status === 'reviewing' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleReview(record.id, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReview(record.id, 'reject')}
              >
                退回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        className="card-elevated"
        title="我的任务"
        extra={
          <Space>
            <Select
              style={{ width: 120 }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              <Select.Option value="annotator">标注员</Select.Option>
              <Select.Option value="reviewer">质检员</Select.Option>
            </Select>
            <Select
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="in_progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="reviewing">质检中</Select.Option>
              <Select.Option value="approved">已通过</Select.Option>
              <Select.Option value="rejected">已退回</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={myTasks}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowClassName={() => 'table-row-hover'}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default MyTasks;
