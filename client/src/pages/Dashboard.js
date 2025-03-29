import React, { useContext } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Dropdown } from '@arco-design/web-react';
import { 
  IconUser, 
  IconFile, 
  IconFolder, 
  IconSettings,
  IconExport
} from '@arco-design/web-react/icon';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import WorksList from '../components/WorksList';
import ArchiveManagement from '../components/ArchiveManagement';
import UserProfile from '../components/UserProfile';
import AdminPanel from '../components/AdminPanel';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

const StyledLayout = styled(Layout)`
  height: 100vh;
`;

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  cursor: pointer;
`;

const ContentWrapper = styled.div`
  padding: 24px;
  background: #fff;
  min-height: 280px;
  margin: 24px;
  border-radius: 2px;
`;

const FooterText = styled.div`
  text-align: center;
`;

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dropList = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/dashboard/profile">个人设置</Link>
      </Menu.Item>
      {user && user.role === 'admin' && (
        <Menu.Item key="admin">
          <Link to="/dashboard/admin">管理员设置</Link>
        </Menu.Item>
      )}
      <Menu.Item key="logout" onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <StyledLayout>
      <Header style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between' }}>
        <Title heading={4} style={{ color: '#fff', margin: 0, lineHeight: '64px' }}>
          作品分享平台
        </Title>
        <Dropdown droplist={dropList} position="br">
          <UserInfo>
            <Avatar style={{ marginRight: 8 }}>
              {user && user.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Text style={{ color: '#fff' }}>
              {user ? user.nickname || user.username : '加载中...'}
            </Text>
          </UserInfo>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="1" icon={<IconFile />}>
              <Link to="/dashboard/works">我的作品</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<IconFolder />}>
              <Link to="/dashboard/archives">归档管理</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<IconUser />}>
              <Link to="/dashboard/profile">个人设置</Link>
            </Menu.Item>
            {user && user.role === 'admin' && (
              <Menu.Item key="4" icon={<IconSettings />}>
                <Link to="/dashboard/admin">管理员设置</Link>
              </Menu.Item>
            )}
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content>
            <ContentWrapper>
              <Routes>
                <Route path="/" element={<div>欢迎使用作品分享平台</div>} />
                <Route path="/works" element={<WorksList />} />
                <Route path="/archives" element={<ArchiveManagement />} />
                <Route path="/profile" element={<UserProfile />} />
                {user && user.role === 'admin' && (
                  <Route path="/admin" element={<AdminPanel />} />
                )}
              </Routes>
            </ContentWrapper>
          </Content>
          <Footer>
            <FooterText>
              作品分享平台 ©2025 Created by 李齐岳&Manus
            </FooterText>
          </Footer>
        </Layout>
      </Layout>
    </StyledLayout>
  );
};

export default Dashboard;
