import React, { useState, useEffect } from 'react';
import {
  Button,
  Slider,
  InputNumber,
  Input,
  Modal,
  message,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SaveOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

const { Title, Paragraph } = Typography;

// Mock Data Types
interface Indicator {
  id: string;
  name: string;
  value: number; // 0-100
  category: string;
  isCustom?: boolean;
}

interface JobProfile {
  id: string;
  name: string;
  indicators: Indicator[];
  redLines: string[];
  aiSuggestion: string;
}

// Mock Data
const MOCK_JOBS: JobProfile[] = [
  {
    id: '1',
    name: 'Java后端',
    indicators: [
      { id: '1', name: '技术深度', value: 80, category: '专业能力' },
      { id: '2', name: '尽责性', value: 75, category: '大五人格' },
      { id: '3', name: '开放性', value: 60, category: '大五人格' },
      { id: '4', name: '情绪稳定', value: 70, category: '大五人格' },
      { id: '5', name: '团队协作', value: 85, category: '社会特质' },
    ],
    redLines: ['本科以上学历', '空窗期不超过8个月', '3年以上经验'],
    aiSuggestion:
      '针对高级后端开发工程师岗位，社会学研究表明该群体通常表现出较高的“对内认知需求”。鉴于你提到该岗位可能面临复杂的舆论环境，我们建议上调“情绪稳定性”的权重。',
  },
  {
    id: '2',
    name: '产品经理',
    indicators: [
      { id: '1', name: '业务敏感', value: 90, category: '胜任力' },
      { id: '2', name: '沟通能力', value: 95, category: '通用能力' },
      { id: '3', name: '逻辑思维', value: 85, category: '通用能力' },
      { id: '4', name: '同理心', value: 80, category: '情商' },
      { id: '5', name: '抗压能力', value: 75, category: '心理素质' },
    ],
    redLines: ['本科以上学历', '有大型项目经验'],
    aiSuggestion:
      '产品经理岗位需要极强的沟通协调能力和同理心。建议重点关注“沟通能力”和“同理心”指标，并适当降低对纯技术深度的要求。',
  },
  {
    id: '3',
    name: '前端开发',
    indicators: [
      { id: '1', name: '技术广度', value: 85, category: '专业能力' },
      { id: '2', name: '审美能力', value: 80, category: '专业能力' },
      { id: '3', name: '学习能力', value: 90, category: '潜力' },
      { id: '4', name: '细节关注', value: 85, category: '工作习惯' },
      { id: '5', name: '团队协作', value: 80, category: '社会特质' },
    ],
    redLines: ['统招本科', '熟悉React/Vue'],
    aiSuggestion:
      '前端技术更新迭代快，建议适当提高“学习能力”的权重。同时，作为直接面向用户的岗位，“细节关注”和“审美能力”也不可忽视。',
  },
];

const JobProfilePage: React.FC = () => {
  const [activeJobId, setActiveJobId] = useState<string>('1');
  const [currentProfile, setCurrentProfile] = useState<JobProfile | null>(null);
  const [newRedLine, setNewRedLine] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize data when job changes
  useEffect(() => {
    const job = MOCK_JOBS.find((j) => j.id === activeJobId);
    if (job) {
      // Deep copy to allow editing without mutating mock data directly immediately
      setCurrentProfile(JSON.parse(JSON.stringify(job)));
    }
  }, [activeJobId]);

  const handleIndicatorChange = (id: string, newValue: number | null) => {
    if (!currentProfile || newValue === null) return;
    setCurrentProfile({
      ...currentProfile,
      indicators: currentProfile.indicators.map((ind) =>
        ind.id === id ? { ...ind, value: newValue } : ind
      ),
    });
  };

  const handleIndicatorNameChange = (id: string, newName: string) => {
    if (!currentProfile) return;
    setCurrentProfile({
      ...currentProfile,
      indicators: currentProfile.indicators.map((ind) =>
        ind.id === id ? { ...ind, name: newName } : ind
      ),
    });
  };

  const handleAddRedLine = () => {
    if (!currentProfile || !newRedLine.trim()) return;
    Modal.confirm({
      title: '确认添加筛选条件',
      content: `是否确认添加红线条件：“${newRedLine.trim()}”？这将在初筛阶段自动淘汰不符合的候选人。`,
      onOk: () => {
        setCurrentProfile({
          ...currentProfile,
          redLines: [...currentProfile.redLines, newRedLine.trim()],
        });
        setNewRedLine('');
        message.success('已添加筛选条件');
      },
    });
  };

  const handleDeleteRedLine = (index: number) => {
    if (!currentProfile) return;
    const newLines = [...currentProfile.redLines];
    newLines.splice(index, 1);
    setCurrentProfile({
      ...currentProfile,
      redLines: newLines,
    });
  };

  const handleAiAdjustment = () => {
    setIsModalOpen(true);
  };

  const confirmAiAdjustment = () => {
    if (!currentProfile) return;
    // Mock AI adjustment: just randomize slightly for effect
    const adjustedIndicators = currentProfile.indicators.map((ind) => ({
      ...ind,
      value: Math.min(100, Math.max(0, ind.value + (Math.random() * 20 - 10))),
    }));
    setCurrentProfile({
      ...currentProfile,
      indicators: adjustedIndicators,
    });
    setIsModalOpen(false);
    message.success('已根据 AI 建议调整指标权重');
  };

  const handleAddCustomIndicator = () => {
    if (!currentProfile) return;
    const newId = `custom-${Date.now()}`;
    setCurrentProfile({
      ...currentProfile,
      indicators: [
        ...currentProfile.indicators,
        {
          id: newId,
          name: '自定义指标',
          value: 50,
          category: '自定义',
          isCustom: true,
        },
      ],
    });
  };

  const handleDeleteIndicator = (id: string) => {
    if (!currentProfile) return;
    setCurrentProfile({
      ...currentProfile,
      indicators: currentProfile.indicators.filter((ind) => ind.id !== id),
    });
  };

  if (!currentProfile) return <div>Loading...</div>;

  // Prepare Radar Data
  const radarData = currentProfile.indicators.map((ind) => ({
    subject: ind.name,
    A: ind.value,
    fullMark: 100,
  }));

  return (
    <div className="flex h-full w-full gap-4 p-4 overflow-hidden">
      {/* Left: Job Selector Sidebar */}
      <div className="flex w-64 flex-col rounded-2xl border border-gray-300 bg-white/80 p-4 shadow-sm backdrop-blur-md h-full">
        <div className="mb-4 flex items-center justify-between px-2">
            <span className="text-lg font-bold text-gray-800">岗位列表</span>
            <Button type="text" icon={<PlusOutlined />} size="small" className="text-blue-600 hover:bg-blue-50" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {MOCK_JOBS.map((job) => (
            <div
              key={job.id}
              onClick={() => setActiveJobId(job.id)}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                activeJobId === job.id
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${activeJobId === job.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {job.name}
                </span>
                {activeJobId === job.id && <div className="h-2 w-2 rounded-full bg-blue-600" />}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {job.indicators.length} 个核心指标
              </div>
            </div>
          ))}
          {/* Mock placeholders */}
          {[1, 2, 3].map((i) => (
            <div
              key={`mock-${i}`}
              className="rounded-xl border border-dashed border-gray-200 p-3 text-center text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors"
            >
              <span className="text-xs">+ 添加新岗位</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden min-w-0">
        {/* Left: Main Configuration (Indicators) */}
        <div className="flex flex-[2] flex-col rounded-2xl border border-gray-300 bg-white/90 p-4 shadow-sm backdrop-blur-md overflow-hidden min-w-[450px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col gap-1 overflow-hidden mr-4">
                <Title level={4} className="!mb-0 text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                当前设置: {currentProfile.name}
                </Title>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddCustomIndicator}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-xs"
              >
                添加指标
              </Button>
              <div className="flex gap-2">
                <Button icon={<SaveOutlined />} type="primary" size="small" className="bg-blue-600 shadow-md shadow-blue-200 text-xs">
                    保存
                </Button>
                <Button icon={<ReloadOutlined />} size="small" onClick={() => setActiveJobId(activeJobId)} className="text-xs">
                    重置
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {currentProfile.indicators.map((ind) => (
              <div
                key={ind.id}
                className="group relative rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ind.isCustom ? (
                        <Input
                            value={ind.name}
                            onChange={(e) => handleIndicatorNameChange(ind.id, e.target.value)}
                            className="text-sm font-bold text-gray-800 w-32 border-transparent hover:border-gray-300 focus:border-blue-500 px-1 -ml-1 h-7"
                            placeholder="输入名称"
                        />
                    ) : (
                        <span className="text-sm font-bold text-gray-800">
                        {ind.name}
                        </span>
                    )}
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 border border-gray-200">
                      {ind.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded border border-gray-300 bg-white px-1.5 py-0.5 shadow-sm">
                        <InputNumber
                        min={0}
                        max={100}
                        value={Math.round(ind.value)}
                        onChange={(val) => handleIndicatorChange(ind.id, val)}
                        className="w-10 !border-0 !shadow-none [&_.ant-input-number-handler-wrap]:hidden text-center font-bold text-gray-700 text-xs h-5 leading-5"
                        />
                        <span className="text-gray-400 font-medium text-[10px] pr-0.5">%</span>
                        <div className="flex flex-col border-l border-gray-200 pl-1 ml-1 gap-[1px]">
                            <div className="h-1.5 w-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-b-[3px] border-b-gray-400 cursor-pointer hover:border-b-blue-600"
                                onClick={() => handleIndicatorChange(ind.id, Math.min(100, (ind.value || 0) + 1))}
                            ></div>
                            <div className="h-1.5 w-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-t-[3px] border-t-gray-400 cursor-pointer hover:border-t-blue-600"
                                onClick={() => handleIndicatorChange(ind.id, Math.max(0, (ind.value || 0) - 1))}
                            ></div>
                        </div>
                    </div>
                    {ind.isCustom && (
                        <Button 
                            type="text" 
                            size="small"
                            danger 
                            icon={<DeleteOutlined />} 
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 min-w-0"
                            onClick={() => handleDeleteIndicator(ind.id)}
                        />
                    )}
                  </div>
                </div>
                <Slider
                  min={0}
                  max={100}
                  value={ind.value}
                  onChange={(val) => handleIndicatorChange(ind.id, val)}
                  trackStyle={{ backgroundColor: '#3b82f6', height: 4, borderRadius: 2 }}
                  handleStyle={{
                    borderColor: '#3b82f6',
                    height: 14,
                    width: 14,
                    marginTop: -5,
                    boxShadow: '0 1px 3px rgba(59, 130, 246, 0.4)',
                    backgroundColor: '#fff',
                    opacity: 1
                  }}
                  railStyle={{ backgroundColor: '#f3f4f6', height: 4, borderRadius: 2 }}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-[10px] text-gray-400 text-center">
            基于大五人格 (OCEAN) 与冰山模型构建
          </div>
        </div>

        {/* Middle: Visualization & AI */}
        <div className="flex flex-1 flex-col gap-4 min-w-[300px]">
          {/* Radar Chart */}
          <div className="flex-1 rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md flex flex-col">
            <div className="mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              <span className="font-bold text-gray-800">人才画像可视化</span>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={currentProfile.name}
                    dataKey="A"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="rounded-2xl border border-gray-300 bg-white/90 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between border-l-4 border-blue-600 pl-3">
              <span className="font-bold text-gray-800">智能建模调整建议</span>
              <Button 
                type="primary" 
                size="small" 
                icon={<RobotOutlined />}
                className="bg-blue-600 shadow-sm"
                onClick={handleAiAdjustment}
              >
                AI 一键调整
              </Button>
            </div>
            <Paragraph className="text-sm text-gray-600 leading-relaxed mb-0 text-justify">
                {currentProfile.aiSuggestion}
            </Paragraph>
          </div>
        </div>

        {/* Right: Red Lines */}
        <div className="flex w-[280px] flex-col rounded-2xl border border-gray-300 bg-gray-50/80 p-6 shadow-sm backdrop-blur-md border-dashed border-2">
            <div className="mb-4 flex items-center gap-2 border-l-4 border-red-500 pl-3">
              <span className="font-bold text-gray-800">筛选红线条件 (自动淘汰规则)</span>
            </div>
            
            <div className="space-y-3 mb-4 flex-1 overflow-y-auto">
                {currentProfile.redLines.map((line, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-3 shadow-sm group">
                        <span className="text-sm text-gray-700 font-medium">{line}</span>
                        <DeleteOutlined 
                            className="text-gray-400 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteRedLine(index)}
                        />
                    </div>
                ))}
            </div>

            <Input
                placeholder="+ 输入添加新标签"
                value={newRedLine}
                onChange={(e) => setNewRedLine(e.target.value)}
                onPressEnter={handleAddRedLine}
                suffix={
                    <PlusOutlined 
                        className="text-gray-400 hover:text-blue-600 cursor-pointer" 
                        onClick={handleAddRedLine}
                    />
                }
                className="rounded-lg border-gray-300 mt-auto"
            />
        </div>
      </div>

      {/* AI Adjustment Confirmation Modal */}
      <Modal
        title={
            <div className="flex items-center gap-2 text-blue-600">
                <RobotOutlined /> AI 智能调整确认
            </div>
        }
        open={isModalOpen}
        onOk={confirmAiAdjustment}
        onCancel={() => setIsModalOpen(false)}
        okText="确认调整"
        cancelText="取消"
        centered
      >
        <p className="py-4 text-gray-600">
            AI 将根据当前市场数据和岗位胜任力模型，自动优化各项指标的权重分布。<br/><br/>
            <span className="font-bold text-gray-800">预计调整方向：</span><br/>
            - 提高 {currentProfile.indicators.reduce((prev, current) => (prev.value < current.value) ? current : prev).name} 权重<br/>
            - 微调其他辅助指标
            <br/><br/>
            是否继续？
        </p>
      </Modal>
    </div>
  );
};

export default JobProfilePage;
