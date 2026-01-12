import React, { useState } from 'react';
import { Card, Tabs, Button, Row, Col } from 'antd';
import {
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import './AnnotationScenarios.css';

const { TabPane } = Tabs;

interface Scenario {
  id: string;
  name: string;
  description: string;
  type: string;
  icon?: React.ReactNode;
}

const AnnotationScenarios: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dialogue');

  const scenarios: Record<string, Scenario[]> = {
    dialogue: [
      {
        id: '1',
        name: '多轮对话',
        description: '支持多轮对话数据的标注，适用于对话系统训练',
        type: 'dialogue',
      },
      {
        id: '2',
        name: '单轮对话',
        description: '支持单轮问答数据的标注',
        type: 'dialogue',
      },
      {
        id: '3',
        name: '大模型文档标注',
        description: '支持大模型文档的结构化标注',
        type: 'dialogue',
      },
    ],
    image: [
      {
        id: '4',
        name: '图像分类',
        description: '对图像进行分类标注',
        type: 'image',
      },
      {
        id: '5',
        name: '目标检测',
        description: '对图像中的目标进行检测和标注',
        type: 'image',
      },
      {
        id: '6',
        name: '图像分割',
        description: '对图像进行像素级分割标注',
        type: 'image',
      },
    ],
    audio: [
      {
        id: '7',
        name: '语音识别',
        description: '对语音进行转文字标注',
        type: 'audio',
      },
      {
        id: '8',
        name: '语音分类',
        description: '对语音进行分类标注',
        type: 'audio',
      },
    ],
    nlp: [
      {
        id: '9',
        name: '命名实体识别',
        description: '识别文本中的实体',
        type: 'nlp',
      },
      {
        id: '10',
        name: '文本分类',
        description: '对文本进行分类标注',
        type: 'nlp',
      },
    ],
    video: [
      {
        id: '11',
        name: '视频分类',
        description: '对视频进行分类标注',
        type: 'video',
      },
      {
        id: '12',
        name: '视频目标跟踪',
        description: '对视频中的目标进行跟踪标注',
        type: 'video',
      },
    ],
    pointcloud: [
      {
        id: '13',
        name: '点云标注',
        description: '对3D点云数据进行标注',
        type: 'pointcloud',
      },
    ],
  };

  const handleExperience = (scenario: Scenario) => {
    console.log('体验场景:', scenario);
    // TODO: 实现体验功能
  };

  const handleCreate = (scenario: Scenario) => {
    console.log('创建场景:', scenario);
    // TODO: 实现创建功能
  };

  return (
    <div className="annotation-scenarios">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="大模型对话" key="dialogue">
          <Row gutter={[16, 16]}>
            {scenarios.dialogue.map((scenario) => (
              <Col key={scenario.id} xs={24} sm={12} lg={8}>
                <Card
                  className="scenario-card"
                  hoverable
                  cover={
                    <div className="scenario-cover">
                      <div className="scenario-preview">
                        {/* 这里可以放置场景预览图 */}
                        <div className="preview-placeholder">
                          {scenario.name}
                        </div>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="experience"
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleExperience(scenario)}
                    >
                      体验
                    </Button>,
                    <Button
                      key="create"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleCreate(scenario)}
                    >
                      创建
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={scenario.name}
                    description={scenario.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="图片" key="image">
          <Row gutter={[16, 16]}>
            {scenarios.image.map((scenario) => (
              <Col key={scenario.id} xs={24} sm={12} lg={8}>
                <Card
                  className="scenario-card"
                  hoverable
                  cover={
                    <div className="scenario-cover">
                      <div className="scenario-preview">
                        <div className="preview-placeholder">
                          {scenario.name}
                        </div>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="experience"
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleExperience(scenario)}
                    >
                      体验
                    </Button>,
                    <Button
                      key="create"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleCreate(scenario)}
                    >
                      创建
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={scenario.name}
                    description={scenario.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="音频" key="audio">
          <Row gutter={[16, 16]}>
            {scenarios.audio.map((scenario) => (
              <Col key={scenario.id} xs={24} sm={12} lg={8}>
                <Card
                  className="scenario-card"
                  hoverable
                  cover={
                    <div className="scenario-cover">
                      <div className="scenario-preview">
                        <div className="preview-placeholder">
                          {scenario.name}
                        </div>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="experience"
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleExperience(scenario)}
                    >
                      体验
                    </Button>,
                    <Button
                      key="create"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleCreate(scenario)}
                    >
                      创建
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={scenario.name}
                    description={scenario.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="NLP" key="nlp">
          <Row gutter={[16, 16]}>
            {scenarios.nlp.map((scenario) => (
              <Col key={scenario.id} xs={24} sm={12} lg={8}>
                <Card
                  className="scenario-card"
                  hoverable
                  cover={
                    <div className="scenario-cover">
                      <div className="scenario-preview">
                        <div className="preview-placeholder">
                          {scenario.name}
                        </div>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="experience"
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleExperience(scenario)}
                    >
                      体验
                    </Button>,
                    <Button
                      key="create"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleCreate(scenario)}
                    >
                      创建
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={scenario.name}
                    description={scenario.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="视频" key="video">
          <Row gutter={[16, 16]}>
            {scenarios.video.map((scenario) => (
              <Col key={scenario.id} xs={24} sm={12} lg={8}>
                <Card
                  className="scenario-card"
                  hoverable
                  cover={
                    <div className="scenario-cover">
                      <div className="scenario-preview">
                        <div className="preview-placeholder">
                          {scenario.name}
                        </div>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="experience"
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleExperience(scenario)}
                    >
                      体验
                    </Button>,
                    <Button
                      key="create"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleCreate(scenario)}
                    >
                      创建
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={scenario.name}
                    description={scenario.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="点云" key="pointcloud">
          <Row gutter={[16, 16]}>
            {scenarios.pointcloud.map((scenario) => (
              <Col key={scenario.id} xs={24} sm={12} lg={8}>
                <Card
                  className="scenario-card"
                  hoverable
                  cover={
                    <div className="scenario-cover">
                      <div className="scenario-preview">
                        <div className="preview-placeholder">
                          {scenario.name}
                        </div>
                      </div>
                    </div>
                  }
                  actions={[
                    <Button
                      key="experience"
                      type="link"
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleExperience(scenario)}
                    >
                      体验
                    </Button>,
                    <Button
                      key="create"
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleCreate(scenario)}
                    >
                      创建
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={scenario.name}
                    description={scenario.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnnotationScenarios;
















