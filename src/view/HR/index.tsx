import React, { useState, useEffect } from 'react';
import { Button, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  Users,
  Settings,
  UserCog,
  HelpCircle,
} from 'lucide-react';
import useUserStore from '@/store/modules/user';
import ResumeUpload from '@/components/ResumeUpload';
import JobDashboard from './Interview/JobDashboard';
import TalentDashboard from './Talent/TalentDashboard';
import JobProfilePage from './JobProfile/JobProfilePage';
import AccountSettingsPage from './Account/AccountSettingsPage';
import GuideTour, { GuideStep } from '@/components/GuideTour';

const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearUserInfo, profile } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<string>(
    (localStorage.getItem('hr_active_tab') as any) || 'resume'
  );
  const [showGuide, setShowGuide] = useState(false);
  const [hasJobProfile, setHasJobProfile] = useState(localStorage.getItem('has_job_profile') === 'true');

  useEffect(() => {
    // 监听画像更新事件
    const handleUpdate = () => {
      setHasJobProfile(localStorage.getItem('has_job_profile') === 'true');
    };
    
    // 监听 Tab 切换事件
    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        handleTabChange(e.detail.tab);
      }
    };

    window.addEventListener('job_profile_updated', handleUpdate);
    window.addEventListener('switch_hr_tab', handleSwitchTab);
    
    return () => {
      window.removeEventListener('job_profile_updated', handleUpdate);
      window.removeEventListener('switch_hr_tab', handleSwitchTab);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('hr_active_tab', tab);
  };

  const guideSteps: GuideStep[] = [
    {
      selector: '#guide-resume',
      title: '简历处理中心',
      description: '在这里您可以上传、查看并诊断候选人简历，AI 会自动为您提取关键信息并打分。',
    },
    {
      selector: '#guide-dashboard',
      title: '面试看板',
      description: '实时掌握所有面试进展，快速创建面试房间，并邀请候选人加入。',
    },
    {
      selector: '#guide-talent',
      title: '人才库与分析',
      description: '沉淀企业人才资产，通过多维度的 AI 能力雷达图深入分析每一位候选人。',
    },
    {
      selector: '#guide-job-profile',
      title: '岗位画像设置',
      description: '自定义岗位需求与能力模型，让 AI 更好地理解您想要的人才标准。',
    },
    {
      selector: '#guide-account',
      title: '账号设置',
      description: '管理您的个人信息、企业资料及安全设置。',
    },
  ];

  useEffect(() => {
    // 只有当从其他页面通过 navigate(path, { state: { activeTab: '...' } }) 显式跳转时才切换
    const state = location.state as { activeTab?: string } | null;
    if (state?.activeTab) {
      handleTabChange(state.activeTab);
      // 切换完后清理 state，防止 F5 刷新时浏览器从历史记录恢复该状态
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogout = () => {
    clearUserInfo();
    navigate('/', { replace: true });
  };

  const menuItems = [
    { id: 'resume', label: '简历处理中心', icon: FileText },
    { id: 'dashboard', label: '面试看板', icon: LayoutDashboard },
    { id: 'talent', label: '人才库与分析', icon: Users },
    { id: 'job-profile', label: '岗位画像设置', icon: Settings },
    { id: 'account', label: '账号设置', icon: UserCog },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'resume':
        return <ResumeUpload />;
      case 'dashboard':
        return <JobDashboard />;
      case 'talent':
        return <TalentDashboard />;
      case 'job-profile':
        return <JobProfilePage />;
      case 'account':
        return <AccountSettingsPage />;
      default:
        return <ResumeUpload />;
    }
  };

  // 定义招聘流程步骤
  const steps = [
    { id: 'job-profile', title: '岗位画像设置' },
    { id: 'resume', title: '简历上传' },
    { id: 'dashboard', title: '面试看板筛选' },
    { id: 'interview', title: '人才面试' },
    { id: 'talent', title: '人才库分析' },
  ];

  // 获取当前步骤的索引
  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

  return (
    <div
      className="flex h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-bg.png')" }}
    >
      {/* 新手引导组件 */}
      <GuideTour 
        steps={guideSteps} 
        open={showGuide} 
        onClose={() => setShowGuide(false)} 
      />

      {/* 半透明遮罩，让背景不至于太花，保证内容可读性 */}
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
                id={`guide-${item.id}`}
                onClick={() => handleTabChange(item.id)}
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

        {/* HR Info Footer */}
        <div className="border-t border-gray-300 bg-gray-50/50 p-4">
          <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white p-2 shadow-sm">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="bg-blue-100 text-blue-600"
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
        {/* Top Header with 5-Step Stepper and User Actions combined into one row */}
        <header className="flex h-16 items-center justify-between border-b border-gray-300 bg-white/60 px-8 backdrop-blur-md">
          {/* Left: 5-Step Stepper Guide */}
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  onClick={() => handleTabChange(step.id as any)}
                  className={`flex cursor-pointer items-center gap-2 transition-all duration-300 ${
                    index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className={`h-6 w-6 flex items-center justify-center rounded-full border text-[10px] font-bold transition-all duration-300 ${
                    index < currentStepIndex ? 'bg-green-500 border-green-500 text-white' : 
                    index === currentStepIndex ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-110' : 
                    'bg-white border-gray-300'
                  }`}>
                    {index < currentStepIndex ? '✓' : index + 1}
                  </span>
                  <span className={`text-xs font-bold whitespace-nowrap ${index === currentStepIndex ? 'text-sm' : ''}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-4 transition-all duration-500 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
            
            {/* Context Prompt */}
            <div className="ml-4 text-xs">
              {activeTab === 'job-profile' && !hasJobProfile && (
                <span className="text-blue-500 flex items-center gap-1 animate-pulse font-medium">
                  👉 请先完成岗位画像，以便精准筛选简历
                </span>
              )}
            </div>
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<HelpCircle className="h-5 w-5 text-gray-500" />}
              onClick={() => setShowGuide(true)}
              className="flex items-center justify-center hover:bg-gray-100"
            >
              引导
            </Button>
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

        {/* Content Area - Removed inner white container for Dashboard to allow transparent background flow */}
        <div className="flex-1 overflow-hidden p-8">
          {activeTab === 'dashboard' || activeTab === 'talent' || activeTab === 'job-profile' ? (
            <div className="h-full w-full">{renderContent()}</div>
          ) : (
            <div className="h-full w-full overflow-hidden rounded-xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-sm">
              {renderContent()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
