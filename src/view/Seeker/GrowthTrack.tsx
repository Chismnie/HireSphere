import React, { useState } from 'react';
import { Card, Button, Typography, Select, Progress, Tag, Avatar } from 'antd';
import {
  RightOutlined,
  LeftOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Mock Data for Report Records
const mockReports = [
  {
    id: '1',
    score: 97,
    date: '2026.1.16',
    type: '方向定制',
    duration: '45分钟',
    title: '高并发流媒体类模拟模式',
    desc: '针对字节、小红书等业务驱动型公司的专项模拟。',
  },
  {
    id: '2',
    score: 79,
    date: '2026.1.16',
    type: '标准模式',
    duration: '45分钟',
    title: '通用模拟模式',
    desc: '针对大多数公司的普适的专项模拟',
  },
  {
    id: '3',
    score: 65,
    date: '2025.12.23',
    type: '标准模式',
    duration: '45分钟',
    title: '通用模拟模式',
    desc: '针对大多数公司的普适的专项模拟',
  },
  {
    id: '4',
    score: 85,
    date: '2026.1.16',
    type: '个人定制',
    duration: '45分钟',
    title: '(核心技术栈名称) 模式',
    desc: '针对 (职位) 方向模拟',
  },
];

// Mock Chat History for Report Detail
const mockChatHistory = [
  {
    id: '1',
    role: 'ai',
    content: '你好，欢迎参加今天的模拟面试。我是你的 AI 面试官 Alex。我看过你的简历，你之前在分布式缓存方面有比较深入的研究。我们先聊聊，你为什么在简历中提到的那个项目里选择了 Redis 而不是 Memcached？',
  },
  {
    id: '2',
    role: 'user',
    content: '因为项目需求中需要支持持久化，而且 Redis 支持更丰富的数据结构，比如 List 和 Set，这些在我们的业务场景中非常有用。',
  },
  {
    id: '3',
    role: 'ai',
    content: '很好的切入点。那关于 Redis 的持久化，你能详细说说 RDB 和 AOF 的区别以及各自的优缺点吗？',
  },
];

const GrowthTrack: React.FC = () => {
  const [viewState, setViewState] = useState<'dashboard' | 'report'>('dashboard');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleViewReport = (id: string) => {
    setSelectedReportId(id);
    setViewState('report');
  };

  const handleBackToDashboard = () => {
    setViewState('dashboard');
    setSelectedReportId(null);
  };

  // 1. Dashboard View
  const renderDashboard = () => (
    <div className="flex h-full flex-col overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
      {/* Filters */}
      <div className="mb-8 flex gap-4">
        <Select
          defaultValue="time"
          style={{ width: 200 }}
          size="large"
          options={[{ value: 'time', label: '模拟时间' }]}
          className="shadow-sm border border-blue-600 rounded-lg [&_.ant-select-selector]:!border-none [&_.ant-select-selection-item]:text-gray-800"
          suffixIcon={<span className="text-gray-400">∨</span>}
        />
        <Select
          defaultValue="type"
          style={{ width: 200 }}
          size="large"
          options={[{ value: 'type', label: '模拟类型' }]}
          className="shadow-sm border border-gray-300 rounded-lg hover:border-blue-400 [&_.ant-select-selector]:!border-none [&_.ant-select-selection-item]:text-gray-800"
          suffixIcon={<span className="text-gray-400">∨</span>}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockReports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col justify-between rounded-xl border border-gray-300 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="text-5xl font-bold text-blue-600">
                  {report.score}<span className="text-2xl font-normal text-gray-400">分</span>
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${
                      report.type === '方向定制' ? 'bg-red-100 text-red-600' : 
                      report.type === '个人定制' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {report.type}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {report.duration}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{report.date}</span>
                </div>
              </div>
              <Title level={4} className="!mb-2">
                {report.title}
              </Title>
              <Text className="text-gray-500">{report.desc}</Text>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="primary"
                className="bg-blue-600 shadow-sm px-6"
                onClick={() => handleViewReport(report.id)}
              >
                查看报告 <RightOutlined />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 2. Report Detail View
  const renderReportDetail = () => (
    <div className="flex h-full flex-col bg-gray-50/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            icon={<LeftOutlined />} 
            type="text" 
            onClick={handleBackToDashboard}
            className="text-gray-600 hover:bg-gray-100"
          />
          <div>
            <Title level={4} className="!mb-0 text-gray-800">AI模拟面试报告</Title>
            <Text className="text-xs text-gray-500">
              基于目标岗位：<span className="font-bold text-blue-600">Java后端开发</span> 的模拟面试
            </Text>
          </div>
        </div>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />}
          className="bg-blue-600 shadow-sm"
        >
          下载pdf
        </Button>
      </div>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Report Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          
          {/* 1. Overall Score Card */}
          <div className="rounded-xl border border-gray-300 bg-white p-8 shadow-sm text-center">
            <div className="mb-6 flex justify-center">
              <Progress 
                type="circle" 
                percent={87} 
                size={160} 
                strokeColor="#2563eb"
                format={(percent) => (
                  <div className="flex flex-col">
                    <span className="text-5xl font-bold text-blue-600">{percent}<span className="text-xl text-gray-400">分</span></span>
                    <span className="mt-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs text-white">综合评分</span>
                  </div>
                )}
              />
            </div>
            
            <Title level={4} className="!mb-2">表现非常优秀！</Title>
            <Text className="text-gray-500 block mb-8 max-w-lg mx-auto">
              你在技术领域的专业性超出了平均水平，但在社交互动和压力沟通中略显被动。
            </Text>

            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-xs text-gray-400 mb-1">超越候选人</div>
                <div className="text-xl font-bold text-gray-800">Top 15%</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-xs text-gray-400 mb-1">面试耗时</div>
                <div className="text-xl font-bold text-gray-800">24:15</div>
              </div>
            </div>
          </div>

          {/* 2. Dimensions Analysis */}
          <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
            <div className="space-y-6">
              {[
                { label: '技术深度', score: 88 },
                { label: '逻辑条理', score: 75 },
                { label: '压力承受', score: 65 },
                { label: '沟通表达', score: 70 },
                { label: '问题解决', score: 92 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-blue-600">{item.score}%</span>
                  </div>
                  <Progress 
                    percent={item.score} 
                    showInfo={false} 
                    strokeColor="#6366f1" 
                    trailColor="#e0e7ff"
                    strokeLinecap="round"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI Suggestions - Highlights */}
          <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ThunderboltOutlined className="text-orange-500 text-lg" />
              <Title level={5} className="!mb-0">AI 实战复盘建议</Title>
            </div>
            
            <div className="mb-4">
              <Tag color="purple" className="border-none px-3 py-1">高光时刻</Tag>
            </div>
            
            <div className="space-y-3">
              {[
                '深入理解 Redis 内部原理，能够准确阐述 AOF 重写机制。',
                '在分布式场景下的并发控制思路非常清晰。',
                '面对追问时，能快速冷静下来并寻找替代方案。'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-500 mt-1" />
                  <Text className="text-gray-600">{text}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Improvements */}
          <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <Tag color="red" className="border-none px-3 py-1 bg-red-50 text-red-600">改进方向</Tag>
            </div>
            
            <div className="space-y-3">
              {[
                '在高并发场景的边界处理上描述较为模糊。',
                '语速在遇到生疏领域时明显加快，显得不够从容。',
                '眼神交流（针对摄像头）频率较低，建议加强职场表现力。'
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ExclamationCircleOutlined className="text-red-500 mt-1" />
                  <Text className="text-gray-600">{text}</Text>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Q&A Analysis */}
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm">
              <div className="mb-3">
                <Text className="font-bold text-blue-600 block mb-2">Q: REDIS 持久化 AOF 优化</Text>
                <div className="text-gray-500 text-sm mb-2">
                  <span className="font-medium text-gray-600">原回答：</span> 
                  那个...我认为 AOF 主要通过 rewrite 来缩小体积...
                </div>
                <Tag color="green" className="border-none bg-green-50 text-green-600">推荐表达方式已生成</Tag>
              </div>
            </div>
          ))}

        </div>

        {/* Right: Chat History (Static) */}
        <div className="w-[400px] border-l border-gray-300 bg-gray-50 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {mockChatHistory.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar 
                  size={32} 
                  icon={<UserOutlined />} 
                  className={msg.role === 'ai' ? 'bg-blue-600 flex-shrink-0' : 'bg-gray-800 flex-shrink-0'}
                  src={msg.role === 'ai' ? '/logo-ai.png' : undefined}
                />
                <div className={`rounded-xl p-3 text-sm shadow-sm ${
                  msg.role === 'ai' 
                    ? 'bg-white border border-gray-300 text-gray-800 rounded-tl-none' 
                    : 'bg-green-100 border border-green-200 text-gray-800 rounded-tr-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full">
      {viewState === 'dashboard' ? renderDashboard() : renderReportDetail()}
    </div>
  );
};

export default GrowthTrack;
