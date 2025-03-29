import React, { useState, useContext } from 'react';
import { Form, Input, Button, Message, Typography } from '@arco-design/web-react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Login = () => {
  const [form] = Form.useForm();
  const { login, error } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    const success = await login(values);
    setLoading(false);
    
    if (success) {
      Message.success('登录成功');
    }
  };

  return (
    <LoginContainer>
      <Title heading={3} style={{ textAlign: 'center', marginBottom: 30 }}>
        登录
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
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        
        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit" loading={loading} long>
            登录
          </Button>
        </Form.Item>
      </Form>
    </LoginContainer>
  );
};

export default Login;
