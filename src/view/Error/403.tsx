import React from 'react';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, HomeOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="max-w-lg rounded-2xl bg-white p-12 shadow-sm">
        <Result
          icon={<LockOutlined className="text-blue-500" style={{ fontSize: '72px' }} />}
          status="403"
          title={
            <span className="text-2xl font-bold text-gray-800">
              访问受限
            </span>
          }
          subTitle={
            <div className="flex flex-col gap-2">
              <Paragraph className="text-gray-500 text-base mb-0">
                抱歉，您当前没有权限访问该页面。
              </Paragraph>
              <Text type="secondary" className="text-sm">
                这可能是因为您的账号角色不符，或者该功能仅对特定用户开放。
              </Text>
            </div>
          }
          extra={
            <div className="mt-4 flex justify-center gap-4">
              <Button 
                type="primary" 
                size="large" 
                icon={<HomeOutlined />}
                className="bg-blue-600 hover:bg-blue-500 px-8 rounded-full shadow-md shadow-blue-100"
                onClick={() => navigate('/')}
              >
                返回首页
              </Button>
              <Button 
                size="large"
                className="px-8 rounded-full border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-600"
                onClick={() => navigate(-1)}
              >
                返回上一页
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Forbidden;
