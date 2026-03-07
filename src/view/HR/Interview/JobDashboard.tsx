import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Modal, Select } from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
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
            const mapped = list.map((item: any) => {
                let status = 'pending';
                if (item.interview_status === '已面试' || item.interview_status === 'interviewed') status = 'interviewed';
                if (item.interview_status === '已录用' || item.interview_status === 'accepted') status = 'accepted';
                if (item.interview_status === '已淘汰' || item.interview_status === 'rejected') status = 'rejected';
                
                return {
                    id: item.talent_id,
                    name: item.full_name,
                    position: item.target_position,
                    matchScore: item.match_score,
                    status: status,
                    tags: item.core_advantages ? item.core_advantages.split(/,|，/) : [],
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
            // 对于 HR，token 通常从登录态获取或后端返回专门的 hr_token
            // 这里假设 create 接口返回的是用于分享给求职者的 token，或者包含 hr_token
            // 如果后端只返回了 room_id，HR 的 token 可能需要另外获取或使用全局 token
            // 假设：HR 直接使用全局 token 验证，或者 URL 参数仅用于传递 roomId
            
            // 注意：演示代码中 HR token 也是模拟的，这里我们使用后端返回的 room_id
            // 并假设当前用户已登录，validateInterview 会处理权限
            
            // 为了演示方便，我们假设后端也返回了 hr_token，或者我们构造一个
            const hrToken = `hr-token-${id}`; // 临时模拟，实际应使用真实逻辑
            
            window.open(`/interview-room?roomId=${room_id}&token=${hrToken}`, '_blank');
        } else {
            message.error(res.message || '创建面试间失败');
        }
    } catch (error) {
        console.error('Create interview failed:', error);
        message.error('请求失败，无法创建面试间');
    }
  };

  const handleAccept = (name: string) => {
    Modal.confirm({
      title: '确认录用',
      content: `确定要录用 ${name} 吗？`,
      icon: <CheckCircleOutlined className="text-green-600" />,
      onOk: () => message.success('已标记为录用'),
    });
  };

  const handleReject = (name: string) => {
    Modal.confirm({
      title: '确认淘汰',
      content: `确定要淘汰 ${name} 吗？`,
      okType: 'danger',
      onOk: () => message.success('已归档淘汰'),
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
                        <Button 
                            size="small" 
                            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300"
                            onClick={() => handleAccept(candidate.name)}
                        >
                            录用
                        </Button>
                        <Button 
                            size="small" 
                            danger 
                            className="bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300"
                            onClick={() => handleReject(candidate.name)}
                        >
                            淘汰
                        </Button>
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
