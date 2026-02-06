import React from 'react';
import { Layout, Button, Avatar, Typography, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  UserOutlined,
  FileTextOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const mockRadarData = [
  { subject: '技术深度', A: 120, fullMark: 150 },
  { subject: '沟通逻辑', A: 98, fullMark: 150 },
  { subject: '稳定性', A: 86, fullMark: 150 },
  { subject: '项目经验', A: 99, fullMark: 150 },
  { subject: '团队协作', A: 85, fullMark: 150 },
  { subject: '抗压能力', A: 65, fullMark: 150 },
];

const TalentReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // In a real app, use this ID to fetch data
  console.log('Viewing talent report for id:', id);

  return (
    <Layout className="flex h-screen w-full flex-col bg-cover bg-center" style={{ backgroundImage: "url('/welcome-bg.png')" }}>
        <div className="absolute inset-0 z-0 bg-white/90 backdrop-blur-sm" />
        
        {/* Header */}
        <Header className="relative z-10 flex h-auto items-center justify-between border-b border-gray-300 bg-white/80 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-6">
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined className="text-xl"/>} 
                    onClick={() => navigate(-1)}
                    className="hover:bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center"
                />
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <Title level={3} className="!mb-0 !mt-0 text-gray-800">张三</Title>
                        <div className="flex gap-2">
                            <span className="rounded-full border border-gray-300 bg-cyan-50 px-3 py-0.5 text-xs font-medium text-cyan-700">
                                职位 (产品经理)
                            </span>
                            <span className="rounded-full border border-gray-300 bg-lime-50 px-3 py-0.5 text-xs font-medium text-lime-700">
                                已录用
                            </span>
                            <span className="rounded-full border border-gray-300 bg-purple-50 px-3 py-0.5 text-xs font-medium text-purple-700">
                                面试时间: 2023-10-24
                            </span>
                        </div>
                    </div>
                    <Text type="secondary" className="text-xs">
                        核心优势 (eg: 985毕业/大厂实习经验/多年工作经验/竞赛)
                    </Text>
                </div>
            </div>
            <Button 
                type="primary" 
                size="large" 
                icon={<DownloadOutlined />}
                className="bg-blue-600 border border-gray-300 shadow-sm"
            >
                导出报告
            </Button>
        </Header>

        {/* Content */}
        <Content className="relative z-10 flex-1 overflow-hidden p-6">
            <div className="flex h-full w-full gap-4">
                
                {/* Left Column: Personal Info & AI Assessment */}
                <div className="flex w-1/4 flex-col gap-4">
                    {/* Personal Info Card */}
                    <div className="flex flex-col items-center rounded-2xl border border-gray-300 bg-white/80 p-6 shadow-sm backdrop-blur-md">
                        <Avatar 
                            size={100} 
                            icon={<UserOutlined />} 
                            className="mb-4 bg-blue-600 text-white text-4xl border border-gray-300"
                        />
                        <Title level={2} className="!mb-1 text-blue-600">张三</Title>
                        <Text type="secondary" className="mb-4">x年工作经验 | 毕业学校</Text>
                        <div className="flex flex-col gap-2 items-center w-full">
                            <span className="w-full text-center rounded-lg bg-gray-100 py-1 text-xs font-bold text-gray-600"># 分布式架构</span>
                            <span className="w-full text-center rounded-lg bg-gray-100 py-1 text-xs font-bold text-gray-600"># 高性能计算</span>
                        </div>
                    </div>

                    {/* AI Assessment Card */}
                    <div className="flex-1 rounded-2xl border border-gray-300 bg-white/80 p-6 shadow-sm backdrop-blur-md flex flex-col">
                        <div className="flex items-center gap-2 mb-4 border-l-4 border-purple-500 pl-3">
                            <Title level={4} className="!mb-0">AI 智能评估</Title>
                        </div>
                        <div className="flex-1 w-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar name="张三" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#a78bfa" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Interview Record */}
                <div className="flex w-2/5 flex-col rounded-2xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-md overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-300 p-4 bg-gray-50/50">
                        <Title level={4} className="!mb-0">面试记录回溯</Title>
                        <div className="text-xs text-gray-500">面试时长: 45min | 录音已转写完毕</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Q1 */}
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-3">
                                <Avatar className="bg-purple-100 text-purple-600 border border-gray-300 shrink-0">Q1</Avatar>
                                <div className="rounded-2xl rounded-tl-none border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800 shadow-sm">
                                    <span className="font-bold">请谈谈你在高并发场景下如何处理 Redis 缓存雪崩问题的？</span>
                                </div>
                            </div>
                            <div className="flex gap-3 pl-12">
                                <div className="relative rounded-2xl border-l-4 border-l-gray-300 border-t border-r border-b border-gray-200 bg-white p-6 text-sm text-gray-600 italic shadow-sm">
                                    <span className="text-4xl text-gray-200 absolute top-2 left-2">“</span>
                                    我们主要采用分级缓存策略，同时在过期时间上增加随机抖动。此外，我们引入了 Sentinel 进行熔断保护，防止大面积请求穿透到数据库...
                                    <span className="text-4xl text-gray-200 absolute bottom-[-10px] right-4">”</span>
                                </div>
                            </div>
                            
                            {/* AI Analysis Box */}
                            <div className="ml-12 mt-2 rounded-xl border border-purple-200 bg-purple-50 p-4">
                                <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold">
                                    <BulbOutlined /> AI 解析:
                                </div>
                                <div className="text-sm text-purple-900 mb-3">
                                    回答极其专业有深度，不仅提到了常规方案（随机时间），还提到了熔断机制。表现出对高可用架构的全局观。
                                </div>
                                <div className="flex gap-4 text-xs font-bold">
                                    <span className="text-green-600">● 真实度: 高</span>
                                    <span className="text-green-600">● 逻辑性: 优秀</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Resume Preview */}
                <div className="flex w-1/3 flex-col rounded-2xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-md overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-gray-300 p-4 bg-gray-50/50">
                        <FileTextOutlined />
                        <Title level={4} className="!mb-0">简历原文</Title>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {/* Mock Resume Content */}
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="border-b border-gray-100 pb-2 mb-2">
                                <div className="font-bold text-lg text-gray-900">基本信息</div>
                                <div className="mt-2">姓名：张三</div>
                                <div>邮箱：zhangsan@example.com</div>
                                <div>电话：13800138000</div>
                            </div>
                            
                            <div className="border-b border-gray-100 pb-2 mb-2">
                                <div className="font-bold text-lg text-gray-900">工作经历</div>
                                <div className="mt-2 font-bold">某知名互联网公司 - 高级后端工程师</div>
                                <div className="text-xs text-gray-400 mb-1">2020.07 - 至今</div>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>负责核心交易系统的架构设计与重构，将系统吞吐量提升了 200%。</li>
                                    <li>主导微服务拆分，降低了系统耦合度，提升了开发效率。</li>
                                    <li>优化数据库查询性能，将平均响应时间从 500ms 降低至 50ms。</li>
                                </ul>
                            </div>

                            <div className="border-b border-gray-100 pb-2 mb-2">
                                <div className="font-bold text-lg text-gray-900">教育背景</div>
                                <div className="mt-2 font-bold">某985大学 - 计算机科学与技术 (硕士)</div>
                                <div className="text-xs text-gray-400">2017.09 - 2020.06</div>
                            </div>

                            <div>
                                <div className="font-bold text-lg text-gray-900">技能清单</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Tag>Java</Tag> <Tag>Spring Boot</Tag> <Tag>MySQL</Tag> <Tag>Redis</Tag> <Tag>Kubernetes</Tag>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Content>
    </Layout>
  );
};

export default TalentReportPage;
