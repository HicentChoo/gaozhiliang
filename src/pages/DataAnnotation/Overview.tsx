import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAnnotationStore } from '../../store/annotationStore';
import type { ColumnsType } from 'antd/es/table';

const Overview: React.FC = () => {
  const { projects, tasks } = useAnnotationStore();

  // 统计数据
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === 'completed' || t.status === 'approved'
    ).length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const reviewingTasks = tasks.filter((t) => t.status === 'reviewing').length;
    const totalAnnotators = new Set(
      tasks.map((t) => t.assigneeId).filter(Boolean)
    ).size;

    return {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      reviewingTasks,
      totalAnnotators,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }, [projects, tasks]);

  // 最近项目列表
  const recentProjects = useMemo(() => {
    return projects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [projects]);

  const projectColumns: ColumnsType<any> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a href={`/data-annotation/projects/${record.id}`}>{text}</a>
      ),
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
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: 24 }}>标注总览</h2>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="项目总数"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中项目"
              value={stats.activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务总数"
              value={stats.totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={stats.completionRate.toFixed(1)}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成任务"
              value={stats.completedTasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理任务"
              value={stats.pendingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="质检中任务"
              value={stats.reviewingTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="标注员数量"
              value={stats.totalAnnotators}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近项目 */}
      <Card title="最近项目" style={{ marginBottom: 24 }}>
        <Table
          columns={projectColumns}
          dataSource={recentProjects}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 任务状态分布 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="任务状态分布">
            <div style={{ padding: '20px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <span>已完成: </span>
                <Progress
                  percent={Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}
                  status="success"
                  format={() => `${stats.completedTasks}`}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <span>待处理: </span>
                <Progress
                  percent={Math.round((stats.pendingTasks / stats.totalTasks) * 100) || 0}
                  status="active"
                  format={() => `${stats.pendingTasks}`}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <span>质检中: </span>
                <Progress
                  percent={Math.round((stats.reviewingTasks / stats.totalTasks) * 100) || 0}
                  format={() => `${stats.reviewingTasks}`}
                />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="项目状态分布">
            <div style={{ padding: '20px 0' }}>
              {[
                { label: '进行中', value: stats.activeProjects, color: '#52c41a' },
                {
                  label: '草稿',
                  value: projects.filter((p) => p.status === 'draft').length,
                  color: '#d9d9d9',
                },
                {
                  label: '已完成',
                  value: projects.filter((p) => p.status === 'completed').length,
                  color: '#1890ff',
                },
                {
                  label: '已暂停',
                  value: projects.filter((p) => p.status === 'paused').length,
                  color: '#faad14',
                },
              ].map((item) => (
                <div key={item.label} style={{ marginBottom: 16 }}>
                  <span>{item.label}: </span>
                  <Progress
                    percent={
                      stats.totalProjects > 0
                        ? Math.round((item.value / stats.totalProjects) * 100)
                        : 0
                    }
                    strokeColor={item.color}
                    format={() => `${item.value}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Overview;









