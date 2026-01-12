import React, { useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, theme } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  DatabaseOutlined,
  CloudUploadOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  FolderOutlined,
  TableOutlined,
  ToolOutlined,
  TagsOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import Logo from '../Logo';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 一级菜单（顶部）
  const topMenuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'data-collection',
      icon: <CloudUploadOutlined />,
      label: '数据采集',
    },
    {
      key: 'datasets',
      icon: <DatabaseOutlined />,
      label: '数据集管理',
    },
    {
      key: 'data-preprocessing',
      icon: <ToolOutlined />,
      label: '数据预处理',
    },
    {
      key: 'data-annotation',
      icon: <TagsOutlined />,
      label: '数据标注',
    },
    {
      key: 'dataset-evaluation',
      icon: <BarChartOutlined />,
      label: '数据集评估',
    },
    {
      key: 'toolbox',
      icon: <AppstoreOutlined />,
      label: '工具箱',
    },
  ];

  // 根据当前路径获取当前一级菜单
  const currentTopMenu = useMemo(() => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/data-collection')) return 'data-collection';
    if (location.pathname.startsWith('/datasets')) return 'datasets';
    if (location.pathname.startsWith('/data-preprocessing')) return 'data-preprocessing';
    if (location.pathname.startsWith('/data-annotation')) return 'data-annotation';
    if (location.pathname.startsWith('/dataset-evaluation')) return 'dataset-evaluation';
    if (location.pathname.startsWith('/toolbox')) return 'toolbox';
    return '/';
  }, [location.pathname]);

  // 二级菜单（侧边栏）
  const sideMenuItems: MenuProps['items'] = useMemo(() => {
    if (currentTopMenu === 'data-collection') {
      return [
        {
          key: '/data-collection/sources',
          icon: <FolderOutlined />,
          label: '数据源管理',
        },
        {
          key: '/data-collection/tasks',
          icon: <TableOutlined />,
          label: '采集任务',
        },
      ];
    }
    if (currentTopMenu === 'data-preprocessing') {
      return [
        {
          key: '/data-preprocessing/cleaning',
          icon: <ToolOutlined />,
          label: '数据清洗',
        },
        {
          key: '/data-preprocessing/enhancement',
          icon: <ToolOutlined />,
          label: '数据增强',
        },
        {
          key: '/data-preprocessing/operators',
          icon: <ToolOutlined />,
          label: '预处理算子',
        },
      ];
    }
    if (currentTopMenu === 'data-annotation') {
      return [
        {
          key: '/data-annotation/overview',
          icon: <TagsOutlined />,
          label: '标注总览',
        },
        {
          key: '/data-annotation/projects',
          icon: <TagsOutlined />,
          label: '标注项目',
        },
        {
          key: '/data-annotation/my-tasks',
          icon: <TagsOutlined />,
          label: '我的任务',
        },
        {
          key: '/data-annotation/templates',
          icon: <TagsOutlined />,
          label: '标签模板',
        },
        {
          key: '/data-annotation/task-types',
          icon: <TagsOutlined />,
          label: '标注任务类型',
        },
      ];
    }
    if (currentTopMenu === 'datasets') {
      return [
        {
          key: '/datasets',
          icon: <DatabaseOutlined />,
          label: '数据集管理',
        },
      ];
    }
    if (currentTopMenu === 'dataset-evaluation') {
      return [
        {
          key: '/dataset-evaluation/templates',
          icon: <BarChartOutlined />,
          label: '评估模板',
        },
        {
          key: '/dataset-evaluation/metrics',
          icon: <BarChartOutlined />,
          label: '评估指标',
        },
      ];
    }
    if (currentTopMenu === 'toolbox') {
      return [
        {
          key: '/toolbox/models',
          icon: <RobotOutlined />,
          label: '模型管理',
        },
        {
          key: '/toolbox/scene-config',
          icon: <SettingOutlined />,
          label: '场景应用配置',
        },
      ];
    }
    return [];
  }, [currentTopMenu]);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleTopMenuClick = ({ key }: { key: string }) => {
    if (key === '/') {
      navigate('/');
    } else if (key === 'data-collection') {
      navigate('/data-collection/sources');
    } else if (key === 'datasets') {
      navigate('/datasets');
    } else if (key === 'data-preprocessing') {
      navigate('/data-preprocessing/cleaning');
    } else if (key === 'data-annotation') {
      navigate('/data-annotation/overview');
    } else if (key === 'dataset-evaluation') {
      navigate('/dataset-evaluation/templates');
    } else if (key === 'toolbox') {
      navigate('/toolbox/models');
    }
  };

  const handleSideMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  // 检查是否是编辑页面（需要全屏显示）
  const isEditorPage = location.pathname === '/data-collection/tasks/create' || 
    (location.pathname.startsWith('/data-collection/tasks/') && location.pathname !== '/data-collection/tasks');

  // 如果是编辑页面，返回全屏布局
  if (isEditorPage) {
    return <Outlet />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingRight: 24,
              borderRight: '1px solid #f0f0f0',
            }}
          >
            <Logo collapsed={false} />
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: '#333',
                whiteSpace: 'nowrap',
              }}
            >
              高质量数据集管理服务平台
            </span>
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[currentTopMenu]}
            items={topMenuItems}
            onClick={handleTopMenuClick}
            style={{ borderBottom: 'none', flex: 1 }}
          />
        </div>
        <Space>
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
              <span>{user?.username || '用户'}</span>
            </Space>
          </Dropdown>
        </Space>
      </Header>
      <Layout>
        {sideMenuItems.length > 0 && (
          <Sider
            width={200}
            style={{
              background: colorBgContainer,
              borderRight: '1px solid #f0f0f0',
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={sideMenuItems}
              onClick={handleSideMenuClick}
              style={{ borderRight: 0, height: '100%' }}
            />
          </Sider>
        )}
        <Layout>
          <Content
            style={{
              margin: '24px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div className="page-container">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

