import React, { useState } from 'react';
import { Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileSearch,
  MessageSquare,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import useUserStore from '@/store/modules/user';
import ResumeUpload from '@/components/ResumeUpload';
import AccountSettingsPage from '../HR/Account/AccountSettingsPage';

const SeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { clearUserInfo } = useUserStore();
  const [activeTab, setActiveTab] = useState<string>('resume');

  const handleLogout = () => {
    clearUserInfo();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { id: 'resume', label: '上传 / 更新简历', icon: FileText },
    { id: 'diagnosis', label: '简历深度诊断', icon: FileSearch },
    { id: 'interview', label: '模拟面试训练', icon: MessageSquare },
    { id: 'growth', label: '训练与成长轨迹', icon: TrendingUp },
    { id: 'account', label: '账号设置', icon: UserCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeUpload />;
      case 'diagnosis':
        return (
          <div className="flex h-full items-center justify-center text-gray-500">
            简历深度诊断功能开发中...
          </div>
        );
      case 'interview':
        return (
          <div className="flex h-full items-center justify-center text-gray-500">
            模拟面试训练功能开发中...
          </div>
        );
      case 'growth':
        return (
          <div className="flex h-full items-center justify-center text-gray-500">
            训练与成长轨迹功能开发中...
          </div>
        );
      case 'account':
        return <AccountSettingsPage />;
      default:
        return <ResumeUpload />;
    }
  };

  return (
    <div
      className="flex h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-bg.png')" }}
    >
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 z-0 bg-white/90 backdrop-blur-sm" />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-64 flex-col border-r border-gray-300 bg-white/80 shadow-sm backdrop-blur-md">
        {/* Logo Area */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-300 px-6">
          <img src="/logo-ai.png" alt="Logo" className="h-8 w-8 rounded" />
          <span className="text-xl font-bold tracking-tight text-gray-800">
            Hiresphere
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? 'border-gray-300 bg-blue-50 text-blue-600 shadow-sm'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

        {/* User Info Footer */}
        <div className="border-t border-gray-300 bg-gray-50/50 p-4">
          <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-2 shadow-sm">
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
        {/* Top Header */}
        <header className="flex h-16 items-center justify-end border-b border-gray-300 bg-white/60 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              className="rounded-lg border border-gray-300 bg-gray-200 px-4 font-medium text-gray-700 hover:bg-gray-300"
              onClick={handleLogout}
            >
              退出登录
            </Button>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="bg-gray-400"
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-8">
          <div className="h-full w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeekerDashboard;
