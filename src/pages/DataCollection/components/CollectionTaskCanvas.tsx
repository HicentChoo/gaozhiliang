import React, { useCallback, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Drawer,
} from 'antd';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { Connection, Node, Edge } from 'reactflow';
import type { CollectionTask } from '../../../store/dataStore';

interface CollectionTaskCanvasProps {
  visible: boolean;
  task: CollectionTask | null;
  onCancel: () => void;
  onSave: (task: Partial<CollectionTask>) => void;
}

const nodeTypes = {
  dataSource: ({ data }: any) => (
    <div
      style={{
        padding: '10px 15px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '8px',
        minWidth: '120px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {data.label}
    </div>
  ),
  processor: ({ data }: any) => (
    <div
      style={{
        padding: '10px 15px',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        borderRadius: '8px',
        minWidth: '120px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {data.label}
    </div>
  ),
  storage: ({ data }: any) => (
    <div
      style={{
        padding: '10px 15px',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: 'white',
        borderRadius: '8px',
        minWidth: '120px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      {data.label}
    </div>
  ),
};

const CollectionTaskCanvas: React.FC<CollectionTaskCanvasProps> = ({
  visible,
  task,
  onCancel,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [configDrawerVisible, setConfigDrawerVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: Node[] = task?.nodes || [
    {
      id: '1',
      type: 'dataSource',
      position: { x: 250, y: 100 },
      data: { label: '数据源', type: 'dataSource' },
    },
  ];

  const initialEdges: Edge[] = task?.edges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleAddNode = (type: string) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: {
        label: type === 'dataSource' ? '数据源' : type === 'processor' ? '处理器' : '存储',
        type,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setConfigDrawerVisible(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const taskData = {
        name: values.name,
        description: values.description,
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
      };
      onSave(taskData);
      form.resetFields();
    });
  };

  React.useEffect(() => {
    if (task) {
      form.setFieldsValue({
        name: task.name,
        description: task.description,
      });
      setNodes(
        task.nodes.map((n) => ({
          id: n.id,
          type: n.type,
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
    } else {
      form.resetFields();
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [task, visible]);

  return (
    <Modal
      title={task ? '编辑采集任务' : '创建采集任务'}
      open={visible}
      onCancel={onCancel}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginBottom: 16 }}>
        <Form.Item
          name="name"
          label="任务名称"
          rules={[{ required: true, message: '请输入任务名称' }]}
        >
          <Input placeholder="请输入任务名称" />
        </Form.Item>
        <Form.Item name="description" label="任务描述">
          <Input.TextArea placeholder="请输入任务描述" rows={2} />
        </Form.Item>
      </Form>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, height: '600px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #d9d9d9', background: '#fafafa' }}>
            <Space>
              <Button size="small" onClick={() => handleAddNode('dataSource')}>
                添加数据源
              </Button>
              <Button size="small" onClick={() => handleAddNode('processor')}>
                添加处理器
              </Button>
              <Button size="small" onClick={() => handleAddNode('storage')}>
                添加存储
              </Button>
            </Space>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      <Drawer
        title="节点配置"
        open={configDrawerVisible}
        onClose={() => setConfigDrawerVisible(false)}
        width={400}
      >
        {selectedNode && (
          <div>
            <p>节点ID: {selectedNode.id}</p>
            <p>节点类型: {selectedNode.data?.type}</p>
            <p>节点标签: {selectedNode.data?.label}</p>
            {/* 这里可以添加更多配置项 */}
          </div>
        )}
      </Drawer>
    </Modal>
  );
};

export default CollectionTaskCanvas;

