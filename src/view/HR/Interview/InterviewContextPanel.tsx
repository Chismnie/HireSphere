import React from 'react';
import { Tabs, Alert, Typography, Card } from 'antd';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { FileTextOutlined, BulbOutlined } from '@ant-design/icons';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const { Text } = Typography;

const mockRadarData = [
  { subject: '技术能力', A: 120, fullMark: 150 },
  { subject: '沟通表达', A: 98, fullMark: 150 },
  { subject: '逻辑思维', A: 86, fullMark: 150 },
  { subject: '项目经验', A: 99, fullMark: 150 },
  { subject: '团队协作', A: 85, fullMark: 150 },
  { subject: '学习潜力', A: 65, fullMark: 150 },
];

const InterviewContextPanel: React.FC = () => {
  const ResumeTab = () => (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-gray-50/50">
      {/* Placeholder for PDF - In a real app, this would be a URL */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="mb-4 rounded-full bg-white p-8 shadow-sm border border-gray-300">
          <FileTextOutlined className="text-4xl text-blue-200" />
        </div>
        <Text type="secondary" className="text-gray-400">
          暂无简历预览
        </Text>
        <Text className="mt-2 text-xs text-gray-300">
          （此处应集成 react-pdf 渲染真实 PDF）
        </Text>
      </div>
    </div>
  );

  const AIInsightTab = () => (
    <div className="custom-scrollbar h-full space-y-6 overflow-y-auto p-1 pr-2 pb-10">
      {/* Risk Alert Section */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
          风险评估
        </div>
        <Alert
          message="风险预警：频繁跳槽"
          description="该候选人在过去3年内更换了4份工作，平均在职时间不足9个月。"
          type="warning"
          showIcon
          className="border-gray-300 bg-orange-50 shadow-sm border"
        />
        <Alert
          message="高风险：学历存疑"
          description="简历中的毕业年份与教育部学籍数据库可能存在出入（需人工核实）。"
          type="error"
          showIcon
          className="border-gray-300 bg-red-50 shadow-sm border"
        />
      </div>

      {/* Match Score */}
      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          岗位匹配度
        </div>
        <Card
          variant="borderless"
          className="bg-gradient-to-br from-blue-50 to-indigo-50/50 text-center shadow-sm transition-shadow hover:shadow-md border border-gray-300"
        >
          <div className="mt-2 text-6xl font-black tracking-tighter text-blue-600">
            87<span className="text-2xl font-normal text-blue-400">%</span>
          </div>
          <Text className="mt-1 block text-xs font-medium text-blue-400">
            基于 JD 与简历关键词深度匹配
          </Text>
        </Card>
      </div>

      {/* Radar Chart */}
      <div>
        <div className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          能力模型
        </div>
        <div className="h-[320px] w-full rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={mockRadarData}
            >
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 150]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="候选人"
                dataKey="A"
                stroke="#2563eb"
                strokeWidth={2}
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const items = [
    {
      key: 'resume',
      label: (
        <span className="flex items-center gap-2 px-2">
          <FileTextOutlined /> 应聘简历
        </span>
      ),
      children: <ResumeTab />,
    },
    {
      key: 'insight',
      label: (
        <span className="flex items-center gap-2 px-2">
          <BulbOutlined /> AI 洞察
        </span>
      ),
      children: <AIInsightTab />,
    },
  ];

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex flex-1 flex-col overflow-hidden px-6 pb-6 pt-2">
        <Tabs
          defaultActiveKey="insight"
          items={items}
          className="flex h-full flex-col [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:overflow-hidden [&_.ant-tabs-content]:h-full [&_.ant-tabs-tabpane]:h-full"
          size="large"
          tabBarStyle={{ marginBottom: 24, borderBottom: '1px solid #d1d5db' }}
        />
      </div>
    </div>
  );
};

export default InterviewContextPanel;
