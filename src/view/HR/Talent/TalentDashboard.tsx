import React, { useState } from 'react';
import { Layout, Select, Button } from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,
  CodeOutlined,
  TeamOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const { Content, Sider } = Layout;

// Mock Data for Talent Pool
const mockTalents = [
  {
    id: '1',
    name: '张三',
    position: '产品经理',
    status: 'accepted', // accepted, rejected
    interviewTime: '2023-10-24',
    tags: ['985毕业', '大厂实习经验', '多年工作经验'],
  },
  {
    id: '2',
    name: '李四',
    position: '前端开发',
    status: 'accepted',
    interviewTime: '2023-10-25',
    tags: ['985毕业', '大厂实习经验', '多年工作经验'],
  },
  {
    id: '3',
    name: '王五',
    position: 'Java后端',
    status: 'rejected',
    interviewTime: '2023-10-26',
    tags: ['985毕业', '大厂实习经验', '多年工作经验'],
  },
];

const mockRadarData = [
  { subject: '技术深度', A: 120, fullMark: 150 },
  { subject: '沟通逻辑', A: 98, fullMark: 150 },
  { subject: '稳定性', A: 86, fullMark: 150 },
  { subject: '项目经验', A: 99, fullMark: 150 },
  { subject: '团队协作', A: 85, fullMark: 150 },
  { subject: '潜力值', A: 65, fullMark: 150 },
];

const TalentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = useState<string>('default');

  const handleViewReport = (id: string) => {
    navigate(`/hr/talent/${id}`);
  };

  return (
    <Layout className="h-full bg-transparent p-0">
      <Layout className="bg-transparent">
        {/* Left Content - List */}
        <Content className="mr-6 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          <div className="mb-6 flex gap-4">
            <Select
              defaultValue="all"
              className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
              variant="borderless"
              size="large"
              options={[{ value: 'all', label: '所有简历' }]}
            />
            <Select
              defaultValue="default"
              className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
              variant="borderless"
              size="large"
              options={[{ value: 'default', label: '排序' }]}
              onChange={setSortOrder}
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto pb-10 space-y-4 pr-2">
            {mockTalents.map((talent) => (
              <div
                key={talent.id}
                className="grid grid-cols-[auto_1fr_auto] gap-6 items-center rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
              >
                {/* Avatar */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200">
                  <UserOutlined className="text-3xl text-gray-600" />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 min-w-0">
                  <div className="text-2xl font-bold tracking-wide text-gray-800">
                    {talent.name}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-gray-300 bg-cyan-50 px-4 py-1 text-sm font-medium text-cyan-700 whitespace-nowrap">
                      职位 ({talent.position})
                    </span>
                    <span
                      className={`rounded-full border border-gray-300 px-4 py-1 text-sm font-medium whitespace-nowrap ${
                        talent.status === 'accepted'
                          ? 'bg-lime-50 text-lime-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {talent.status === 'accepted' ? '已录用' : '已淘汰'}
                    </span>
                    <span className="rounded-full border border-gray-300 bg-purple-50 px-4 py-1 text-sm font-medium text-purple-700 whitespace-nowrap">
                      面试时间: {talent.interviewTime}
                    </span>
                  </div>

                  <div className="text-sm text-gray-400">
                    核心优势 (eg: {talent.tags.join('/')})
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  type="primary"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 h-10 text-sm font-medium shadow-sm hover:bg-blue-700 border-none ml-4 shrink-0"
                  onClick={() => handleViewReport(talent.id)}
                >
                  查看报告 <ArrowRightOutlined />
                </Button>
              </div>
            ))}
          </div>
        </Content>

        {/* Right Sider - Analysis */}
        <Sider
          width={350}
          className="rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md"
          theme="light"
        >
          <div className="mb-6 text-2xl font-bold text-gray-800 text-center">
            人才数据分析
          </div>
          
          <div className="mb-6 grid grid-cols-3 gap-3">
             <div className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-blue-50 p-3 text-center">
                <CodeOutlined className="mb-2 text-xl text-blue-600" />
                <div className="text-sm text-gray-500">模型准确率</div>
                <div className="text-xl font-bold text-gray-800">93%</div>
             </div>
             <div className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-green-50 p-3 text-center">
                <TeamOutlined className="mb-2 text-xl text-green-600" />
                <div className="text-sm text-gray-500">已录用总数</div>
                <div className="text-xl font-bold text-gray-800">50</div>
             </div>
             <div className="flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-orange-50 p-3 text-center">
                <FieldTimeOutlined className="mb-2 text-xl text-orange-600" />
                <div className="text-sm text-gray-500">平均时长</div>
                <div className="text-xl font-bold text-gray-800">25m</div>
             </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-white p-4">
            <div className="mb-4 text-sm font-bold text-gray-600">
              企业人才画像雷达图 (基于已录用人才)
            </div>
            <div className="h-[250px] w-full">
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
                    name="企业画像"
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
        </Sider>
      </Layout>
    </Layout>
  );
};

export default TalentDashboard;
