import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  message,
  Popconfirm,
  Checkbox,
  Cascader,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  useAnnotationStore,
  type LabelTemplate,
  type AnnotationTaskType,
  TASK_TYPE_CATEGORIES,
  TASK_TYPE_MAP,
} from '../../store/annotationStore';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

const LabelTemplates: React.FC = () => {
  const { labelTemplates, addLabelTemplate, updateLabelTemplate, deleteLabelTemplate } =
    useAnnotationStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [form] = Form.useForm();

  // 将任务类型分类转换为 Cascader 的 options 格式
  const taskTypeCascaderOptions = TASK_TYPE_CATEGORIES.map((category) => ({
    label: category.label,
    value: category.value,
    children: category.children.map((child) => ({
      label: (
        <Tooltip title={child.description} placement="right">
          <span>{child.label}</span>
        </Tooltip>
      ),
      value: child.value,
    })),
  }));

  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    form.setFieldsValue({
      type: ['text', 'text_classification'], // Cascader 的值是数组格式
      allowMultiple: false,
      required: false,
    });
    setModalVisible(true);
  };

  const handleEdit = (template: LabelTemplate) => {
    setEditingTemplate(template);
    // 找到任务类型所属的分类
    let categoryValue = '';
    for (const category of TASK_TYPE_CATEGORIES) {
      if (category.children.some((child) => child.value === template.type)) {
        categoryValue = category.value;
        break;
      }
    }
    form.setFieldsValue({
      ...template,
      type: categoryValue ? [categoryValue, template.type] : template.type,
      labels: template.labels || [],
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    deleteLabelTemplate(id);
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理任务类型：如果是数组（Cascader），取最后一个值；否则直接使用
      let taskType: AnnotationTaskType;
      if (Array.isArray(values.type) && values.type.length > 0) {
        taskType = values.type[values.type.length - 1] as AnnotationTaskType;
      } else if (typeof values.type === 'string' && values.type) {
        taskType = values.type as AnnotationTaskType;
      } else {
        message.error('请选择任务类型');
        return;
      }
      
      // 处理标签列表
      const labels = values.labels || [];
      
      if (editingTemplate) {
        updateLabelTemplate(editingTemplate.id, {
          ...values,
          type: taskType,
          labels,
        });
        message.success('更新成功');
      } else {
        addLabelTemplate({
          ...values,
          type: taskType,
          labels,
          config: {
            allowMultiple: values.allowMultiple,
            required: values.required,
          },
        });
        message.success('创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns: ColumnsType<LabelTemplate> = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: AnnotationTaskType) => {
        return <Tag>{TASK_TYPE_MAP[type] || type}</Tag>;
      },
    },
    {
      title: '标签数量',
      key: 'labelCount',
      width: 120,
      render: (_: any, record: LabelTemplate) => record.labels?.length || 0,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: LabelTemplate) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个标签模板吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        className="card-elevated"
        title="标签模板"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            创建模板
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={labelTemplates}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          rowClassName={() => 'table-row-hover'}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingTemplate ? '编辑标签模板' : '创建标签模板'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTemplate(null);
        }}
        width={700}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
            extra="先选择大类，再选择具体的任务类型"
          >
            <Cascader
              options={taskTypeCascaderOptions}
              placeholder="请选择任务类型（先选大类，再选具体类型）"
            showSearch={{
              filter: (inputValue, path) => {
                const keyword = inputValue.toLowerCase();
                return path.some((option) => {
                  const text = String(option.value || option.label || '').toLowerCase();
                  return text.includes(keyword);
                });
              },
            }}
            displayRender={(labels, selectedOptions) => {
              if (selectedOptions && selectedOptions.length > 0) {
                const lastOption = selectedOptions[selectedOptions.length - 1];
                const taskType = lastOption.value as AnnotationTaskType;
                return TASK_TYPE_MAP[taskType] || taskType;
              }
              return labels.join(' / ');
            }}
              changeOnSelect={false}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入模板描述（可选）" />
          </Form.Item>

          <Form.Item
            name="labels"
            label="标签列表"
            rules={[{ required: true, message: '请至少添加一个标签' }]}
            extra="标签将在标注界面中显示，支持设置颜色和快捷键"
          >
            <Form.List name="labels">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        rules={[{ required: true, message: '请输入标签名称' }]}
                      >
                        <Input placeholder="标签名称" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        rules={[{ required: true, message: '请输入标签值' }]}
                      >
                        <Input placeholder="标签值" />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'color']}>
                        <Input placeholder="颜色（如：#1890ff）" />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'shortcut']}>
                        <Input placeholder="快捷键" style={{ width: 100 }} />
                      </Form.Item>
                      <Button onClick={() => remove(field.name)}>删除</Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    添加标签
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            name="allowMultiple"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>允许多选</Checkbox>
          </Form.Item>

          <Form.Item
            name="required"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>必填</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabelTemplates;
