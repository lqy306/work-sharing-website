import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Input, 
  Button, 
  Message, 
  Modal,
  Form,
  DatePicker,
  Space
} from '@arco-design/web-react';
import { IconLink, IconCopy } from '@arco-design/web-react/icon';
import axios from 'axios';
import styled from 'styled-components';

const { Title, Text } = Typography;
const FormItem = Form.Item;

const ShareContainer = styled(Card)`
  margin-bottom: 20px;
`;

const ShareLinkItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ShareLinkText = styled(Text)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16px;
`;

const WorkSharing = ({ workId, shareLink, onUpdate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (shareLink) {
      setShareUrl(`${window.location.origin}/share/${shareLink}`);
    }
  }, [shareLink]);

  const handleCreateShareLink = async (values) => {
    setLoading(true);
    try {
      const { expiryDate } = values;
      
      const data = {
        shareExpiry: expiryDate ? expiryDate.toISOString() : null
      };
      
      const res = await axios.post(`/api/works/${workId}/share`, data);
      
      if (res.data.shareLink) {
        const newShareUrl = `${window.location.origin}/share/${res.data.shareLink}`;
        setShareUrl(newShareUrl);
        if (onUpdate) onUpdate(res.data.shareLink);
        Message.success('分享链接已创建');
      }
      
      setModalVisible(false);
    } catch (err) {
      Message.error('创建分享链接失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        Message.success('分享链接已复制到剪贴板');
      })
      .catch(() => {
        Message.error('复制失败，请手动复制');
      });
  };

  return (
    <ShareContainer>
      <Title heading={5} style={{ marginBottom: 16 }}>分享链接</Title>
      
      {shareUrl ? (
        <ShareLinkItem>
          <ShareLinkText>{shareUrl}</ShareLinkText>
          <Space>
            <Button 
              type="primary" 
              icon={<IconCopy />} 
              onClick={handleCopyLink}
            >
              复制
            </Button>
            <Button 
              type="outline" 
              onClick={() => setModalVisible(true)}
            >
              更新
            </Button>
          </Space>
        </ShareLinkItem>
      ) : (
        <Button 
          type="primary" 
          icon={<IconLink />} 
          onClick={() => setModalVisible(true)}
        >
          创建分享链接
        </Button>
      )}
      
      <Modal
        title="创建分享链接"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          autoComplete="off"
          onSubmit={handleCreateShareLink}
        >
          <FormItem
            label="过期时间"
            field="expiryDate"
            help="不设置则永不过期"
          >
            <DatePicker showTime />
          </FormItem>
          
          <FormItem>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                确定
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </FormItem>
        </Form>
      </Modal>
    </ShareContainer>
  );
};

export default WorkSharing;
