import React, { useState, useContext } from 'react';
import { Form, Input, Button, Message, Typography } from '@arco-design/web-react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Register = () => {
  const [form] = Form.useForm();
  const { register, error } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    const success = await register(values);
    setLoading(false);
    
    if (success) {
      Message.success('注册成功');
    }
  };

  return (
    <RegisterContainer>
      <Title heading={3} style={{ textAlign: 'center', marginBottom: 30 }}>
        注册
      </Title>
      
      {error && <Text type="error" style={{ display: 'block', marginBottom: 16 }}>{error}</Text>}
      
      <Form
        form={form}
        autoComplete="off"
        onSubmit={handleSubmit}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item
          label="用户名"
          field="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        
        <Form.Item
          label="密码"
          field="password"
          rules={[
            { required: true, message: '请输入密码' },
            { minLength: 6, message: '密码长度不能少于6位' }
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        
        <Form.Item
          label="确认密码"
          field="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            {
              validator: (value, callback) => {
                if (value !== form.getFieldValue('password')) {
                  callback('两次输入的密码不一致');
                }
              }
            }
          ]}
        >
          <Input.Password placeholder="请确认密码" />
        </Form.Item>
        
        <Form.Item
          label="昵称"
          field="nickname"
        >
          <Input placeholder="请输入昵称（选填）" />
        </Form.Item>
        
        <Form.Item
          label="邀请码"
          field="inviteCode"
          rules={[{ required: true, message: '请输入邀请码' }]}
        >
          <Input placeholder="请输入邀请码" />
        </Form.Item>
        
        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit" loading={loading} long>
            注册
          </Button>
        </Form.Item>
      </Form>
    </RegisterContainer>
  );
};

export default Register;
