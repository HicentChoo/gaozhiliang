import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  message,
  Steps,
  Space,
  Card,
  Typography,
  Divider,
} from 'antd';
import { ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DataSourceFormProps {
  visible: boolean;
  editingSource?: any;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const DataSourceForm: React.FC<DataSourceFormProps> = ({
  visible,
  editingSource,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const dataType = Form.useWatch('type', form);

  useEffect(() => {
    if (visible && editingSource) {
      form.setFieldsValue({
        name: editingSource.name,
        type: editingSource.type,
        driver: editingSource.config?.driver,
        host: editingSource.config?.host,
        port: editingSource.config?.port,
        database: editingSource.config?.database,
        username: editingSource.config?.username,
        password: editingSource.config?.password,
        connectionString: editingSource.config?.connectionString,
        endpoint: editingSource.config?.endpoint,
        apiKey: editingSource.config?.apiKey,
        path: editingSource.config?.path,
        format: editingSource.config?.format,
      });
      setCurrentStep(0);
      setTestResult(null);
    } else if (visible) {
      form.resetFields();
      setCurrentStep(0);
      setTestResult(null);
    }
  }, [visible, editingSource, form]);

  const steps = [
    {
      title: '基本信息',
      description: '填写数据源名称和类型',
    },
    {
      title: '连接配置',
      description: '配置连接参数',
    },
    {
      title: '测试连接',
      description: '验证连接是否正常',
    },
    {
      title: '完成',
      description: '确认并保存',
    },
  ];

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // 验证基本信息
        await form.validateFields(['name', 'type']);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        // 验证连接配置
        const fieldsToValidate = getFieldsToValidate();
        await form.validateFields(fieldsToValidate);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        // 测试连接（可选，可以直接下一步）
        setCurrentStep(3);
      }
    } catch (error) {
      message.error('请完成当前步骤的必填项');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    try {
      const fieldsToValidate = getFieldsToValidate();
      await form.validateFields(fieldsToValidate);
      setTesting(true);
      setTestResult(null);

      // 模拟测试连接
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTestResult({
        success: true,
        message: '连接测试成功！',
      });
      message.success('连接测试成功！');
    } catch (error) {
      setTestResult({
        success: false,
        message: '请先填写完整的连接信息',
      });
      message.error('请先填写完整的连接信息');
    } finally {
      setTesting(false);
    }
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const config: Record<string, any> = {};

      // 根据类型组装配置
      if (values.type === 'database') {
        config.driver = values.driver;
        config.host = values.host;
        config.port = values.port;
        config.database = values.database;
        config.username = values.username;
        config.password = values.password;
      } else if (values.type === 'api') {
        config.endpoint = values.endpoint;
        config.apiKey = values.apiKey;
      } else if (values.type === 'file') {
        config.path = values.path;
        config.format = values.format;
      } else if (values.connectionString) {
        config.connectionString = values.connectionString;
      }

      onOk({
        name: values.name,
        type: values.type,
        config,
      });
      form.resetFields();
      setCurrentStep(0);
      setTestResult(null);
    } catch (error) {
      message.error('请完成所有必填项');
    }
  };

  const getFieldsToValidate = () => {
    if (dataType === 'database') {
      return ['driver', 'host', 'port', 'database', 'username', 'password'];
    } else if (dataType === 'api') {
      return ['endpoint', 'apiKey'];
    } else if (dataType === 'file') {
      return ['path', 'format'];
    }
    return ['connectionString'];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <Title level={4}>基本信息</Title>
            <Text type="secondary">请填写数据源的基本信息</Text>
            <Divider />
            <Form.Item
              name="name"
              label="数据源名称"
              rules={[{ required: true, message: '请输入数据源名称' }]}
              style={{ marginTop: 24 }}
            >
              <Input placeholder="请输入数据源名称" size="large" />
            </Form.Item>
            <Form.Item
              name="type"
              label="数据源类型"
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <Select placeholder="请选择数据源类型" size="large">
                <Select.Option value="database">数据库</Select.Option>
                <Select.Option value="api">API接口</Select.Option>
                <Select.Option value="file">文件存储</Select.Option>
                <Select.Option value="other">其他</Select.Option>
              </Select>
            </Form.Item>
          </Card>
        );

      case 1:
        return (
          <Card>
            <Title level={4}>连接配置</Title>
            <Text type="secondary">根据数据源类型配置相应的连接参数</Text>
            <Divider />
            {renderConnectionFields()}
          </Card>
        );

      case 2:
        return (
          <Card>
            <Title level={4}>测试连接</Title>
            <Text type="secondary">验证连接配置是否正确</Text>
            <Divider />
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              {testResult ? (
                <div>
                  {testResult.success ? (
                    <div>
                      <CheckCircleOutlined
                        style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }}
                      />
                      <div style={{ fontSize: 16, color: '#52c41a', marginTop: 16 }}>
                        {testResult.message}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 16, color: '#ff4d4f', marginTop: 16 }}>
                        {testResult.message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Text type="secondary">点击下方按钮测试连接配置</Text>
                </div>
              )}
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleTestConnection}
                loading={testing}
                size="large"
                style={{ marginTop: 24 }}
              >
                测试连接
              </Button>
              <div style={{ marginTop: 24 }}>
                <Text type="secondary">提示：此步骤为可选，您也可以直接进入下一步</Text>
              </div>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card>
            <Title level={4}>确认信息</Title>
            <Text type="secondary">请确认以下信息无误后点击完成</Text>
            <Divider />
            {renderConfirmInfo()}
          </Card>
        );

      default:
        return null;
    }
  };

  const renderConnectionFields = () => {
    if (dataType === 'database') {
      return (
        <>
          <Form.Item
            name="driver"
            label="数据库驱动"
            rules={[{ required: true, message: '请选择数据库驱动' }]}
            style={{ marginTop: 24 }}
          >
            <Select placeholder="请选择数据库驱动" size="large">
              <Select.Option value="mysql">MySQL</Select.Option>
              <Select.Option value="postgresql">PostgreSQL</Select.Option>
              <Select.Option value="oracle">Oracle</Select.Option>
              <Select.Option value="sqlserver">SQL Server</Select.Option>
              <Select.Option value="mongodb">MongoDB</Select.Option>
              <Select.Option value="clickhouse">ClickHouse</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="host"
            label="主机地址"
            rules={[{ required: true, message: '请输入主机地址' }]}
          >
            <Input placeholder="例如：localhost 或 192.168.1.100" size="large" />
          </Form.Item>
          <Form.Item
            name="port"
            label="端口"
            rules={[{ required: true, message: '请输入端口' }]}
          >
            <Input type="number" placeholder="例如：3306" size="large" />
          </Form.Item>
          <Form.Item
            name="database"
            label="数据库名"
            rules={[{ required: true, message: '请输入数据库名' }]}
          >
            <Input placeholder="请输入数据库名" size="large" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" size="large" />
          </Form.Item>
        </>
      );
    }

    if (dataType === 'api') {
      return (
        <>
          <Form.Item
            name="endpoint"
            label="API地址"
            rules={[{ required: true, message: '请输入API地址' }]}
            style={{ marginTop: 24 }}
          >
            <Input placeholder="例如：https://api.example.com/data" size="large" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" size="large" />
          </Form.Item>
        </>
      );
    }

    if (dataType === 'file') {
      return (
        <>
          <Form.Item
            name="path"
            label="文件路径"
            rules={[{ required: true, message: '请输入文件路径' }]}
            style={{ marginTop: 24 }}
          >
            <Input placeholder="例如：/data/files 或 C:\Data\Files" size="large" />
          </Form.Item>
          <Form.Item
            name="format"
            label="文件格式"
            rules={[{ required: true, message: '请选择文件格式' }]}
          >
            <Select placeholder="请选择文件格式" size="large">
              <Select.Option value="csv">CSV</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="excel">Excel</Select.Option>
              <Select.Option value="parquet">Parquet</Select.Option>
            </Select>
          </Form.Item>
        </>
      );
    }

    return (
      <Form.Item
        name="connectionString"
        label="连接字符串"
        rules={[{ required: true, message: '请输入连接字符串' }]}
        style={{ marginTop: 24 }}
      >
        <Input.TextArea
          rows={4}
          placeholder="例如：mysql://user:password@host:port/database"
          size="large"
        />
      </Form.Item>
    );
  };

  const renderConfirmInfo = () => {
    const values = form.getFieldsValue();
    return (
      <div style={{ padding: '20px 0' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>数据源名称：</Text>
            <Text>{values.name || '-'}</Text>
          </div>
          <div>
            <Text strong>数据源类型：</Text>
            <Text>
              {values.type === 'database'
                ? '数据库'
                : values.type === 'api'
                ? 'API接口'
                : values.type === 'file'
                ? '文件存储'
                : '其他'}
            </Text>
          </div>
          {values.type === 'database' && (
            <>
              <div>
                <Text strong>数据库驱动：</Text>
                <Text>{values.driver || '-'}</Text>
              </div>
              <div>
                <Text strong>连接地址：</Text>
                <Text>
                  {values.host && values.port
                    ? `${values.host}:${values.port}`
                    : '-'}
                </Text>
              </div>
              <div>
                <Text strong>数据库名：</Text>
                <Text>{values.database || '-'}</Text>
              </div>
              <div>
                <Text strong>用户名：</Text>
                <Text>{values.username || '-'}</Text>
              </div>
            </>
          )}
          {values.type === 'api' && (
            <>
              <div>
                <Text strong>API地址：</Text>
                <Text>{values.endpoint || '-'}</Text>
              </div>
            </>
          )}
          {values.type === 'file' && (
            <>
              <div>
                <Text strong>文件路径：</Text>
                <Text>{values.path || '-'}</Text>
              </div>
              <div>
                <Text strong>文件格式：</Text>
                <Text>{values.format || '-'}</Text>
              </div>
            </>
          )}
        </Space>
      </div>
    );
  };

  const handleClose = () => {
    form.resetFields();
    setCurrentStep(0);
    setTestResult(null);
    onCancel();
  };

  return (
    <Drawer
      title={editingSource ? '编辑数据源' : '新增数据源'}
      open={visible}
      onClose={handleClose}
      width={720}
      extra={
        <Button onClick={handleClose}>取消</Button>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={currentStep === 0}
            onClick={handlePrev}
          >
            上一步
          </Button>
          <Space>
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={handleFinish}>
                完成
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
      <Form form={form} layout="vertical">
        {renderStepContent()}
      </Form>
    </Drawer>
  );
};

export default DataSourceForm;

