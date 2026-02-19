import React from 'react';
import { Button, Typography } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  RightOutlined,
  EditOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PdfPreview from '@/components/ResumeUpload/PdfPreview';

const { Title, Text, Paragraph } = Typography;

// Mock Data
const analysisData = {
  score: 85,
  targetPosition: '产品经理',
  coreCompetency: 'Spring Cloud, Redis 集群, 高并发 QPS 优化经验非常扎实。',
  riskPoint: '2022年存在6个月空窗期，建议在面试前准备好合理的离职理由说明。',
  quantSuggestion: "项目描述中'负责架构设计'较模糊，建议改为'主导核心模块重构，QPS提升150%'。",
  aiSuggestions: [
    {
      original: '负责核心交易系统的架构设计与性能优化。',
      suggestion: '主导订单交易中心架构重构，通过引入多级缓存，将核心接口 QPS 吞吐量从 2w 提升至 5w。',
    },
    {
      original: '参与团队内部技术分享与新人指导。',
      suggestion: '建立团队技术分享机制，主导 10+ 场核心技术分享，指导 3 名新人晋升为高级工程师。',
    },
    {
      original: '熟练使用 Java, Spring Boot, MySQL。',
      suggestion: '精通 Java 并发编程，深入理解 Spring Boot 自动装配原理，具备 MySQL 千万级数据调优经验。',
    },
  ],
};

// Mock Resume File (Use a placeholder or assume uploaded)
// In a real app, this would come from props or store
const mockResumeFile = null; 

const ResumeDiagnosis: React.FC = () => {
  const navigate = useNavigate();

  const handleEnterMockInterview = () => {
    // Navigate to the Interview tab via state
    navigate('/home', { state: { activeTab: 'interview' } });
  };

  return (
    <div className="flex h-full w-full gap-4 p-4 overflow-hidden">
      {/* Left Panel: Analysis Report */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-gray-300">
          <div>
            <Title level={2} className="!mb-1 text-gray-800">
              简历深度诊断
            </Title>
            <Text className="text-gray-500">
              基于目标岗位：<span className="font-bold text-blue-600">{analysisData.targetPosition}</span> 的匹配分析
            </Text>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{analysisData.score}</div>
            <div className="text-xs text-gray-400">匹配得分</div>
          </div>
        </div>

        {/* 3 Cards Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Core Competency */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-green-700 font-bold">
              <CheckCircleOutlined /> 核心竞争力
            </div>
            <Paragraph className="mb-0 text-sm text-gray-600">
              {analysisData.coreCompetency}
            </Paragraph>
          </div>

          {/* Risk Point */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-orange-700 font-bold">
              <WarningOutlined /> 简历风险点
            </div>
            <Paragraph className="mb-0 text-sm text-gray-600">
              {analysisData.riskPoint}
            </Paragraph>
          </div>

          {/* Quant Suggestion */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-blue-700 font-bold">
              <ThunderboltOutlined /> 量化建议
            </div>
            <Paragraph className="mb-0 text-sm text-gray-600">
              {analysisData.quantSuggestion}
            </Paragraph>
          </div>
        </div>

        {/* AI Optimization Suggestions */}
        <div className="flex-1 rounded-xl bg-white p-6 shadow-sm border border-gray-300">
          <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <span className="text-lg font-bold">AI</span>
            </div>
            <Title level={4} className="!mb-0 text-gray-800">
              简历优化建议 (AI 修改建议)
            </Title>
          </div>

          <div className="flex flex-col gap-4">
            {analysisData.aiSuggestions.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-blue-200 hover:shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Text type="secondary" className="mb-1 block text-xs">原句：</Text>
                      <Text delete className="text-gray-500 block bg-white p-2 rounded border border-gray-100 text-sm">
                        {item.original}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" className="mb-1 block text-xs text-blue-600 font-medium">AI 建议修改为：</Text>
                      <Text className="text-blue-700 block bg-blue-50/50 p-2 rounded border border-blue-100 text-sm font-medium italic">
                        “{item.suggestion}”
                      </Text>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[100px]">
                    <Button size="small" icon={<FileSearchOutlined />} className="text-gray-500 hover:text-blue-600">
                      定位到原文
                    </Button>
                    <Button type="primary" size="small" icon={<EditOutlined />} className="bg-blue-600 shadow-sm">
                      一键修改
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Resume Original */}
      <div className="flex w-2/5 flex-col rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-50/50">
          <span className="font-bold text-gray-700">简历原文</span>
          {/* User avatar/logout is handled by main layout header, but per screenshot design request, we can add a small avatar here or just keep it simple */}
        </div>
        
        <div className="flex-1 overflow-hidden bg-gray-100 relative">
          <PdfPreview file={mockResumeFile} />
          
          {/* Overlay Button at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent">
            <Button 
              type="primary" 
              size="large" 
              block
              className="h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg border-none flex items-center justify-center gap-2"
              onClick={handleEnterMockInterview}
            >
              一键进入模拟面试 <RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDiagnosis;
