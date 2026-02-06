import React, { useState } from 'react';
import { Button, Card, Tabs } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import useUserStore from '@/store/modules/user';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { preselect?: 'seeker' | 'hr' } };
  const [activeTab, setActiveTab] = useState<string>(location.state?.preselect ?? 'seeker');
  const { setUserInfo } = useUserStore();

  const handleLogin = () => {
    // 模拟登录，生成一个随机 token
    const mockToken = 'mock-token-' + Math.random().toString(36).substr(2);
    
    if (activeTab === 'seeker') {
      setUserInfo({ token: mockToken, role: 'seeker' });
      navigate('/home', { replace: true });
    } else {
      setUserInfo({ token: mockToken, role: 'hr' });
      navigate('/hr', { replace: true });
    }
  };

  const items = [
    {
      key: 'seeker',
      label: (
        <span>
          <UserOutlined />
          求职者
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 py-4">
          <p className="text-gray-600">找到你的理想工作</p>
          <form className="flex flex-col gap-4 border-2 border-gray-300 rounded-lg p-4">
            <input type="text" placeholder="用户名" />
          </form>
          <form className="flex flex-col gap-4 border-2 border-gray-300 rounded-lg p-4">
            <input type="password" placeholder="密码" />

          </form>
          <Button type="primary" block onClick={handleLogin} size="large">
            作为求职者登录
          </Button>
        </div>
      ),
    },
    {
      key: 'hr',
      label: (
        <span>
          <TeamOutlined />
          HR
        </span>
      ),
      children: (
        <div className="flex flex-col gap-4 py-4">
          <p className="text-gray-600">找到你的理想人才</p>
          <form className="flex flex-col gap-4 border-2 border-gray-300 rounded-lg p-4">
            <input type="text" placeholder="用户名" />
          </form>
          <form className="flex flex-col gap-4 border-2 border-gray-300 rounded-lg p-4">
            <input type="password" placeholder="密码" />

          </form>
          <Button type="primary" block onClick={handleLogin} size="large">
            作为 HR 登录
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <Card className="w-96 shadow-lg" title="Welcome to HireSphere">
        <Tabs
          defaultActiveKey="seeker"
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={items}
        />
      </Card>
    </div>
  );
};
export default Login;
