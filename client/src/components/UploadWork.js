import React, { useState, useContext } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Upload, 
  Message, 
  Switch, 
  Select,
  Card,
  Typography
} from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const { Title } = Typography;
const FormItem = Form.Item;
const Option = Select.Option;

const UploadContainer = styled(Card)`
  max-width: 800px;
  margin: 0 auto;
`;

const UploadWork = ({ archives = [] }) => {
  const [form] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);

  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      Message.error('请选择要上传的文件');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileList[0].originFile);
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('archiveId', values.archiveId || '');
      formData.append('isPasswordProtected', passwordProtected);
      
      if (passwordProtected) {
        formData.append('password', values.password);
      }

      const res = await axios.post('/api/works', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Message.success('作品上传成功');
      form.resetFields();
      setFileList([]);
      setPasswordProtected(false);
    } catch (err) {
      Message.error(err.response?.data?.message || '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordProtectedChange = (checked) => {
    setPasswordProtected(checked);
  };

  return (
    <UploadContainer>
      <Title heading={4} style={{ marginBottom: 24 }}>上传作品</Title>
      
      <Form
        form={form}
        autoComplete="off"
        onSubmit={handleSubmit}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <FormItem
          label="作品标题"
          field="title"
          rules={[{ required: true, message: '请输入作品标题' }]}
        >
          <Input placeholder="请输入作品标题" />
        </FormItem>
        
        <FormItem
          label="作品描述"
          field="description"
        >
          <Input.TextArea placeholder="请输入作品描述（选填）" />
        </FormItem>
        
        <FormItem
          label="选择归档"
          field="archiveId"
        >
          <Select placeholder="请选择归档（选填）" allowClear>
            {archives.map(archive => (
              <Option key={archive._id} value={archive._id}>
                {archive.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        
        <FormItem
          label="上传文件"
          field="file"
          rules={[{ required: true, message: '请上传文件' }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={setFileList}
            limit={1}
            customRequest={(option) => {
              // 这里不实际上传，只是保存文件对象
              option.onSuccess();
            }}
          >
            <div>
              <IconUpload />
              <p>点击或拖拽文件上传</p>
            </div>
          </Upload>
        </FormItem>
        
        <FormItem
          label="密码保护"
          field="isPasswordProtected"
        >
          <Switch
            checked={passwordProtected}
            onChange={handlePasswordProtectedChange}
          />
        </FormItem>
        
        {passwordProtected && (
          <FormItem
            label="访问密码"
            field="password"
            rules={[{ required: true, message: '请设置访问密码' }]}
          >
            <Input.Password placeholder="请设置访问密码" />
          </FormItem>
        )}
        
        <FormItem wrapperCol={{ offset: 4, span: 20 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            上传作品
          </Button>
        </FormItem>
      </Form>
    </UploadContainer>
  );
};

export default UploadWork;
