import React, { useState, useEffect } from 'react';
import { Layout, Select, Button, Modal, message, Tag } from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,
  CodeOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
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
import { getInterviewedTalents } from '@/apis/HR/Talent';

const { Content, Sider } = Layout;

interface Talent {
  id: string;
  name: string;
  position: string;
  status: string;
  interviewTime: string;
  tags: string[];
}

// Mock Radar Data (Static for now as API doesn't provide it yet)
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
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [talents, setTalents] = useState<any[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await getInterviewedTalents();
        if (res.code === 200 || res.code === 0) {
            const list = res.data?.list || [];
            
            // Get local storage overrides
            const localStatusStr = localStorage.getItem('local_talent_status');
            const localStatusMap = localStatusStr ? JSON.parse(localStatusStr) : {};

            const mapped = list.map((item: any) => {
                let status = 'pending';
                // Normalize status from backend
                const backendStatus = (item.interview_status || item.hire_status || '').trim(); 
                
                if (backendStatus === '已面试' || backendStatus === 'interviewed' || backendStatus === '面试完成' || backendStatus === '已完成') {
                    status = 'interviewed';
                } else if (backendStatus === '已录用' || backendStatus === 'accepted') {
                    status = 'accepted';
                } else if (backendStatus === '已淘汰' || backendStatus === 'rejected') {
                    status = 'rejected';
                }
                
                // Override with local status if exists
                if (localStatusMap[item.talent_id]) {
                    status = localStatusMap[item.talent_id];
                }

                return {
                    id: item.talent_id,
                    name: item.full_name,
                    position: item.target_position || '前端工程师',
                    status: status,
                    interviewTime: item.interview_time ? new Date(item.interview_time).toLocaleDateString() : 'N/A',
                    tags: item.core_advantages ? (Array.isArray(item.core_advantages) ? item.core_advantages : item.core_advantages.split(/,|，/)) : [],
                };
            });
            setTalents(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch interviewed talents:', error);
      }
    };
    fetchData();
  }, []);

  const handleAccept = (talent: any) => {
    Modal.confirm({
      title: '确认录用',
      content: `确定要录用 ${talent.name} 吗？`,
      icon: <CheckCircleOutlined className="text-green-600" />,
      onOk: async () => {
          // 使用原来的纯前端逻辑，通过 localStorage 持久化
          const newStatus = 'accepted';
          
          // UI update
          setTalents(prev => prev.map(t => t.id === talent.id ? { ...t, status: newStatus } : t));
          
          // Local persistence
          const localStatusStr = localStorage.getItem('local_talent_status');
          const localStatusMap = localStatusStr ? JSON.parse(localStatusStr) : {};
          localStatusMap[talent.id] = newStatus;
          localStorage.setItem('local_talent_status', JSON.stringify(localStatusMap));
          
          message.success('已标记为录用');
      },
    });
  };

  const handleReject = (talent: any) => {
    Modal.confirm({
      title: '确认淘汰',
      content: `确定要淘汰 ${talent.name} 吗？`,
      okType: 'danger',
      onOk: async () => {
          // 使用原来的纯前端逻辑，通过 localStorage 持久化
          const newStatus = 'rejected';
          
          // UI update
          setTalents(prev => prev.map(t => t.id === talent.id ? { ...t, status: newStatus } : t));
          
          // Local persistence
          const localStatusStr = localStorage.getItem('local_talent_status');
          const localStatusMap = localStatusStr ? JSON.parse(localStatusStr) : {};
          localStatusMap[talent.id] = newStatus;
          localStorage.setItem('local_talent_status', JSON.stringify(localStatusMap));
          
          message.success('已归档淘汰');
      },
    });
  };

  // Dynamic Filter Options
  const positionOptions = React.useMemo(() => {
      const positions = Array.from(new Set(talents.map(t => t.position))).filter(Boolean);
      return [
          { value: 'all', label: '所有岗位' },
          ...positions.map(p => ({ value: p, label: p }))
      ];
  }, [talents]);

  // Filter Logic
  const filteredTalents = talents
    .filter((item) => {
      if (jobFilter !== 'all' && item.position !== jobFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'time_desc') {
        return new Date(b.interviewTime).getTime() - new Date(a.interviewTime).getTime();
      }
      return 0;
    });

  const handleViewReport = (talent: any) => {
    navigate(`/hr/talent/${talent.id}`, { state: { talent } });
  };
  
  const renderStatusBadge = (status: string) => {
      switch(status) {
          case 'accepted':
              return (
                  <span className="rounded-full border border-lime-200 bg-lime-50 px-4 py-1 text-sm font-medium text-lime-700 whitespace-nowrap">
                      已录用
                  </span>
              );
          case 'rejected':
              return (
                  <span className="rounded-full border border-red-200 bg-red-50 px-4 py-1 text-sm font-medium text-red-700 whitespace-nowrap">
                      已淘汰
                  </span>
              );
          case 'interviewed':
              return (
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 whitespace-nowrap">
                      面试完成
                  </span>
              );
          default:
              return (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1 text-sm font-medium text-gray-500 whitespace-nowrap">
                      {status === 'pending' ? '待处理' : status}
                  </span>
              );
      }
  };

  return (
    <Layout className="h-full bg-transparent p-0">
      <Layout className="bg-transparent">
        {/* Left Content - List */}
        <Content className="mr-6 flex flex-col overflow-hidden">
          {/* Filter Bar */}
          <div className="mb-6 flex gap-4 px-2">
            <Select
              defaultValue="all"
              className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
              variant="borderless"
              size="large"
              options={positionOptions}
              onChange={setJobFilter}
            />
            <Select
              defaultValue="default"
              className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
              variant="borderless"
              size="large"
              options={[
                { value: 'default', label: '默认排序' },
                { value: 'time_desc', label: '时间倒序' },
              ]}
              onChange={setSortOrder}
            />
          </div>

          {/* List */}
          <Content className="space-y-4 overflow-y-auto px-2 pb-10">
            {filteredTalents.length === 0 ? (
                <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/50">
                    <span className="text-gray-400 text-lg">暂无相关人才数据，请稍后重试或检查筛选条件</span>
                </div>
            ) : (
                filteredTalents.map((talent) => (
              <div
                key={talent.id}
                className="flex items-center justify-between rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-300">
                    <UserOutlined className="text-3xl text-gray-600" />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-2 min-w-0">
                    <div className="text-2xl font-bold tracking-wide text-gray-800">
                        {talent.name}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-gray-300 bg-cyan-50 px-4 py-1 text-sm font-medium text-cyan-700 whitespace-nowrap">
                        职位 ({talent.position})
                        </span>
                        {renderStatusBadge(talent.status)}
                        {/* <span className="rounded-full border border-gray-300 bg-purple-50 px-4 py-1 text-sm font-medium text-purple-700 whitespace-nowrap">
                        面试时间: {talent.interviewTime}
                        </span> */}
                    </div>

                    <div className="text-sm text-gray-400">
                        核心优势 (eg: {talent.tags.join('/')})
                    </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-3 shrink-0">
                  {talent.status !== 'accepted' && talent.status !== 'rejected' && (
                    <>
                      <Button
                        icon={<CheckOutlined />}
                        loading={loadingIds.has(talent.id)}
                        className="flex h-10 items-center gap-2 rounded-lg border-green-600 text-green-600 hover:text-green-700 hover:border-green-700 hover:bg-green-50 px-4 text-sm font-medium"
                        onClick={() => handleAccept(talent)}
                      >
                        录用
                      </Button>
                      <Button
                        danger
                        icon={<CloseOutlined />}
                        loading={loadingIds.has(talent.id)}
                        className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium"
                        onClick={() => handleReject(talent)}
                      >
                        淘汰
                      </Button>
                    </>
                  )}
                  
                  <Button
                    type="primary"
                    className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-medium shadow-sm hover:bg-blue-700 border-none"
                    onClick={() => handleViewReport(talent)}
                  >
                    查看报告 <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            )))}
          </Content>
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
                <div className="text-xl font-bold text-gray-800">{talents.filter(t => t.status === 'accepted').length}</div>
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
