import React, { useState } from 'react';
import { Layout, Button, message, Modal, Select } from 'antd';
import {
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

// Mock Data
const mockCandidates = [
  {
    id: '1',
    name: '张三',
    position: '产品经理',
    matchScore: 88,
    status: 'pending', // pending, interviewed, accepted, rejected
    tags: ['985毕业', '大厂实习经验', '多年工作经验', '竞赛'],
  },
  {
    id: '2',
    name: '李四',
    position: '前端开发',
    matchScore: 90,
    status: 'pending',
    tags: ['985毕业', '大厂实习经验', '多年工作经验', '竞赛'],
  },
  {
    id: '3',
    name: '王五',
    position: 'Java后端',
    matchScore: 80,
    status: 'interviewed',
    tags: ['985毕业', '大厂实习经验', '多年工作经验', '竞赛'],
  },
];

const JobDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Filter states
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('default');

  // Filter Logic (Simple client-side filtering for mock)
  const filteredCandidates = mockCandidates
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
      // Simple mock time sort (using ID as proxy)
      if (sortOrder === 'time_desc') {
        return Number(b.id) - Number(a.id);
      }
      return 0;
    });

  const handleEnterInterview = (id: string) => {
    navigate(`/hr/interview/${id}`);
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
      {/* Top Filter Bar */}
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

      {/* Candidate List */}
      <Content className="space-y-4 overflow-y-auto px-2 pb-10">
        {filteredCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
          >
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-300">
                <UserOutlined className="text-3xl text-gray-600" />
              </div>

              {/* Info Block */}
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold tracking-wide text-gray-800">
                  {candidate.name}
                </div>

                {/* Tags Row */}
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

                {/* Description */}
                <div className="text-s mt-1 text-gray-400">
                  核心优势 (eg: {candidate.tags.join('/')})
                </div>
              </div>
            </div>

            {/* Right: Actions */}
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
                <div className="flex flex-col gap-2">
                  <Button
                    className="flex h-9 min-w-[110px] items-center justify-between rounded-lg border-0 bg-green-100 px-4 text-green-700 hover:bg-green-200"
                    onClick={() => handleAccept(candidate.name)}
                  >
                    标记录用 <CheckCircleOutlined />
                  </Button>
                  <Button
                    className="flex h-9 min-w-[110px] items-center justify-between rounded-lg border-0 bg-red-100 px-4 text-red-700 hover:bg-red-200"
                    onClick={() => handleReject(candidate.name)}
                  >
                    淘汰归档 <CloseCircleOutlined />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </Content>
    </Layout>
  );
};

export default JobDashboard;
