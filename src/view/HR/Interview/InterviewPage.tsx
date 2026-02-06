import React from 'react';
import { Layout } from 'antd';
import InterviewActionPanel from './InterviewActionPanel';
import InterviewContextPanel from './InterviewContextPanel';

const { Content, Sider } = Layout;

const InterviewPage: React.FC = () => {
  return (
    <div
      className="flex h-screen w-full flex-col bg-cover bg-center"
      style={{ backgroundImage: "url('/welcome-bg.png')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 bg-white/90 backdrop-blur-sm" />

      {/* Header */}
      <header className="relative z-10 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200/50 bg-white/60 px-6 backdrop-blur-md">
        <img src="/logo-ai.png" alt="Logo" className="h-8 w-8 rounded" />
        <span className="text-xl font-bold tracking-tight text-gray-800">
          Hiresphere
        </span>
      </header>

      {/* Content Container */}
      <div className="relative z-10 flex-1 overflow-hidden p-6">
        <Layout className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Left Action Panel - 60% */}
          <Content className="h-full flex-1 overflow-hidden border-r border-gray-200">
            <InterviewActionPanel />
          </Content>

          {/* Right Context Panel - 40% */}
          <Sider width="40%" className="h-full bg-white" theme="light">
            <InterviewContextPanel />
          </Sider>
        </Layout>
      </div>
    </div>
  );
};

export default InterviewPage;
