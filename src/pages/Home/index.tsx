import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Steps,
  Typography,
  Space,
  Tag,
} from 'antd';
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import './index.css';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { dataSources, collectionTasks, datasets } = useDataStore();

  const stats = [
    {
      title: '数据源',
      value: dataSources.length,
      prefix: <DatabaseOutlined />,
      color: '#3f8600',
      onClick: () => navigate('/data-collection/sources'),
    },
    {
      title: '采集任务',
      value: collectionTasks.length,
      prefix: <CloudUploadOutlined />,
      color: '#1890ff',
      onClick: () => navigate('/data-collection/tasks'),
    },
    {
      title: '数据集',
      value: datasets.length,
      prefix: <FileTextOutlined />,
      color: '#722ed1',
      onClick: () => navigate('/datasets'),
    },
    {
      title: '总样本数',
      value: datasets.reduce((sum, ds) => {
        return sum + ds.versions.reduce((vSum, v) => vSum + v.sampleCount, 0);
      }, 0),
      prefix: <BarChartOutlined />,
      color: '#eb2f96',
    },
  ];

  const steps = [
    {
      title: '数据采集',
      description: '配置数据源，创建采集任务',
      icon: <CloudUploadOutlined />,
      content: (
        <div>
          <p>支持结构化、半结构化、非结构化数据的采集</p>
          <Space>
            <Tag color="blue">拖拽编排</Tag>
            <Tag color="green">可视化配置</Tag>
            <Tag color="orange">网络爬虫</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: '数据集管理',
      description: '创建和管理数据集',
      icon: <DatabaseOutlined />,
      content: (
        <div>
          <p>创建数据集，支持多版本管理</p>
          <Space>
            <Tag color="purple">版本控制</Tag>
            <Tag color="cyan">样本管理</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: '数据处理',
      description: '数据预处理和增强',
      icon: <FileTextOutlined />,
      content: (
        <div>
          <p>对数据集进行清洗、转换、增强等处理</p>
          <Space>
            <Tag color="magenta">数据清洗</Tag>
            <Tag color="gold">数据增强</Tag>
          </Space>
        </div>
      ),
    },
    {
      title: '数据导出',
      description: '导出处理好的数据集',
      icon: <CheckCircleOutlined />,
      content: (
        <div>
          <p>导出为多种格式，用于AI模型训练</p>
          <Space>
            <Tag color="success">多格式支持</Tag>
            <Tag color="processing">批量导出</Tag>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <Title level={2}>
          <RocketOutlined /> 欢迎使用高质量数据集管理服务平台
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          一站式AI数据加工平台，助力您的AI模型训练
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              onClick={stat.onClick}
              style={{
                cursor: stat.onClick ? 'pointer' : 'default',
                transition: 'all 0.3s',
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  <span style={{ color: stat.color, fontSize: 24 }}>
                    {stat.prefix}
                  </span>
                }
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="使用流程" style={{ marginBottom: 24 }}>
        <Steps
          direction="horizontal"
          size="default"
          items={steps.map((step) => ({
            title: step.title,
            description: (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: '#666', marginBottom: 8 }}>{step.description}</div>
                {step.content}
              </div>
            ),
            icon: step.icon,
            status: 'finish' as const,
          }))}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="快速开始" hoverable>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card
                size="small"
                hoverable
                onClick={() => navigate('/data-collection/sources')}
                style={{ cursor: 'pointer' }}
              >
                <Space>
                  <DatabaseOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>创建数据源</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      配置数据采集的源和存储
                    </div>
                  </div>
                </Space>
              </Card>
              <Card
                size="small"
                hoverable
                onClick={() => navigate('/data-collection/tasks')}
                style={{ cursor: 'pointer' }}
              >
                <Space>
                  <CloudUploadOutlined
                    style={{ fontSize: 20, color: '#52c41a' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>创建采集任务</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      通过拖拽方式编排采集流程
                    </div>
                  </div>
                </Space>
              </Card>
              <Card
                size="small"
                hoverable
                onClick={() => navigate('/datasets')}
                style={{ cursor: 'pointer' }}
              >
                <Space>
                  <FileTextOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                  <div>
                    <div style={{ fontWeight: 500 }}>创建数据集</div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      管理您的数据集和版本
                    </div>
                  </div>
                </Space>
              </Card>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="平台特色">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Tag color="blue" style={{ marginBottom: 8 }}>
                  拖拽编排
                </Tag>
                <p style={{ margin: 0, color: '#666' }}>
                  可视化流程编排，通过拖拽组件快速构建数据采集任务
                </p>
              </div>
              <div>
                <Tag color="green" style={{ marginBottom: 8 }}>
                  多数据源支持
                </Tag>
                <p style={{ margin: 0, color: '#666' }}>
                  支持结构化、半结构化、非结构化数据的统一管理
                </p>
              </div>
              <div>
                <Tag color="purple" style={{ marginBottom: 8 }}>
                  版本管理
                </Tag>
                <p style={{ margin: 0, color: '#666' }}>
                  数据集多版本管理，支持版本对比和回退
                </p>
              </div>
              <div>
                <Tag color="orange" style={{ marginBottom: 8 }}>
                  智能处理
                </Tag>
                <p style={{ margin: 0, color: '#666' }}>
                  自动化数据预处理和增强，提升数据质量
                </p>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;

