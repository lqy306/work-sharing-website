import React, { useState, useEffect, useContext } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Message, 
  Popconfirm, 
  Tag,
  Card,
  Typography,
  Modal,
  Input
} from '@arco-design/web-react';
import { 
  IconDelete, 
  IconEdit, 
  IconEye, 
  IconLink,
  IconLock,
  IconUnlock
} from '@arco-design/web-react/icon';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';

const { Title } = Typography;

const WorksContainer = styled(Card)`
  margin-bottom: 20px;
`;

const ActionButton = styled(Button)`
  padding: 0 8px;
`;

const WorksList = () => {
  const { user } = useContext(AuthContext);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentWork, setCurrentWork] = useState(null);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/works');
      setWorks(res.data);
    } catch (err) {
      Message.error('获取作品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/works/${id}`);
      Message.success('作品已删除');
      fetchWorks();
    } catch (err) {
      Message.error('删除失败');
    }
  };

  const handleView = async (work) => {
    if (work.isPasswordProtected && user.role !== 'admin' && work.owner !== user._id) {
      setCurrentWork(work);
      setPasswordModalVisible(true);
    } else {
      // 直接查看作品
      window.open(`/api/uploads/${work.filePath.split('/').pop()}`, '_blank');
    }
  };

  const handleCopyShareLink = (shareLink) => {
    const url = `${window.location.origin}/share/${shareLink}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        Message.success('分享链接已复制到剪贴板');
      })
      .catch(() => {
        Message.error('复制失败，请手动复制');
      });
  };

  const verifyPassword = async () => {
    if (!password) {
      Message.error('请输入密码');
      return;
    }

    setVerifying(true);
    try {
      const res = await axios.post(`/api/works/${currentWork._id}/verify-password`, { password });
      if (res.data.success) {
        setPasswordModalVisible(false);
        setPassword('');
        // 查看作品
        window.open(`/api/uploads/${currentWork.filePath.split('/').pop()}`, '_blank');
      }
    } catch (err) {
      Message.error(err.response?.data?.message || '密码验证失败');
    } finally {
      setVerifying(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
    },
    {
      title: '归档',
      dataIndex: 'archive',
      key: 'archive',
      render: (archive) => archive ? archive.name : '-',
    },
    {
      title: '保护状态',
      dataIndex: 'isPasswordProtected',
      key: 'isPasswordProtected',
      render: (isProtected) => isProtected ? 
        <Tag color="orange" icon={<IconLock />}>密码保护</Tag> : 
        <Tag color="green" icon={<IconUnlock />}>公开</Tag>,
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
          <ActionButton 
            type="text" 
            icon={<IconEye />} 
            onClick={() => handleView(record)}
          />
          <ActionButton 
            type="text" 
            icon={<IconLink />} 
            onClick={() => handleCopyShareLink(record.shareLink)}
          />
          <ActionButton 
            type="text" 
            icon={<IconEdit />} 
            onClick={() => Message.info('编辑功能开发中')}
          />
          <Popconfirm
            title="确定要删除这个作品吗？"
            onOk={() => handleDelete(record._id)}
          >
            <ActionButton 
              type="text" 
              status="danger" 
              icon={<IconDelete />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <WorksContainer>
        <Title heading={4} style={{ marginBottom: 24 }}>我的作品</Title>
        <Table 
          loading={loading}
          columns={columns} 
          data={works} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </WorksContainer>

      <Modal
        title="输入密码"
        visible={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          setPassword('');
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setPasswordModalVisible(false);
              setPassword('');
            }}
          >
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={verifying} 
            onClick={verifyPassword}
          >
            确认
          </Button>,
        ]}
      >
        <Input.Password
          placeholder="请输入访问密码"
          value={password}
          onChange={setPassword}
          onPressEnter={verifyPassword}
        />
      </Modal>
    </>
  );
};

export default WorksList;
