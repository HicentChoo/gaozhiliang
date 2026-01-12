import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Typography,
  Divider,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useAuthStore } from '../../store/authStore';
import './index.css';

const { Title } = Typography;

const Profile: React.FC = () => {
  const { user, updateUser, updatePassword } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        nickname: user.username, // 如果没有昵称字段，使用用户名
      });
      setAvatarUrl(user.avatar);
    }
  }, [user, profileForm]);

  const handleAvatarChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'done' || info.file.status === 'uploading') {
      // 这里应该上传到服务器获取URL
      // 模拟上传成功
      const url = URL.createObjectURL(info.file.originFileObj as File);
      setAvatarUrl(url);
      updateUser({ avatar: url });
      message.success('头像上传成功');
    }
  };

  const handleProfileSave = () => {
    profileForm.validateFields().then((values) => {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
      updateUser({
        username: values.username,
        nickname: values.nickname,
        email: values.email,
        avatar: avatarUrl,
      });
        setLoading(false);
        message.success('个人信息更新成功');
      }, 500);
    });
  };

  const handlePasswordSave = () => {
    passwordForm.validateFields().then((values) => {
      setLoading(true);
      updatePassword(values.oldPassword, values.newPassword)
        .then(() => {
          passwordForm.resetFields();
          setLoading(false);
          message.success('密码修改成功');
        })
        .catch(() => {
          setLoading(false);
          message.error('密码修改失败，请检查原密码是否正确');
        });
    });
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },
    onChange: handleAvatarChange,
    customRequest: ({ file, onSuccess }) => {
      // 模拟上传
      setTimeout(() => {
        onSuccess?.(file);
      }, 1000);
    },
  };

  return (
    <div className="profile-container">
      <Card>
        <Title level={3}>个人中心</Title>
        <Divider />

        {/* 头像设置 */}
        <div className="profile-avatar-section">
          <div className="avatar-upload-wrapper">
            <Avatar
              size={120}
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              className="profile-avatar"
            />
            <Upload {...uploadProps}>
              <div className="avatar-upload-mask">
                <CameraOutlined style={{ fontSize: 24, color: '#fff' }} />
                <div style={{ color: '#fff', marginTop: 8 }}>更换头像</div>
              </div>
            </Upload>
          </div>
          <div className="avatar-tips">
            <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
          </div>
        </div>

        <Divider />

        {/* 个人信息 */}
        <Card title="个人信息" style={{ marginBottom: 24 }}>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileSave}
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item
              label="昵称"
              name="nickname"
            >
              <Input placeholder="请输入昵称" />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 修改密码 */}
        <Card title="修改密码">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSave}
          >
            <Form.Item
              label="原密码"
              name="oldPassword"
              rules={[{ required: true, message: '请输入原密码' }]}
            >
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少6位' },
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Card>
    </div>
  );
};

export default Profile;

