import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface DataSourceModalProps {
  visible: boolean;
  editingSource?: any;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const DataSourceModal: React.FC<DataSourceModalProps> = ({
  visible,
  editingSource,
  onCancel,
  onOk,
}) => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const dataType = Form.useWatch('type', form);

  React.useEffect(() => {
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
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingSource, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
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
    });
  };

  const handleTestConnection = async () => {
    try {
      await form.validateFields(['driver', 'host', 'port', 'database', 'username', 'password']);
      setTesting(true);
      
      // 模拟测试连接
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      message.success('连接测试成功！');
    } catch (error) {
      message.error('请先填写完整的连接信息');
    } finally {
      setTesting(false);
    }
  };

  const renderFormFields = () => {
    if (dataType === 'database') {
      return (
        <>
          <Form.Item
            name="driver"
            label="数据库驱动"
            rules={[{ required: true, message: '请选择数据库驱动' }]}
          >
            <Select placeholder="请选择数据库驱动">
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
            <Input placeholder="例如：localhost 或 192.168.1.100" />
          </Form.Item>
          <Form.Item
            name="port"
            label="端口"
            rules={[{ required: true, message: '请输入端口' }]}
          >
            <Input type="number" placeholder="例如：3306" />
          </Form.Item>
          <Form.Item
            name="database"
            label="数据库名"
            rules={[{ required: true, message: '请输入数据库名' }]}
          >
            <Input placeholder="请输入数据库名" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleTestConnection}
              loading={testing}
            >
              测试连接
            </Button>
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
          >
            <Input placeholder="例如：https://api.example.com/data" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
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
          >
            <Input placeholder="例如：/data/files 或 C:\Data\Files" />
          </Form.Item>
          <Form.Item
            name="format"
            label="文件格式"
            rules={[{ required: true, message: '请选择文件格式' }]}
          >
            <Select placeholder="请选择文件格式">
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
      >
        <Input.TextArea
          rows={3}
          placeholder="例如：mysql://user:password@host:port/database"
        />
      </Form.Item>
    );
  };

  return (
    <Modal
      title={editingSource ? '编辑数据源' : '新增数据源'}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="确定"
      cancelText="取消"
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="数据源名称"
          rules={[{ required: true, message: '请输入数据源名称' }]}
        >
          <Input placeholder="请输入数据源名称" />
        </Form.Item>
        <Form.Item
          name="type"
          label="数据源类型"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <Select placeholder="请选择数据源类型">
            <Select.Option value="database">数据库</Select.Option>
            <Select.Option value="api">API接口</Select.Option>
            <Select.Option value="file">文件存储</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
        </Form.Item>
        {renderFormFields()}
      </Form>
    </Modal>
  );
};

export default DataSourceModal;
