import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Radio,
  Button,
  message,
  Checkbox,
  Card,
  Divider,
  Cascader,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAnnotationStore, type AnnotationTaskType, TASK_TYPE_CATEGORIES, TASK_TYPE_MAP } from '../../../store/annotationStore';
import { useDataStore } from '../../../store/dataStore';
import { useAuthStore } from '../../../store/authStore';

const { TextArea } = Input;

interface CreateProjectWizardProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const { addProject, addTasks, labelTemplates } = useAnnotationStore();
  const { datasets: allDatasets } = useDataStore();
  const { user } = useAuthStore();

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

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      form.resetFields();
      form.setFieldsValue({
        taskType: ['text', 'text_qa'], // Cascader 的值是数组格式
        requireReview: true,
        allowMultipleAnnotations: false,
      });
    }
  }, [visible, form]);

  // 步骤1：项目基本信息
  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="项目名称"
        rules={[{ required: true, message: '请输入项目名称' }]}
      >
        <Input placeholder="请输入项目名称" />
      </Form.Item>

      <Form.Item name="description" label="项目描述">
        <TextArea rows={4} placeholder="请输入项目描述（可选）" />
      </Form.Item>

      <Form.Item
        name="taskType"
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
          onChange={() => {
            // 当任务类型改变时，清空已选择的标签模板
            form.setFieldsValue({ labelTemplateId: undefined });
          }}
          style={{ width: '100%' }}
        />
      </Form.Item>
    </Form>
  );

  // 步骤2：数据选择
  const renderStep2 = () => {
    const selectedDatasetId = Form.useWatch('datasetId', form);
    const selectedDataset = allDatasets.find((d) => d.id === selectedDatasetId);

    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="datasetId"
          label="选择数据集"
          rules={[{ required: true, message: '请选择数据集' }]}
        >
          <Select
            placeholder="请选择数据集"
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {allDatasets.map((dataset) => (
              <Select.Option key={dataset.id} value={dataset.id} label={dataset.name}>
                {dataset.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedDataset && (
          <Card size="small" style={{ marginTop: 16 }}>
            <div>
              <div>
                <strong>数据集名称：</strong>
                {selectedDataset.name}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>数据用途：</strong>
                {selectedDataset.dataUsage || '-'}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>样本数量：</strong>
                {selectedDataset.sampleCount || 0}
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>数据格式：</strong>
                {selectedDataset.format || '-'}
              </div>
            </div>
          </Card>
        )}

        <Form.Item
          name="sampleRange"
          label="样本范围"
          initialValue="all"
          rules={[{ required: true, message: '请选择样本范围' }]}
        >
          <Radio.Group>
            <Radio value="all">全部样本</Radio>
            <Radio value="latest">最新版本</Radio>
            <Radio value="custom">自定义（待实现）</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    );
  };

  // 步骤3：标注配置
  const renderStep3 = () => {
    const taskTypeValue = Form.useWatch('taskType', form);
    // 处理任务类型：如果是数组（Cascader），取最后一个值；否则直接使用
    let actualTaskType: AnnotationTaskType | undefined;
    if (Array.isArray(taskTypeValue) && taskTypeValue.length > 0) {
      actualTaskType = taskTypeValue[taskTypeValue.length - 1] as AnnotationTaskType;
    } else if (typeof taskTypeValue === 'string' && taskTypeValue) {
      actualTaskType = taskTypeValue as AnnotationTaskType;
    }
    
    // 过滤标签模板：匹配任务类型或自定义类型
    const availableTemplates = actualTaskType
      ? labelTemplates.filter(
          (t) => t.type === actualTaskType || t.type === 'custom'
        )
      : [];

    // 将模板转换为 Select 的 options 格式
    const templateOptions = availableTemplates.map((template) => ({
      value: template.id,
      label: template.name,
      template: template, // 保存完整模板对象用于自定义渲染
    }));

    return (
      <Form form={form} layout="vertical">
        <Form.Item
          name="labelTemplateId"
          label="标签模板"
          rules={[{ required: true, message: '请选择标签模板' }]}
          extra={
            !actualTaskType
              ? '请先在步骤1中选择任务类型'
              : availableTemplates.length === 0
              ? `当前任务类型 "${TASK_TYPE_MAP[actualTaskType] || actualTaskType}" 暂无可用模板，请先创建对应的标签模板`
              : `当前任务类型 "${TASK_TYPE_MAP[actualTaskType] || actualTaskType}"，找到 ${availableTemplates.length} 个可用模板`
          }
        >
          <Select
            placeholder="请选择标签模板"
            showSearch
            notFoundContent={
              availableTemplates.length === 0 ? (
                <div style={{ padding: '8px', textAlign: 'center', color: '#999' }}>
                  暂无可用模板，请先创建标签模板
                </div>
              ) : (
                '未找到匹配的模板'
              )
            }
            filterOption={(input, option) => {
              const template = availableTemplates.find((t) => t.id === option?.value);
              if (!template) return false;
              const searchText = input.toLowerCase();
              return (
                template.name.toLowerCase().includes(searchText) ||
                (template.description || '').toLowerCase().includes(searchText)
              );
            }}
            optionRender={(option) => {
              const template = availableTemplates.find((t) => t.id === option.value);
              if (!template) return option.label;
              return (
                <div>
                  <div style={{ fontWeight: 'bold' }}>{template.name}</div>
                  {template.description && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {template.description}
                    </div>
                  )}
                </div>
              );
            }}
          >
            {templateOptions.map((option) => (
              <Select.Option key={option.value} value={option.value} label={option.label}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{option.template.name}</div>
                  {option.template.description && (
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {option.template.description}
                    </div>
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider />

        <Form.Item
          name="annotatorIds"
          label="标注员"
          rules={[{ required: true, message: '请选择至少一个标注员' }]}
          extra="选择参与标注的用户（当前为演示，实际应从用户列表选择）"
        >
          <Checkbox.Group>
            <Checkbox value="user1">标注员1</Checkbox>
            <Checkbox value="user2">标注员2</Checkbox>
            <Checkbox value="user3">标注员3</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item
          name="reviewerIds"
          label="质检员"
          extra="选择负责质检的用户（可选）"
        >
          <Checkbox.Group>
            <Checkbox value="reviewer1">质检员1</Checkbox>
            <Checkbox value="reviewer2">质检员2</Checkbox>
          </Checkbox.Group>
        </Form.Item>

        <Divider />

        <Form.Item
          name="requireReview"
          valuePropName="checked"
          initialValue={true}
        >
          <Checkbox>需要质检审核</Checkbox>
        </Form.Item>

        <Form.Item
          name="allowMultipleAnnotations"
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox>允许多个标注员标注同一任务（用于一致性评估）</Checkbox>
        </Form.Item>
      </Form>
    );
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理任务类型：如果是数组（Cascader），取最后一个值；否则直接使用
      let taskType: AnnotationTaskType;
      if (Array.isArray(values.taskType)) {
        taskType = values.taskType[values.taskType.length - 1] as AnnotationTaskType;
      } else {
        taskType = values.taskType as AnnotationTaskType;
      }
      
      // 创建项目
      const project = {
        name: values.name,
        description: values.description,
        datasetId: values.datasetId,
        taskType: taskType,
        labelTemplateId: values.labelTemplateId,
        status: 'draft' as const,
        ownerId: user?.id || '1',
        annotatorIds: values.annotatorIds || [],
        reviewerIds: values.reviewerIds || [],
        config: {
          requireReview: values.requireReview,
          allowMultipleAnnotations: values.allowMultipleAnnotations,
        },
      };

      // 创建项目
      addProject(project);
      
      // 获取刚创建的项目（通过数量变化找到最新创建的项目）
      const store = useAnnotationStore.getState();
      const createdProject = store.projects.find(
        (p) => p.name === project.name && p.datasetId === project.datasetId && p.ownerId === project.ownerId
      );
      
      if (createdProject) {
        // 根据数据集生成任务（模拟）
        const selectedDataset = allDatasets.find((d) => d.id === values.datasetId);
        if (selectedDataset) {
          // 模拟生成任务（实际应该根据数据集样本生成）
          const mockTaskCount = selectedDataset.sampleCount || 10;
          const tasks = Array.from({ length: mockTaskCount }, (_, i) => ({
            projectId: createdProject.id,
            sampleId: `sample_${i + 1}`,
            assigneeId: values.annotatorIds?.[i % values.annotatorIds.length],
            status: 'pending' as const,
            annotations: [],
          }));
          
          addTasks(tasks);
          
          // 更新项目统计
          setTimeout(() => {
            store.updateProject(createdProject.id, {});
          }, 100);
        }
      }

      message.success('项目创建成功！');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      message.error('创建失败，请检查表单');
    }
  };

  const steps = [
    {
      title: '项目信息',
      icon: <CheckCircleOutlined />,
      content: renderStep1(),
    },
    {
      title: '数据选择',
      icon: <DatabaseOutlined />,
      content: renderStep2(),
    },
    {
      title: '标注配置',
      icon: <SettingOutlined />,
      content: renderStep3(),
    },
  ];

  return (
    <Modal
      title="创建标注项目"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        currentStep > 0 && (
          <Button key="prev" onClick={handlePrev}>
            上一步
          </Button>
        ),
        <Button key="next" type="primary" onClick={handleNext}>
          {currentStep === steps.length - 1 ? '完成' : '下一步'}
        </Button>,
      ]}
    >
      <Steps
        current={currentStep}
        style={{ marginBottom: 32 }}
        items={steps.map((step) => ({
          title: step.title,
          icon: step.icon,
        }))}
      />

      <div style={{ minHeight: 400 }}>{steps[currentStep].content}</div>
    </Modal>
  );
};

export default CreateProjectWizard;

