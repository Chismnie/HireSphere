import React, { useState, useEffect } from 'react';
import { Button, Card, Tabs, Input, message, Radio } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, TeamOutlined, LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import useUserStore from '@/store/modules/user';

import { login, register, sendCode } from '@/apis/Common/Auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { preselect?: 'seeker' | 'hr' } };
  const [activeTab, setActiveTab] = useState<string>(location.state?.preselect ?? 'seeker');
  const [isRegister, setIsRegister] = useState(false);
  const { setUserInfo } = useUserStore();
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'seeker' | 'hr'>('seeker');

  // Countdown for sendCode
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      message.warning('请输入邮箱');
      return;
    }
    try {
      const res: any = await sendCode(email);
      const resCode = res.Code ?? res.code;
      const resMsg = res.Msg ?? res.message ?? res.msg;

      if (resCode === 200 || resCode === 0) {
        message.success('验证码已发送');
        setCountdown(60);
      } else {
        message.error(resMsg || '发送失败');
      }
    } catch (error) {
      message.error('发送请求失败');
    }
  };

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        if (!username || !email || !password || !code) {
          message.warning('请填写完整注册信息');
          return;
        }
        if (password !== confirmPassword) {
          message.error('两次密码不一致');
          return;
        }

        const res: any = await register({
          username,
          email,
          password,
          type: type,
          code,
        });

        const resCode = res.Code ?? res.code;
        const resMsg = res.Msg ?? res.message ?? res.msg;

        if (resCode === 200 || resCode === 0) {
          message.success('注册成功，请登录');
          setIsRegister(false);
          setActiveTab(type); // 自动切换到刚才注册的角色
        } else {
          // 处理邮箱已存在或其他注册错误：根据后端返回的 Msg 动态提示
          message.error(resMsg || '注册失败');
        }
        return;
      }

      // Login Logic
      const res: any = await login({
        email,
        password,
        type: activeTab as 'seeker' | 'hr',
      });

      const resCode = res.Code ?? res.code;
      const resMsg = res.Msg ?? res.message ?? res.msg;
      const resData = res.Data ?? res.data;

      if (resCode === 200 || resCode === 0) {
        message.success('登录成功');
        if (resData) {
          const { token } = resData;
          localStorage.setItem('token', token);
          setUserInfo({ token, role: activeTab as 'seeker' | 'hr' });
        }
        
        if (activeTab === 'seeker') {
          navigate('/home', { replace: true });
        } else {
          // 登录后强制定向到简历处理中心
          localStorage.setItem('hr_active_tab', 'resume');
          navigate('/hr', { replace: true });
        }
      } else {
        message.error(resMsg || '登录失败');
      }
    } catch (error) {
      console.error(error);
      message.error('请求失败');
    }
  };

  const renderRegisterForm = () => (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-3">
        <div className="mb-2">
          <label className="text-xs text-gray-500 mb-1 block">注册身份</label>
          <Radio.Group 
            value={type} 
            onChange={e => setType(e.target.value)}
            className="w-full flex"
            buttonStyle="solid"
          >
            <Radio.Button value="seeker" className="flex-1 text-center">求职者</Radio.Button>
            <Radio.Button value="hr" className="flex-1 text-center">HR</Radio.Button>
          </Radio.Group>
        </div>

        <Input 
          size="large" 
          placeholder="用户名" 
          prefix={<UserOutlined className="text-gray-400" />} 
          className="rounded-lg"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <Input 
          size="large" 
          placeholder="邮箱" 
          prefix={<MailOutlined className="text-gray-400" />} 
          className="rounded-lg"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="flex gap-2">
          <Input 
            size="large" 
            placeholder="验证码" 
            prefix={<SafetyOutlined className="text-gray-400" />} 
            className="rounded-lg flex-1"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Button 
            className="h-10 rounded-lg"
            disabled={countdown > 0}
            onClick={handleSendCode}
          >
            {countdown > 0 ? `${countdown}s` : '获取验证码'}
          </Button>
        </div>
        <Input.Password 
          size="large" 
          placeholder="密码" 
          prefix={<LockOutlined className="text-gray-400" />} 
          className="rounded-lg"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Input.Password 
          size="large" 
          placeholder="确认密码" 
          prefix={<LockOutlined className="text-gray-400" />} 
          className="rounded-lg"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </div>

      <Button 
        type="primary" 
        block 
        onClick={handleSubmit} 
        size="large"
        className="h-10 rounded-lg bg-blue-600 shadow-sm hover:bg-blue-700"
      >
        立即注册
      </Button>

      <div className="flex justify-center text-sm">
        <span className="text-gray-500">已有账号？</span>
        <button 
          className="ml-1 font-medium text-blue-600 hover:text-blue-700 hover:underline"
          onClick={() => setIsRegister(false)}
        >
          去登录
        </button>
      </div>
    </div>
  );

  const renderLoginForm = (role: 'seeker' | 'hr') => (
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
      </div>

      <Button 
        type="primary" 
        block 
        onClick={handleSubmit} 
        size="large"
        className="h-10 rounded-lg bg-blue-600 shadow-sm hover:bg-blue-700"
      >
        {role === 'seeker' ? '登录求职者账号' : '登录 HR 账号'}
      </Button>

      <div className="flex justify-center text-sm">
        <span className="text-gray-500">还没有账号？</span>
        <button 
          className="ml-1 font-medium text-blue-600 hover:text-blue-700 hover:underline"
          onClick={() => setIsRegister(true)}
        >
          立即注册
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
      children: renderLoginForm('seeker'),
    },
    {
      key: 'hr',
      label: (
        <span className="flex items-center gap-2 px-2">
          <TeamOutlined />
          HR
        </span>
      ),
      children: renderLoginForm('hr'),
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
            {isRegister ? (
              renderRegisterForm()
            ) : (
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                centered
                items={items}
                className="[&_.ant-tabs-nav]:mb-0"
              />
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Login;
