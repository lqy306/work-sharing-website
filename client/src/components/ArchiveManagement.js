import React, { useState, useEffect, useContext } from 'react';
import { 
  Card, 
  Typography, 
  Tree, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Message,
  Space,
  Spin
} from '@arco-design/web-react';
import { 
  IconPlus, 
  IconFolder, 
  IconFolderAdd
} from '@arco-design/web-react/icon';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const { Title } = Typography;
const FormItem = Form.Item;

const ArchiveContainer = styled(Card)`
  margin-bottom: 20px;
`;

const TreeContainer = styled.div`
  padding: 16px;
  background-color: var(--color-bg-2);
  border-radius: 4px;
  margin-bottom: 20px;
`;

const ActionBar = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ArchiveManagement = () => {
  const { user } = useContext(AuthContext);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedNode, setSelectedNode] = useState(null);
  const [modalTitle, setModalTitle] = useState('创建归档');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchArchiveTree();
  }, []);

  const fetchArchiveTree = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/archives/tree');
      setTreeData(res.data);
    } catch (err) {
      Message.error('获取归档树失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArchive = () => {
    setModalTitle('创建归档');
    setIsEdit(false);
    form.resetFields();
    setModalVisible(true);
  };

  const handleCreateSubArchive = (node) => {
    setModalTitle('创建子归档');
    setIsEdit(false);
    setSelectedNode(node);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditArchive = (node) => {
    setModalTitle('编辑归档');
    setIsEdit(true);
    setSelectedNode(node);
    form.setFieldsValue({
      name: node.title,
      description: node.description || ''
    });
    setModalVisible(true);
  };

  const handleDeleteArchive = async (node) => {
    try {
      await axios.delete(`/api/archives/${node.key}`);
      Message.success('归档已删除');
      fetchArchiveTree();
    } catch (err) {
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (isEdit) {
        // 更新归档
        await axios.put(`/api/archives/${selectedNode.key}`, values);
        Message.success('归档已更新');
      } else {
        // 创建归档
        const data = {
          ...values,
          parentId: selectedNode ? selectedNode.key : null
        };
        await axios.post('/api/archives', data);
        Message.success('归档已创建');
      }
      setModalVisible(false);
      fetchArchiveTree();
    } catch (err) {
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const renderTreeNodeTitle = (node) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{node.title}</span>
        <Space>
          <Button 
            type="text" 
            icon={<IconFolderAdd />} 
            onClick={(e) => {
              e.stopPropagation();
              handleCreateSubArchive(node);
            }}
          />
          <Button 
            type="text" 
            icon={<IconPlus />} 
            onClick={(e) => {
              e.stopPropagation();
              handleEditArchive(node);
            }}
          />
        </Space>
      </div>
    );
  };

  const processTreeData = (data) => {
    return data.map(node => ({
      ...node,
      title: renderTreeNodeTitle(node),
      icon: <IconFolder />,
      children: node.children ? processTreeData(node.children) : []
    }));
  };

  return (
    <ArchiveContainer>
      <Title heading={4} style={{ marginBottom: 24 }}>归档管理</Title>
      
      <ActionBar>
        <Button type="primary" icon={<IconFolderAdd />} onClick={handleCreateArchive}>
          创建归档
        </Button>
      </ActionBar>
      
      <TreeContainer>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : (
          <Tree
            treeData={processTreeData(treeData)}
            showLine
            blockNode
          />
        )}
      </TreeContainer>
      
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <FormItem
            label="归档名称"
            field="name"
            rules={[{ required: true, message: '请输入归档名称' }]}
          >
            <Input placeholder="请输入归档名称" />
          </FormItem>
          
          <FormItem
            label="归档描述"
            field="description"
          >
            <Input.TextArea placeholder="请输入归档描述（选填）" />
          </FormItem>
          
          <FormItem>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </FormItem>
        </Form>
      </Modal>
    </ArchiveContainer>
  );
};

export default ArchiveManagement;
