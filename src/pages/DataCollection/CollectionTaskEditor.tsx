import React, { useState, useCallback, useRef } from 'react';
import {
  Button,
  Input,
  Drawer,
  message,
  Typography,
  Modal,
  Form,
  Select,
  Space,
  Popover,
} from 'antd';
import {
  SaveOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  CodeOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDataStore } from '../../store/dataStore';
import './CollectionTaskEditor.css';

const { Text } = Typography;

// 开始节点组件
const StartNode = () => {
  return (
    <div className="custom-node start-node">
      <div className="node-header">
        <CheckCircleOutlined style={{ marginRight: 8, color: '#fff' }} />
        <span className="node-title">开始</span>
      </div>
      <div className="node-content">
        <Handle type="source" position={Position.Right} id="output" />
      </div>
    </div>
  );
};

// 结束节点组件
const EndNode = () => {
  return (
    <div className="custom-node end-node">
      <div className="node-header">
        <CheckCircleOutlined style={{ marginRight: 8, color: '#fff' }} />
        <span className="node-title">结束</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
      </div>
    </div>
  );
};

// 数据源节点（数据库）
const DataSourceNode = ({ data }: any) => {
  return (
    <div className="custom-node data-source-node">
      <div className="node-header">
        <DatabaseOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '数据源'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
        <div className="node-info">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {data.sourceName || '未配置'}
          </Text>
        </div>
      </div>
    </div>
  );
};

// 爬虫节点
const CrawlerNode = ({ data }: any) => {
  return (
    <div className="custom-node crawler-node">
      <div className="node-header">
        <ApiOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '网络爬虫'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
        <div className="node-info">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {data.url || '未配置'}
          </Text>
        </div>
      </div>
    </div>
  );
};

// 处理器节点
const ProcessorNode = ({ data }: any) => {
  return (
    <div className="custom-node processor-node">
      <div className="node-header">
        <CodeOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '数据清洗'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
      </div>
    </div>
  );
};

// 条件节点
const ConditionNode = ({ data }: any) => {
  return (
    <div className="custom-node condition-node">
      <div className="node-header">
        <BranchesOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '条件判断'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Top} id="output-true" style={{ top: '50%', left: '30%' }} />
        <Handle type="source" position={Position.Bottom} id="output-false" style={{ bottom: '50%', left: '70%' }} />
        <div className="node-info">
          <Text type="secondary" style={{ fontSize: 12 }}>
            IF 选择器
          </Text>
        </div>
      </div>
    </div>
  );
};

// 存储节点
const StorageNode = ({ data }: any) => {
  return (
    <div className="custom-node storage-node">
      <div className="node-header">
        <CloudUploadOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '数据存储'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <div className="node-info">
          <Text type="secondary" style={{ fontSize: 12 }}>
            {data.storageName || '未配置'}
          </Text>
        </div>
      </div>
    </div>
  );
};

// 数据转换节点
const TransformNode = ({ data }: any) => {
  return (
    <div className="custom-node transform-node">
      <div className="node-header">
        <TableOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '数据转换'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
      </div>
    </div>
  );
};

// 数据过滤节点
const FilterNode = ({ data }: any) => {
  return (
    <div className="custom-node filter-node">
      <div className="node-header">
        <FileTextOutlined style={{ marginRight: 8 }} />
        <span className="node-title">{data.label || '数据过滤'}</span>
      </div>
      <div className="node-content">
        <Handle type="target" position={Position.Left} id="input" />
        <Handle type="source" position={Position.Right} id="output" />
      </div>
    </div>
  );
};

const nodeTypes: Record<string, React.ComponentType<any>> = {
  start: StartNode,
  end: EndNode,
  dataSource: DataSourceNode,
  crawler: CrawlerNode,
  processor: ProcessorNode,
  condition: ConditionNode,
  storage: StorageNode,
  transform: TransformNode,
  filter: FilterNode,
};

interface NodeTemplate {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const nodeTemplates: NodeTemplate[] = [
  { type: 'dataSource', label: '数据源', icon: <DatabaseOutlined />, category: '数据源' },
  { type: 'crawler', label: '网络爬虫', icon: <ApiOutlined />, category: '数据源' },
  { type: 'processor', label: '数据清洗', icon: <CodeOutlined />, category: '数据处理' },
  { type: 'transform', label: '数据转换', icon: <TableOutlined />, category: '数据处理' },
  { type: 'filter', label: '数据过滤', icon: <FileTextOutlined />, category: '数据处理' },
  { type: 'condition', label: '条件判断', icon: <BranchesOutlined />, category: '业务逻辑' },
  { type: 'storage', label: '数据存储', icon: <CloudUploadOutlined />, category: '存储' },
];

const CollectionTaskEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { collectionTasks, addCollectionTask, updateCollectionTask } = useDataStore();
  const [taskName, setTaskName] = useState('新建采集任务');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeConfigDrawerVisible, setNodeConfigDrawerVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [nodePanelVisible, setNodePanelVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [cronModalVisible, setCronModalVisible] = useState(false);
  const [configForm] = Form.useForm();
  const [cronForm] = Form.useForm();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 初始化节点（如果是编辑模式，加载已有数据）
  React.useEffect(() => {
    if (id) {
      const task = collectionTasks.find((t) => t.id === id);
      if (task) {
        setTaskName(task.name);
        setNodes(
          task.nodes.map((n) => ({
            id: n.id,
            type: n.type || 'default',
            position: n.position,
            data: n.data,
          }))
        );
        setEdges(
          task.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
          }))
        );
        // 加载cron配置
        if (task.cron) {
          cronForm.setFieldsValue({
            cron: task.cron,
            cronDescription: task.cronDescription,
          });
        }
      }
    } else {
      // 新建任务，添加开始节点
      setNodes([
        {
          id: 'start',
          type: 'start',
          position: { x: 100, y: 300 },
          data: { label: '开始' },
        },
      ]);
    }
  }, [id, collectionTasks, cronForm]);

  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (!nodeType) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType,
        position,
        data: { label, type: nodeType },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodePanelVisible(false);
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
    setNodeConfigDrawerVisible(true);
  };

  const handleSave = () => {
    if (!taskName.trim()) {
      message.error('请输入任务名称');
      return;
    }

    // 获取cron配置
    const cronValues = cronForm.getFieldsValue();

    const taskData = {
      name: taskName,
      description: '',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || 'default',
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
      status: 'draft' as const,
      cron: cronValues.cron,
      cronDescription: cronValues.cronDescription,
    };

    if (id) {
      updateCollectionTask(id, taskData);
      message.success('保存成功');
    } else {
      addCollectionTask(taskData);
      message.success('创建成功');
      navigate('/data-collection/tasks');
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    message.success('任务已启动');
    // 这里应该调用API启动任务
  };

  const handleStop = () => {
    setIsRunning(false);
    message.info('任务已停止');
    // 这里应该调用API停止任务
  };

  const handleCronSave = () => {
    cronForm.validateFields().then((values) => {
      // 保存cron配置到任务中
      if (id) {
        updateCollectionTask(id, {
          cron: values.cron,
          cronDescription: values.cronDescription,
        });
        message.success('Cron配置已保存');
      } else {
        // 新建任务时，cron配置会在保存任务时一起保存
        message.success('Cron配置已保存');
      }
      setCronModalVisible(false);
    });
  };

  const handleNodeConfigSave = () => {
    // 保存节点配置
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id ? { ...node, data: { ...node.data, ...configForm.getFieldsValue() } } : node
        )
      );
      message.success('节点配置已保存');
      setNodeConfigDrawerVisible(false);
    }
  };

  React.useEffect(() => {
    if (nodeConfigDrawerVisible && selectedNode) {
      configForm.setFieldsValue(selectedNode.data);
    }
  }, [nodeConfigDrawerVisible, selectedNode, configForm]);

  const filteredNodeTemplates = nodeTemplates.filter(
    (template) =>
      template.label.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      template.category.includes(searchKeyword)
  );

  const groupedTemplates = filteredNodeTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, NodeTemplate[]>);

  const nodePanelContent = (
    <div className="node-panel-popover">
      <Input
        placeholder="搜索节点"
        prefix={<SearchOutlined />}
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ marginBottom: 12 }}
        size="small"
      />
      <div className="node-panel-popover-content">
        {Object.entries(groupedTemplates).map(([category, templates]) => (
          <div key={category} className="node-category-popover">
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              {category}
            </Text>
            {templates.map((template) => (
              <div
                key={template.type}
                className="node-item-popover"
                draggable
                onDragStart={(e) => onDragStart(e, template.type, template.label)}
              >
                <span className="node-item-icon">{template.icon}</span>
                <span className="node-item-label">{template.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="task-editor-container">
      {/* 顶部工具栏 */}
      <div className="editor-header">
        <div className="header-left">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/data-collection/tasks')}
          >
            返回
          </Button>
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            bordered={false}
            style={{ fontSize: 18, fontWeight: 500, width: 200 }}
          />
          <Text type="secondary" style={{ marginLeft: 16 }}>
            已自动保存 {new Date().toLocaleTimeString()}
          </Text>
        </div>
        <div className="header-right">
          <Space>
            <Button
              icon={<ClockCircleOutlined />}
              onClick={() => setCronModalVisible(true)}
            >
              定时任务
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleSave}>
              保存
            </Button>
            {isRunning ? (
              <Button type="primary" danger icon={<StopOutlined />} onClick={handleStop}>
                停止
              </Button>
            ) : (
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleRun}>
                运行
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="editor-content-wrapper">
        {/* 主画布区域 */}
        <div className="flow-container" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            className="react-flow-container"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>


      {/* 底部工具栏 */}
      <div className="editor-footer">
        <div className="footer-left">
          <Text type="secondary">80%</Text>
        </div>
        <div className="footer-center">
          <Popover
            content={nodePanelContent}
            title="添加节点"
            trigger="click"
            open={nodePanelVisible}
            onOpenChange={setNodePanelVisible}
            placement="top"
            overlayStyle={{ width: 300, maxHeight: 400 }}
          >
            <Button icon={<PlusOutlined />}>添加节点</Button>
          </Popover>
        </div>
        <div className="footer-right">
          <Button type="primary" icon={<PlayCircleOutlined />}>
            试运行
          </Button>
        </div>
      </div>

      {/* Cron配置弹窗 */}
      <Modal
        title="定时任务配置"
        open={cronModalVisible}
        onOk={handleCronSave}
        onCancel={() => {
          setCronModalVisible(false);
          cronForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={cronForm} layout="vertical">
          <Form.Item label="Cron表达式" name="cron" rules={[{ required: true, message: '请输入Cron表达式' }]}>
            <Input placeholder="例如：0 0 2 * * ? (每天凌晨2点执行)" />
          </Form.Item>
          <Form.Item label="任务描述" name="cronDescription">
            <Input.TextArea rows={3} placeholder="描述定时任务的执行计划" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 节点配置抽屉 */}
      <Drawer
        title="节点配置"
        open={nodeConfigDrawerVisible}
        onClose={() => {
          setNodeConfigDrawerVisible(false);
          setSelectedNode(null);
        }}
        width={500}
        footer={
          <Space>
            <Button onClick={() => setNodeConfigDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleNodeConfigSave}>
              保存
            </Button>
          </Space>
        }
      >
        {selectedNode && renderNodeConfig(selectedNode)}
      </Drawer>
    </div>
  );

  function renderNodeConfig(node: any) {
    const nodeType = node.type || node.data?.type;

    if (nodeType === 'dataSource') {
      return (
        <Form form={configForm} layout="vertical">
          <Form.Item label="数据源名称" name="sourceName">
            <Select placeholder="请选择数据源">
              <Select.Option value="source1">数据源1</Select.Option>
              <Select.Option value="source2">数据源2</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="SQL语句" name="sql">
            <Input.TextArea rows={4} placeholder="请输入SQL查询语句" />
          </Form.Item>
        </Form>
      );
    }

    if (nodeType === 'crawler') {
      return (
        <Form form={configForm} layout="vertical">
          <Form.Item label="爬虫URL" name="url" rules={[{ required: true, message: '请输入URL' }]}>
            <Input placeholder="https://example.com" />
          </Form.Item>
          <Form.Item label="请求方法" name="method">
            <Select defaultValue="GET">
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="请求头" name="headers">
            <Input.TextArea rows={3} placeholder="JSON格式的请求头" />
          </Form.Item>
        </Form>
      );
    }

    if (nodeType === 'storage') {
      return (
        <Form form={configForm} layout="vertical">
          <Form.Item label="存储名称" name="storageName">
            <Input placeholder="请输入存储名称" />
          </Form.Item>
          <Form.Item label="存储类型" name="storageType">
            <Select>
              <Select.Option value="database">数据库</Select.Option>
              <Select.Option value="file">文件</Select.Option>
              <Select.Option value="api">API</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      );
    }

    return (
      <Form form={configForm} layout="vertical">
        <Form.Item label="节点名称" name="label">
          <Input placeholder="请输入节点名称" />
        </Form.Item>
        <Form.Item label="节点描述" name="description">
          <Input.TextArea rows={3} placeholder="请输入节点描述" />
        </Form.Item>
      </Form>
    );
  }
};

export default CollectionTaskEditor;
