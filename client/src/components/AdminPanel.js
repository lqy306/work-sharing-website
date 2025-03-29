import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Message, 
  Popconfirm, 
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag
} from '@arco-design/web-react';
import { 
  IconPlus, 
  IconDelete, 
  IconEdit
} from '@arco-design/web-react/icon';
import axios from 'axios';
import styled from 'styled-components';

const { Title } = Typography;
const FormItem = Form.Item;
const Option = Select.Option;

const AdminContainer = styled(Card)`
  margin-bottom: 20px;
`;

const ActionBar = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [inviteCodes, setInviteCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [userForm] = Form.useForm();
  const [inviteForm] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchInviteCodes();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      Message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteCodes = async () => {
    try {
      const res = await axios.get('/api/users/invite-codes');
      setInviteCodes(res.data);
    } catch (err) {
      Message.error('获取邀请码列表失败');
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      username: user.username,
      nickname: user.nickname || '',
      role: user.role
    });
    setUserModalVisible(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      Message.success('用户已删除');
      fetchUsers();
    } catch (err) {
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const handleSubmitUser = async (values) => {
    try {
      if (editingUser) {
        // 更新用户
        await axios.put(`/api/users/${editingUser._id}`, values);
        Message.success('用户已更新');
      } else {
        // 创建用户
        await axios.post('/api/users', values);
        Message.success('用户已创建');
      }
      setUserModalVisible(false);
      fetchUsers();
    } catch (err) {
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleCreateInviteCode = async () => {
    try {
      const values = await inviteForm.validate();
      await axios.post('/api/users/invite-codes', values);
      Message.success('邀请码已创建');
      setInviteModalVisible(false);
      fetchInviteCodes();
      inviteForm.resetFields();
    } catch (err) {
      Message.error(err.response?.data?.message || '创建邀请码失败');
    }
  };

  const handleDeleteInviteCode = async (id) => {
    try {
      await axios.delete(`/api/users/invite-codes/${id}`);
      Message.success('邀请码已删除');
      fetchInviteCodes();
    } catch (err) {
      Message.error('删除邀请码失败');
    }
  };

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        role === 'admin' ? 
          <Tag color="red">管理员</Tag> : 
          <Tag color="blue">普通用户</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<IconEdit />} 
            onClick={() => handleEditUser(record)}
          />
          <Popconfirm
            title="确定要删除这个用户吗？"
            onOk={() => handleDeleteUser(record._id)}
          >
            <Button 
              type="text" 
              status="danger" 
              icon={<IconDelete />} 
              disabled={record.role === 'admin'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const inviteCodeColumns = [
    {
      title: '邀请码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '创建者',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (user) => user ? user.nickname || user.username : '-',
    },
    {
      title: '状态',
      dataIndex: 'isUsed',
      key: 'isUsed',
      render: (isUsed) => (
        isUsed ? 
          <Tag color="green">已使用</Tag> : 
          <Tag color="blue">未使用</Tag>
      ),
    },
    {
      title: '使用者',
      dataIndex: 'usedBy',
      key: 'usedBy',
      render: (user) => user ? user.nickname || user.username : '-',
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => date ? new Date(date).toLocaleString() : '永不过期',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确定要删除这个邀请码吗？"
            onOk={() => handleDeleteInviteCode(record._id)}
          >
            <Button 
              type="text" 
              status="danger" 
              icon={<IconDelete />} 
              disabled={record.isUsed}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <AdminContainer>
        <Title heading={4} style={{ marginBottom: 24 }}>用户管理</Title>
        
        <ActionBar>
          <Button type="primary" icon={<IconPlus />} onClick={handleCreateUser}>
            创建用户
          </Button>
        </ActionBar>
        
        <Table 
          loading={loading}
          columns={userColumns} 
          data={users} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </AdminContainer>
      
      <AdminContainer>
        <Title heading={4} style={{ marginBottom: 24 }}>邀请码管理</Title>
        
        <ActionBar>
          <Button type="primary" icon={<IconPlus />} onClick={() => setInviteModalVisible(true)}>
            创建邀请码
          </Button>
        </ActionBar>
        
        <Table 
          columns={inviteCodeColumns} 
          data={inviteCodes} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </AdminContainer>
      
      {/* 用户表单模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        visible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        <Form
          form={userForm}
          autoComplete="off"
          onSubmit={handleSubmitUser}
        >
          <FormItem
            label="用户名"
            field="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </FormItem>
          
          {!editingUser && (
            <FormItem
              label="密码"
              field="password"
              rules={[
                { required: !editingUser, message: '请输入密码' },
                { minLength: 6, message: '密码长度不能少于6位' }
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </FormItem>
          )}
          
          <FormItem
            label="昵称"
            field="nickname"
          >
            <Input placeholder="请输入昵称（选填）" />
          </FormItem>
          
          <FormItem
            label="角色"
            field="role"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="user"
          >
            <Select placeholder="请选择角色">
              <Option value="user">普通用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </FormItem>
          
          <FormItem>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                取消
              </Button>
            </Space>
          </FormItem>
        </Form>
      </Modal>
      
      {/* 邀请码表单模态框 */}
      <Modal
        title="创建邀请码"
        visible={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
      >
        <Form
          form={inviteForm}
          autoComplete="off"
        >
          <FormItem
            label="过期时间"
            field="expiresAt"
            help="不设置则永不过期"
          >
            <Input type="datetime-local" />
          </FormItem>
          
          <FormItem>
            <Space>
              <Button type="primary" onClick={handleCreateInviteCode}>
                创建
              </Button>
              <Button onClick={() => setInviteModalVisible(false)}>
                取消
              </Button>
            </Space>
          </FormItem>
        </Form>
      </Modal>
    </>
  );
};

export default AdminPanel;
