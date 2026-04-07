import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Modal, Select, Tag } from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getAllTalents } from '@/apis/HR/Talent';
import { createInterviewRoom } from '@/apis/HR/Interview';

const { Content } = Layout;

interface Candidate {
  id: string;
  name: string;
  position: string;
  matchScore: number;
  status: string;
  tags: string[];
}

const JobDashboard: React.FC = () => {
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await getAllTalents();
        if (res.code === 200 || res.code === 0) {
            const list = res.data?.list || [];
            // Get local storage overrides
            const localStatusStr = localStorage.getItem('local_talent_status');
            const localStatusMap = localStatusStr ? JSON.parse(localStatusStr) : {};

            const mapped = list.map((item: any) => {
                let status = 'pending';
                // Normalize status from backend
                const backendStatus = item.interview_status || item.hire_status; // Fallback to hire_status
                if (backendStatus === '已面试' || backendStatus === 'interviewed') status = 'interviewed';
                if (backendStatus === '已录用' || backendStatus === 'accepted') status = 'accepted';
                if (backendStatus === '已淘汰' || backendStatus === 'rejected') status = 'rejected';
                
                // Override with local status if exists
                if (localStatusMap[item.talent_id]) {
                    status = localStatusMap[item.talent_id];
                }

                // Parse advantages which might be a string or array
                let tags: string[] = [];
                if (item.core_advantages) {
                    tags = typeof item.core_advantages === 'string' 
                        ? item.core_advantages.split(/,|，/) 
                        : item.core_advantages;
                }

                return {
                    id: item.talent_id,
                    name: item.full_name || '未知候选人', // Ensure name fallback
                    position: item.target_position || '通用岗位',
                    matchScore: item.match_score || 0,
                    status: status,
                    tags: tags,
                };
            });
            setCandidates(mapped);
        }
      } catch (error) {
        console.error('Failed to fetch talents:', error);
        // message.error('获取人才列表失败');
      }
    };
    fetchData();
  }, []);

  // 筛选逻辑（简单的客户端过滤）
  const filteredCandidates = candidates
    .filter((item) => {
      if (jobFilter !== 'all' && item.position !== jobFilter) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && item.status !== 'pending')
          return false;
        if (statusFilter === 'interviewed' && item.status === 'pending')
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'match_desc') {
        return b.matchScore - a.matchScore;
      }
      // 简单的模拟时间排序（使用 ID 作为代理）
      if (sortOrder === 'time_desc') {
        return Number(b.id) - Number(a.id);
      }
      return 0;
    });

  const handleEnterInterview = async (id: string) => {
    try {
        const res: any = await createInterviewRoom(id);
        if (res.code === 200 || res.code === 0) {
            const { room_id, talent_token } = res.data;
            // 获取当前 HR 的 token，如果没有则提示重新登录
            const hrToken = localStorage.getItem('token');
            if (!hrToken) {
                message.error('Token 已过期，请重新登录');
                return;
            }
            
            // 将 room_id, talent_token 一起传递给面试间
            // 不再在 URL 中传递 HR 自己的 token，面试间会从 localStorage 中获取
            window.open(`/interview-room?roomId=${room_id}&talentToken=${talent_token}&talentId=${id}`, '_blank');
        } else {
            message.error(res.message || '创建面试间失败');
        }
    } catch (error) {
        console.error('Create interview failed:', error);
        message.error('请求失败，无法创建面试间');
    }
  };

  const handleAccept = (candidate: Candidate) => {
    Modal.confirm({
      title: '确认录用',
      content: `确定要录用 ${candidate.name} 吗？`,
      icon: <CheckCircleOutlined className="text-green-600" />,
      onOk: () => {
          // Frontend-only update
          const newStatus = 'accepted';
          setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: newStatus } : c));
          
          // Persist to localStorage
          const localStatusStr = localStorage.getItem('local_talent_status');
          const localStatusMap = localStatusStr ? JSON.parse(localStatusStr) : {};
          localStatusMap[candidate.id] = newStatus;
          localStorage.setItem('local_talent_status', JSON.stringify(localStatusMap));
          
          message.success('已标记为录用');
      },
    });
  };

  const handleReject = (candidate: Candidate) => {
    Modal.confirm({
      title: '确认淘汰',
      content: `确定要淘汰 ${candidate.name} 吗？`,
      okType: 'danger',
      onOk: () => {
          // Frontend-only update
          const newStatus = 'rejected';
          setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: newStatus } : c));
          
          // Persist to localStorage
          const localStatusStr = localStorage.getItem('local_talent_status');
          const localStatusMap = localStatusStr ? JSON.parse(localStatusStr) : {};
          localStatusMap[candidate.id] = newStatus;
          localStorage.setItem('local_talent_status', JSON.stringify(localStatusMap));
          
          message.success('已归档淘汰');
      },
    });
  };

  return (
    <Layout className="h-full bg-transparent p-0">
      {/* 顶部筛选栏 */}
      <div className="mb-6 flex gap-4 px-2">
        <Select
          defaultValue="all"
          className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
          bordered={false}
          size="large"
          options={[
            { value: 'all', label: '所有简历' },
            { value: '产品经理', label: '产品经理' },
            { value: '前端开发', label: '前端开发' },
            { value: 'Java后端', label: 'Java后端' },
          ]}
          onChange={setJobFilter}
        />
        <Select
          defaultValue="all"
          className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
          bordered={false}
          size="large"
          options={[
            { value: 'all', label: '面试状态' },
            { value: 'pending', label: '未面试' },
            { value: 'interviewed', label: '已面试' },
          ]}
          onChange={setStatusFilter}
        />
        <Select
          defaultValue="default"
          className="w-48 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-300"
          bordered={false}
          size="large"
          options={[
            { value: 'default', label: '排序' },
            { value: 'match_desc', label: '匹配度从高到低' },
            { value: 'time_desc', label: '投递时间最新' },
          ]}
          onChange={setSortOrder}
        />
      </div>

      {/* 候选人列表 */}
      <Content className="space-y-4 overflow-y-auto px-2 pb-10">
        {filteredCandidates.length === 0 ? (
            <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/50">
                <span className="text-gray-400 text-lg">暂无相关人才数据，请稍后重试或检查筛选条件</span>
            </div>
        ) : (
            filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
          >
            {/* 左侧：头像与信息 */}
            <div className="flex items-center gap-6">
              {/* 头像 */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-300">
                <UserOutlined className="text-3xl text-gray-600" />
              </div>

              {/* 信息块 */}
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold tracking-wide text-gray-800">
                  {candidate.name}
                </div>

                {/* 标签行 */}
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-gray-300 bg-cyan-50 px-4 py-1 text-sm font-medium text-cyan-700">
                    职位 ({candidate.position})
                  </span>
                  <span className="rounded-full border border-gray-300 bg-lime-50 px-4 py-1 text-sm font-medium text-lime-700">
                    匹配度: {candidate.matchScore}%
                  </span>
                  <span className="rounded-full border border-gray-300 bg-purple-50 px-4 py-1 text-sm font-medium text-purple-700">
                    状态: {candidate.status === 'pending' ? '未面试' : '已面试'}
                  </span>
                </div>

                {/* 描述 */}
                <div className="text-s mt-1 text-gray-400">
                  核心优势 (例如: {candidate.tags.join('/')})
                </div>
              </div>
            </div>

            {/* 右侧：操作 */}
            <div>
              {candidate.status === 'pending' ? (
                <Button
                  type="primary"
                  className="flex h-10 items-center gap-2 rounded-lg border-0 bg-blue-600 px-6 text-sm font-medium shadow-sm hover:bg-blue-700"
                  onClick={() => handleEnterInterview(candidate.id)}
                >
                  进入定制面试 <ArrowRightOutlined />
                </Button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium text-gray-500">已完成面试</span>
                    <div className="flex gap-2">
                        {candidate.status === 'interviewed' ? (
                          <>
                            <Button 
                                icon={<CheckOutlined />}
                                className="text-blue-600 border-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 rounded-lg px-4 h-9 shadow-sm transition-all"
                                onClick={() => handleAccept(candidate)}
                            >
                                录用
                            </Button>
                            <Button 
                                danger 
                                icon={<CloseOutlined />}
                                className="text-red-500 border-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 rounded-lg px-4 h-9 shadow-sm transition-all"
                                onClick={() => handleReject(candidate)}
                            >
                                淘汰
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                             <Button 
                                icon={<CheckOutlined />}
                                className={`${candidate.status === 'accepted' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-gray-400 border-gray-200 hover:text-blue-600 hover:border-blue-600'} rounded-lg px-4 h-9 shadow-sm transition-all`}
                                onClick={() => handleAccept(candidate)}
                            >
                                录用
                            </Button>
                            <Button 
                                danger 
                                icon={<CloseOutlined />}
                                className={`${candidate.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 'text-gray-400 border-gray-200 hover:text-red-600 hover:border-red-600'} rounded-lg px-4 h-9 shadow-sm transition-all`}
                                onClick={() => handleReject(candidate)}
                            >
                                淘汰
                            </Button>
                          </div>
                        )}
                    </div>
                </div>
              )}
            </div>
          </div>
        )))}
      </Content>
    </Layout>
  );
};

export default JobDashboard;
