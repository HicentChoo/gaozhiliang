import React, { useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Space } from 'antd';
import {
  FileTextOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import './AnnotationOverview.css';

const { RangePicker } = DatePicker;

const AnnotationOverview: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, 'day').startOf('day'),
    dayjs().endOf('day'),
  ]);

  // 模拟数据
  const taskStats = {
    total: 72,
    inProgress: 30,
    pending: 31,
    completed: 11,
  };

  const dataStats = {
    total: 51661,
    inProgress: 51038,
    pending: 439,
    completed: 184,
  };

  const taskTypeStats = [
    { type: '图片', count: 21, color: '#13c2c2' },
  ];

  const taskProgressData = [
    { name: 'test122', total: 20, completed: 15 },
  ];

  return (
    <div className="annotation-overview">
      <Row gutter={[16, 16]}>
        {/* 任务个数统计 */}
        <Col span={12}>
          <Card>
            <Statistic
              title="任务个数(个)"
              value={taskStats.total}
              prefix={<FileTextOutlined />}
            />
            <div className="stat-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">进行中:</span>
                <span className="breakdown-value blue">{taskStats.inProgress}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">待启动:</span>
                <span className="breakdown-value orange">{taskStats.pending}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">已完成:</span>
                <span className="breakdown-value green">{taskStats.completed}</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* 数据总量统计 */}
        <Col span={12}>
          <Card>
            <Statistic
              title="数据总量(条)"
              value={dataStats.total}
              prefix={<DatabaseOutlined />}
            />
            <div className="stat-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">进行中:</span>
                <span className="breakdown-value blue">{dataStats.inProgress}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">待启动:</span>
                <span className="breakdown-value orange">{dataStats.pending}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">已完成:</span>
                <span className="breakdown-value green">{dataStats.completed}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 日期范围选择 */}
      <Card style={{ marginTop: 16 }}>
        <Space>
          <span>时间范围:</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]!, dates[1]!]);
              }
            }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 任务类型统计 */}
        <Col span={12}>
          <Card title={`任务类型统计 ${taskTypeStats.reduce((sum, item) => sum + item.count, 0)}`}>
            <div className="task-type-chart">
              <div className="task-type-circle">
                <div
                  className="circle-segment"
                  style={{
                    background: `conic-gradient(${taskTypeStats.map((item, index) => 
                      `${item.color} ${index * (100 / taskTypeStats.length)}% ${(index + 1) * (100 / taskTypeStats.length)}%`
                    ).join(', ')})`,
                  }}
                />
              </div>
              <div className="task-type-legend">
                {taskTypeStats.map((item) => (
                  <div key={item.type} className="legend-item">
                    <span className="legend-dot" style={{ background: item.color }} />
                    <span>{item.type} {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* 任务完成进度 */}
        <Col span={12}>
          <Card
            title="任务完成进度"
            extra={
              <Select defaultValue="asc" style={{ width: 100 }}>
                <Select.Option value="asc">升序</Select.Option>
                <Select.Option value="desc">降序</Select.Option>
              </Select>
            }
          >
            <div className="task-progress-chart">
              <div className="chart-y-axis">
                <span>单位: 条</span>
                <div className="y-axis-labels">
                  {[0, 5, 10, 15, 20, 25].map((val) => (
                    <div key={val}>{val}</div>
                  ))}
                </div>
              </div>
              <div className="chart-content">
                {taskProgressData.map((item) => (
                  <div key={item.name} className="bar-group">
                    <div className="bar-container">
                      <div
                        className="bar bar-total"
                        style={{ height: `${(item.total / 25) * 100}%` }}
                      />
                      <div
                        className="bar bar-completed"
                        style={{ height: `${(item.completed / 25) * 100}%` }}
                      />
                    </div>
                    <div className="bar-label">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-square blue-light" />
                <span>总量</span>
              </div>
              <div className="legend-item">
                <span className="legend-square blue-dark" />
                <span>已完成</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 任务完成时间分析 */}
      <Card title="任务完成时间分析" style={{ marginTop: 16 }}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无数据
        </div>
      </Card>
    </div>
  );
};

export default AnnotationOverview;
















