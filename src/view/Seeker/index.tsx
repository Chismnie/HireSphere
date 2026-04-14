import React, { useState, useEffect } from 'react';
import { Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  FileSearch,
  MessageSquare,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import { Modal, Input, message } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import useUserStore from '@/store/modules/user';
import ResumeUpload from '@/components/ResumeUpload';
import AccountSettingsPage from '../HR/Account/AccountSettingsPage';
import ResumeDiagnosis from './ResumeDiagnosis';
import MockInterview from './MockInterview';
import GrowthTrack from './GrowthTrack';

const SeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearUserInfo, profile } = useUserStore();
  const [activeTab, setActiveTab] = useState<string>(
    (location.state as { activeTab?: string })?.activeTab || 'resume'
  );
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewLink, setInterviewLink] = useState('');

  const handleStartInterview = () => {
    if (!interviewLink.trim()) {
      message.warning('请输入面试链接');
      return;
    }

    try {
      const url = new URL(interviewLink);
      const roomId = url.searchParams.get('roomId');
      const token = url.searchParams.get('token');

      if (!roomId || !token) {
        message.error('无效的面试链接，请检查');
        return;
      }

      window.open(`/interview-room?roomId=${roomId}&token=${token}`, '_blank');
      setIsInterviewModalOpen(false);
      setInterviewLink('');
    } catch (e) {
      message.error('链接格式错误');
    }
  };

  useEffect(() => {
    const state = location.state as { activeTab?: string } | null;
    if (state?.activeTab) {
      setActiveTab(state.activeTab);
    }
  }, [location.state]);

  // 监听 Tab 切换事件 (用于组件内部触发)
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      const { tab } = e.detail;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('switch_seeker_tab', handleSwitchTab);
    return () => window.removeEventListener('switch_seeker_tab', handleSwitchTab);
  }, []);

  const handleLogout = () => {
    clearUserInfo();
    navigate('/', { replace: true });
  };

  const menuItems = [
    { id: 'resume', label: '上传 / 更新简历', icon: FileText },
    { id: 'diagnosis', label: '简历深度诊断', icon: FileSearch },
    { id: 'mock', label: '模拟面试训练', icon: MessageSquare },
    { id: 'growth', label: '训练与成长轨迹', icon: TrendingUp },
    { id: 'account', label: '账号设置', icon: UserCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeUpload isSeeker />;
      case 'diagnosis':
        return <ResumeDiagnosis />;
      case 'mock':
        return <MockInterview />;
      case 'growth':
        return <GrowthTrack />;
      case 'account':
        return <AccountSettingsPage />;
      default:
        return <ResumeUpload />;
    }
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
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
                onClick={() => handleTabClick(item.id)}
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
                {profile.username}
              </p>
              <p className="truncate text-xs text-gray-500">{profile.company}</p>
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
          {/* Apply same style logic as HR: account/resume might need different container than dashboard, but for simplicity let's use the unified container for now, unless specific needs arise. 
              HR side uses:
              activeTab === 'dashboard' || activeTab === 'talent' || activeTab === 'job-profile' ? (
                <div className="h-full w-full">{renderContent()}</div>
              ) : (
                <div className="h-full w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm">
                  {renderContent()}
                </div>
              )
              
              Here for Seeker:
              ResumeUpload might need full width/height or container.
              AccountSettingsPage needs container.
              New placeholders need container.
              So using the container for all seems safe for now.
          */}
          <div className="h-full w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm">
            {renderContent()}
          </div>
        </div>
      </main>

      <Modal
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <LinkOutlined /> 进入面试间
          </div>
        }
        open={isInterviewModalOpen}
        onOk={handleStartInterview}
        onCancel={() => setIsInterviewModalOpen(false)}
        okText="进入面试"
        cancelText="取消"
        centered
      >
        <div className="py-6">
          <p className="text-gray-600 mb-2">请输入 HR 提供的面试链接：</p>
          <Input 
            placeholder="例如：http://hiresphere.com/interview-room?roomId=..." 
            value={interviewLink} 
            onChange={e => setInterviewLink(e.target.value)} 
            onPressEnter={handleStartInterview}
            size="large"
          />
        </div>
      </Modal>
    </div>
  );
};

export default SeekerDashboard;
