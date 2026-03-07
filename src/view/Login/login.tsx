import React, { useState } from 'react';
import { Button, Card, Tabs, Input, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, TeamOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import useUserStore from '@/store/modules/user';

import { login } from '@/apis/Common/Auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { preselect?: 'seeker' | 'hr' } };
  const [activeTab, setActiveTab] = useState<string>(location.state?.preselect ?? 'seeker');
  const [isRegister, setIsRegister] = useState(false);
  const { setUserInfo } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      if (isRegister) {
      
        message.info('注册功能暂未开放，请直接登录');
        return;
      }

      const res: any = await login({
        email,
        password,
        type: activeTab as 'seeker' | 'hr',
      });

      if (res.code === 200 || res.code === 0) {
        message.success('登录成功');
        const { token, username, email: userEmail } = res.data;
        
        // 存储更多用户信息
        // 注意：useUserStore 的类型定义可能需要更新以支持存储 email
        setUserInfo({ token, role: activeTab as 'seeker' | 'hr' });
        
        console.log('Logged in as:', username, userEmail);

        if (activeTab === 'seeker') {
          navigate('/home', { replace: true });
        } else {
          navigate('/hr', { replace: true });
        }
      } else {
        message.error(res.message || '登录失败');
      }
    } catch (error) {
      console.error(error);
      message.error('登录请求失败');
    }
  };

  const renderForm = (role: 'seeker' | 'hr') => (
    <div className="flex flex-col gap-5 py-4">
      <div className="flex flex-col gap-4">
        <Input 
          size="large" 
          placeholder="邮箱" 
          prefix={<MailOutlined className="text-gray-400" />} 
          className="rounded-lg"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input.Password 
          size="large" 
          placeholder="密码" 
          prefix={<LockOutlined className="text-gray-400" />} 
          className="rounded-lg"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {isRegister && (
          <Input.Password 
            size="large" 
            placeholder="确认密码" 
            prefix={<LockOutlined className="text-gray-400" />} 
            className="rounded-lg"
          />
        )}
      </div>

      <Button 
        type="primary" 
        block 
        onClick={handleSubmit} 
        size="large"
        className="h-10 rounded-lg bg-blue-600 shadow-sm hover:bg-blue-700"
      >
        {isRegister 
          ? (role === 'seeker' ? '注册求职者账号' : '注册 HR 账号') 
          : (role === 'seeker' ? '登录求职者账号' : '登录 HR 账号')
        }
      </Button>

      <div className="flex justify-center text-sm">
        <span className="text-gray-500">
          {isRegister ? '已有账号？' : '还没有账号？'}
        </span>
        <button 
          className="ml-1 font-medium text-blue-600 hover:text-blue-700 hover:underline"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? '去登录' : '立即注册'}
        </button>
      </div>
    </div>
  );

  const items = [
    {
      key: 'seeker',
      label: (
        <span className="flex items-center gap-2 px-2">
          <UserOutlined />
          求职者
        </span>
      ),
      children: renderForm('seeker'),
    },
    {
      key: 'hr',
      label: (
        <span className="flex items-center gap-2 px-2">
          <TeamOutlined />
          HR
        </span>
      ),
      children: renderForm('hr'),
    },
  ];

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-bg.png')" }}
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />

      <div className="relative z-10 flex h-full flex-col">
        {/* Header with Logo (Left Top) */}
        <header className="flex items-center gap-3 px-6 py-5">
          <img
            src="/logo-ai.png"
            alt="HireSphere Logo"
            className="h-10 w-10 rounded-md shadow-sm"
          />
          <span className="text-2xl font-semibold tracking-wide text-gray-900">
            HireSphere
          </span>
        </header>

        {/* Main Content (Centered) */}
        <main className="flex flex-1 items-center justify-center px-6">
          <Card className="w-96 shadow-xl border-gray-200 bg-white/90 backdrop-blur-sm">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                {isRegister ? '创建账号' : '欢迎回来'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {isRegister ? '开启您的智能招聘之旅' : '请选择您的角色登录'}
              </p>
            </div>
            <Tabs
              defaultActiveKey="seeker"
              activeKey={activeTab}
              onChange={setActiveTab}
              centered
              items={items}
              className="[&_.ant-tabs-nav]:mb-0"
            />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Login;
