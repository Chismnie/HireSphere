import React, { useState } from 'react';
import { Button, Avatar, Dropdown, MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { FileText, MessageSquare, Briefcase, User } from 'lucide-react';
import useUserStore from '@/store/modules/user';
import ResumeUpload from '@/components/ResumeUpload';

const SeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { clearUserInfo } = useUserStore();
  const [activeTab, setActiveTab] = useState<string>('resume');

  const handleLogout = () => {
    clearUserInfo();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'resume', label: '简历优化诊断', icon: FileText },
    { id: 'interview', label: 'AI 模拟面试', icon: MessageSquare },
    { id: 'jobs', label: '智能职位推荐', icon: Briefcase },
    { id: 'profile', label: '个人中心', icon: User },
  ];

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeUpload />;
      case 'interview':
        return (
          <div className="p-8 text-gray-500">AI 模拟面试功能开发中...</div>
        );
      case 'jobs':
        return (
          <div className="p-8 text-gray-500">智能职位推荐功能开发中...</div>
        );
      case 'profile':
        return <div className="p-8 text-gray-500">个人中心功能开发中...</div>;
      default:
        return <ResumeUpload />;
    }
  };

  return (
    <div
      className="flex h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-bg.png')" }}
    >
      <div className="absolute inset-0 z-0 bg-white/90 backdrop-blur-sm" />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-64 flex-col border-r border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
          <img src="/logo-ai.png" alt="Logo" className="h-8 w-8 rounded" />
          <span className="text-xl font-bold tracking-tight text-gray-800">
            Hiresphere
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="bg-indigo-100 text-indigo-600"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                求职者
              </p>
              <p className="truncate text-xs text-gray-500">普通用户</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200/50 bg-white/60 px-8 backdrop-blur-md">
          <h1 className="text-xl font-semibold text-gray-800">
            {menuItems.find((i) => i.id === activeTab)?.label}
          </h1>

          <div className="flex items-center gap-4">
            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
              <Button className="flex items-center gap-2 border-gray-200 hover:border-blue-300 hover:text-blue-600">
                <span>退出登录</span>
                <Avatar size="small" icon={<UserOutlined />} />
              </Button>
            </Dropdown>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeekerDashboard;
