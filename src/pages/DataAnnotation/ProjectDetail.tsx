import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Progress,
  Table,
  Space,
  Button,
  Tabs,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useAnnotationStore, TASK_TYPE_MAP } from '../../store/annotationStore';
import { useDataStore } from '../../store/dataStore';
import type { ColumnsType } from 'antd/es/table';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, labelTemplates } = useAnnotationStore();
  const { datasets } = useDataStore();

  const project = projects.find((p) => p.id === id);
  const projectTasks = tasks.filter((t) => t.projectId === id);
  const dataset = datasets.find((d) => d.id === project?.datasetId);
  const template = labelTemplates.find((t) => t.id === project?.labelTemplateId);

  if (!project) {
    return <div>项目不存在</div>;
  }

  const taskColumns: ColumnsType<any> = [
    {
      title: '样本ID',
      dataIndex: 'sampleId',
      key: 'sampleId',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
      title: '标注员',
      dataIndex: 'assigneeId',
      key: 'assigneeId',
      render: (id: string) => id || '-',
    },
    {
      title: '质检员',
      dataIndex: 'reviewerId',
      key: 'reviewerId',
      render: (id: string) => id || '-',
    },
    {
      title: '标注结果数',
      key: 'annotationCount',
      render: (_: any, record: any) => record.annotations?.length || 0,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
  ];

  const taskTypeMap = TASK_TYPE_MAP;

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    active: { color: 'processing', text: '进行中' },
    paused: { color: 'warning', text: '已暂停' },
    completed: { color: 'success', text: '已完成' },
    archived: { color: 'default', text: '已归档' },
  };

  const tabItems = [
    {
      key: 'overview',
      label: '概览',
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="项目名称">{project.name}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[project.status]?.color}>
              {statusMap[project.status]?.text}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="任务类型">
            {taskTypeMap[project.taskType] || project.taskType}
          </Descriptions.Item>
          <Descriptions.Item label="关联数据集">
            {dataset?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="标签模板">
            {template?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="项目负责人">
            {project.ownerId}
          </Descriptions.Item>
          <Descriptions.Item label="标注员">
            {project.annotatorIds.join(', ') || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="质检员">
            {project.reviewerIds.join(', ') || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="总任务数" span={2}>
            {project.totalTasks}
          </Descriptions.Item>
          <Descriptions.Item label="已完成" span={2}>
            {project.completedTasks}
          </Descriptions.Item>
          <Descriptions.Item label="质检中" span={2}>
            {project.reviewingTasks}
          </Descriptions.Item>
          <Descriptions.Item label="已通过" span={2}>
            {project.approvedTasks}
          </Descriptions.Item>
          <Descriptions.Item label="已退回" span={2}>
            {project.rejectedTasks}
          </Descriptions.Item>
          <Descriptions.Item label="进度" span={2}>
            <Progress
              percent={
                project.totalTasks > 0
                  ? Math.round((project.completedTasks / project.totalTasks) * 100)
                  : 0
              }
            />
          </Descriptions.Item>
          {project.description && (
            <Descriptions.Item label="项目描述" span={2}>
              {project.description}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="创建时间" span={2}>
            {new Date(project.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间" span={2}>
            {new Date(project.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'tasks',
      label: '任务列表',
      children: (
        <Table
          columns={taskColumns}
          dataSource={projectTasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/data-annotation/projects')}
            >
              返回
            </Button>
            <span>{project.name}</span>
          </Space>
        }
      >
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ProjectDetail;


