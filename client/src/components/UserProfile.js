import React, { useState, useEffect, useContext } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Message, 
  Space,
  Divider,
  Popconfirm
} from '@arco-design/web-react';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const { Title } = Typography;
const FormItem = Form.Item;

const ProfileContainer = styled(Card)`
  max-width: 600px;
  margin: 0 auto;
`;

const UserProfile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        nickname: user.nickname || ''
      });
    }
  }, [user, profileForm]);

  const handleUpdateProfile = async (values) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await axios.put(`/api/users/${user.id}`, values);
      Message.success('个人信息已更新');
    } catch (err) {
      Message.error(err.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values) => {
    if (!user) return;
    
    setPasswordLoading(true);
    try {
      await axios.put(`/api/users/${user.id}/password`, values);
      Message.success('密码已更新');
      passwordForm.resetFields();
    } catch (err) {
      Message.error(err.response?.data?.message || '更新密码失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/users/${user.id}`);
      Message.success('账号已注销');
      logout();
    } catch (err) {
      Message.error(err.response?.data?.message || '注销账号失败');
      setDeleteLoading(false);
    }
  };

  return (
    <ProfileContainer>
      <Title heading={4} style={{ marginBottom: 24 }}>个人设置</Title>
      
      <Form
        form={profileForm}
        autoComplete="off"
        onSubmit={handleUpdateProfile}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <FormItem
          label="用户名"
        >
          <Input value={user?.username} disabled />
        </FormItem>
        
        <FormItem
          label="昵称"
          field="nickname"
        >
          <Input placeholder="请输入昵称" />
        </FormItem>
        
        <FormItem
          label="角色"
        >
          <Input value={user?.role === 'admin' ? '管理员' : '普通用户'} disabled />
        </FormItem>
        
        <FormItem wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            更新信息
          </Button>
        </FormItem>
      </Form>
      
      <Divider />
      
      <Title heading={5} style={{ marginBottom: 16 }}>修改密码</Title>
      
      <Form
        form={passwordForm}
        autoComplete="off"
        onSubmit={handleUpdatePassword}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <FormItem
          label="当前密码"
          field="currentPassword"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password placeholder="请输入当前密码" />
        </FormItem>
        
        <FormItem
          label="新密码"
          field="newPassword"
          rules={[
            { required: true, message: '请输入新密码' },
            { minLength: 6, message: '密码长度不能少于6位' }
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </FormItem>
        
        <FormItem
          label="确认新密码"
          field="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            {
              validator: (value, callback) => {
                if (value !== passwordForm.getFieldValue('newPassword')) {
                  callback('两次输入的密码不一致');
                }
              }
            }
          ]}
        >
          <Input.Password placeholder="请确认新密码" />
        </FormItem>
        
        <FormItem wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit" loading={passwordLoading}>
            更新密码
          </Button>
        </FormItem>
      </Form>
      
      <Divider />
      
      <Title heading={5} style={{ marginBottom: 16 }}>注销账号</Title>
      <p>注销账号后，您的所有数据将被删除，且无法恢复。</p>
      
      <Popconfirm
        title="确定要注销账号吗？"
        content="此操作不可逆，您的所有数据将被永久删除。"
        onOk={handleDeleteAccount}
      >
        <Button status="danger" loading={deleteLoading}>
          注销账号
        </Button>
      </Popconfirm>
    </ProfileContainer>
  );
};

export default UserProfile;
