import React, { useState, useEffect } from 'react';
import {
  Button,
  Slider,
  InputNumber,
  Input,
  Modal,
  message,
  Typography,
  AutoComplete,
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

import {
  saveJobProfile,
  getJobProfiles,
  type JobProfileData,
} from '@/apis/HR/Job';

const { Title, Paragraph } = Typography;

// 适配器类型
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

const JobProfilePage: React.FC = () => {
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<JobProfile | null>(null);
  const [jobList, setJobList] = useState<JobProfile[]>([]);
  
  const [newRedLine, setNewRedLine] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 交互状态
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [isIndicatorModalOpen, setIsIndicatorModalOpen] = useState(false);
  const [newIndicatorName, setNewIndicatorName] = useState('');
  const [newIndicatorCategory, setNewIndicatorCategory] = useState('');

  // 获取数据
  const fetchData = async (targetId?: string) => {
      try {
          const res: any = await getJobProfiles();
          if (res.code === 200 || res.code === 0) {
              const list = res.data?.list || [];
              const mappedList: JobProfile[] = list.map((item: JobProfileData) => ({
                  id: item.job_profile_id || '',
                  name: item.job_title || '未命名岗位',
                  indicators: (item.competencies || []).map((comp, index) => ({
                      id: `comp-${index}`,
                      name: comp.name,
                      value: comp.weight,
                      category: comp.type,
                  })),
                  redLines: item.red_line_condition || [],
                  aiSuggestion: item.ai_adjustment_suggestion || '',
              }));
              
              setJobList(mappedList);
              
              const idToUse = targetId || activeJobId;
              
              if (mappedList.length > 0 && !idToUse) {
                  setActiveJobId(mappedList[0].id);
                  setCurrentProfile(mappedList[0]);
              } else if (idToUse) {
                  const current = mappedList.find(j => j.id === idToUse);
                  if (current) {
                      setActiveJobId(current.id);
                      setCurrentProfile(current);
                  } else {
                      // 如果当前选中的 ID 在列表中找不到（可能是 temp ID），尝试按名称匹配
                      // 或者默认选中第一个
                      if (currentProfile && idToUse.startsWith('temp-')) {
                           const matchByName = mappedList.find(j => j.name === currentProfile.name);
                           if (matchByName) {
                               setActiveJobId(matchByName.id);
                               setCurrentProfile(matchByName);
                               return;
                           }
                      }
                      
                      if (mappedList.length > 0) {
                           setActiveJobId(mappedList[0].id);
                           setCurrentProfile(mappedList[0]);
                      } else {
                           setActiveJobId('');
                           setCurrentProfile(null);
                      }
                  }
              }
          }
      } catch (error) {
          console.error('Fetch job profiles failed', error);
          message.error('获取岗位画像失败');
      }
  };

  useEffect(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 处理岗位切换
  const handleJobChange = (jobId: string) => {
      setActiveJobId(jobId);
      const profile = jobList.find(j => j.id === jobId);
      if (profile) setCurrentProfile(profile);
  };

  // 处理保存（创建/更新）
  const handleSaveProfile = async () => {
      if (!currentProfile) return;
      
      // 如果是新建且没有指标，则发送空数组，由后端自动填充
      // 如果已有指标，则正常发送
      const competencies = currentProfile.indicators.length > 0 
          ? currentProfile.indicators.map(ind => ({
              name: ind.name,
              type: ind.category,
              weight: ind.value
          })) 
          : [];

      const payload: JobProfileData = {
          job_profile_id: currentProfile.id.startsWith('temp-') ? undefined : currentProfile.id,
          job_title: currentProfile.name,
          competencies: competencies,
          red_line_condition: currentProfile.redLines,
          ai_adjustment_suggestion: currentProfile.aiSuggestion
      };

      try {
          const res: any = await saveJobProfile(payload);
          if (res.code === 200 || res.code === 0) {
              message.success('保存成功，画像已更新');
              // 如果是新建（temp ID），需要更新 activeJobId 为后端返回的 ID
              const savedId = res.data?.job_profile_id;
              if (currentProfile.id.startsWith('temp-') && savedId) {
                  // 传递新 ID 给 fetchData
                  fetchData(savedId);
              } else {
                  // 如果是更新，也重新获取一下，以获取后端可能更新的字段（如自动生成的指标）
                  fetchData(currentProfile.id);
              }
          } else {
              message.error(res.message || '保存失败');
          }
      } catch (error) {
          console.error('Save job profile failed', error);
          message.error('保存请求失败');
      }
  };

  const handleAddJob = () => {
      if (!newJobTitle.trim()) {
          message.warning('请输入岗位名称');
          return;
      }

      // 检查岗位名称是否重复
      if (jobList.some(job => job.name === newJobTitle.trim())) {
          message.error('岗位名称已存在，请使用其他名称');
          return;
      }
      
      const newJob: JobProfile = {
          id: `temp-${Date.now()}`, // 临时 ID
          name: newJobTitle.trim(),
          indicators: [], // 后端会自动填充
          redLines: [],
          aiSuggestion: '暂无 AI 建议',
      };
      
      setJobList(prev => [...prev, newJob]);
      setActiveJobId(newJob.id);
      setCurrentProfile(newJob);
      setIsJobModalOpen(false);
      setNewJobTitle('');
      message.success('新岗位已创建，点击保存以自动生成画像');
  };

  const handleDeleteJob = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除岗位',
      content: '删除后无法恢复，确定要继续吗？',
      okType: 'danger',
      onOk: () => {
        // 由于没有删除接口，暂时仅在本地移除
        const newList = jobList.filter(j => j.id !== id);
        setJobList(newList);
        
        if (activeJobId === id) {
             if (newList.length > 0) {
                 setActiveJobId(newList[0].id);
                 setCurrentProfile(newList[0]);
             } else {
                 setActiveJobId('');
                 setCurrentProfile(null);
             }
        }
        message.success('岗位已删除 (仅本地，需接入API)');
      },
    });
  };

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
    Modal.confirm({
      title: '删除红线条件',
      content: '确定要删除这条红线规则吗？',
      okType: 'danger',
      onOk: () => {
        const newLines = [...currentProfile.redLines];
        newLines.splice(index, 1);
        setCurrentProfile({
          ...currentProfile,
          redLines: newLines,
        });
        message.success('已删除');
      },
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
    setNewIndicatorName('');
    setNewIndicatorCategory('自定义');
    setIsIndicatorModalOpen(true);
  };

  const confirmAddIndicator = () => {
    if (!currentProfile || !newIndicatorName.trim()) {
      message.error('请输入指标名称');
      return;
    }
    const newId = `custom-${Date.now()}`;
    setCurrentProfile({
      ...currentProfile,
      indicators: [
        ...currentProfile.indicators,
        {
          id: newId,
          name: newIndicatorName,
          value: 50,
          category: newIndicatorCategory || '自定义',
          isCustom: true,
        },
      ],
    });
    setIsIndicatorModalOpen(false);
    message.success('指标已添加');
  };

  const handleDeleteIndicator = (id: string) => {
    if (!currentProfile) return;
    Modal.confirm({
      title: '删除指标',
      content: '确定要删除该指标吗？',
      okType: 'danger',
      onOk: () => {
        setCurrentProfile({
          ...currentProfile,
          indicators: currentProfile.indicators.filter((ind) => ind.id !== id),
        });
        message.success('指标已删除');
      },
    });
  };

  // 计算用于建议的唯一类别
  const uniqueCategories = Array.from(new Set(
    jobList.flatMap(job => job.indicators.map(i => i.category))
  )).map(cat => ({ value: cat }));

  return (
    <div className="flex h-full w-full gap-2 p-2 overflow-hidden bg-gray-50/50">
      {/* Left: Job Selector Sidebar - Compact Mode */}
      <div className="flex w-48 flex-col rounded-xl border border-gray-200 bg-white shadow-sm h-full flex-shrink-0">
        <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-700">岗位列表</span>
            <Button 
                type="text" 
                icon={<PlusOutlined />} 
                size="small" 
                className="text-blue-600 hover:bg-blue-50 h-6 w-6" 
                onClick={() => setIsJobModalOpen(true)}
            />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 p-2 custom-scrollbar">
          {jobList.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobChange(job.id)}
              className={`cursor-pointer rounded-lg px-3 py-2 transition-all group ${
                activeJobId === job.id
                  ? 'bg-blue-50 border-blue-200 shadow-sm border'
                  : 'bg-transparent border border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium truncate ${activeJobId === job.id ? 'text-blue-700' : 'text-gray-700'}`}>
                    {job.name}
                </span>
                <div className="flex items-center gap-1">
                    {activeJobId === job.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
                    <DeleteOutlined 
                        className={`text-[10px] cursor-pointer hover:text-red-500 transition-colors ${activeJobId === job.id ? 'text-blue-300' : 'text-gray-300 opacity-0 group-hover:opacity-100'}`}
                        onClick={(e) => handleDeleteJob(e, job.id)}
                    />
                </div>
              </div>
              <div className={`text-[10px] mt-0.5 truncate ${activeJobId === job.id ? 'text-blue-400' : 'text-gray-400'}`}>
                {job.indicators.length} 指标
              </div>
            </div>
          ))}
          {/* Mock placeholders - Simplified */}
          <div
              className="rounded-lg border border-dashed border-gray-200 py-2 text-center text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition-colors mt-2"
              onClick={() => setIsJobModalOpen(true)}
            >
              <span className="text-xs">+ 新岗位</span>
            </div>
        </div>
      </div>

      <div className="flex flex-1 gap-2 overflow-hidden min-w-0">
        {/* Left: Main Configuration (Indicators) */}
        {currentProfile ? (
            <>
        <div className="flex flex-[1.4] flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm overflow-hidden min-w-[320px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-col gap-1 overflow-hidden mr-4">
                <Title level={4} className="!mb-0 text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis">
                {currentProfile.name}
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
                <Button icon={<SaveOutlined />} type="primary" size="small" className="bg-blue-600 shadow-md shadow-blue-200 text-xs" onClick={handleSaveProfile}>
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
        <div className="flex flex-1 flex-col gap-2 min-w-[200px]">
          {/* Radar Chart */}
          <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col">
            <div className="mb-2 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
              <span className="font-bold text-gray-800 text-sm">人才画像可视化</span>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={currentProfile.indicators.map((ind) => ({
                    subject: ind.name,
                    A: ind.value,
                    fullMark: 100,
                }))}>
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between border-l-4 border-blue-600 pl-3">
              <span className="font-bold text-gray-800 text-sm">智能建模调整建议</span>
              <Button 
                type="primary" 
                size="small" 
                icon={<RobotOutlined />}
                className="bg-blue-600 shadow-sm text-xs"
                onClick={handleAiAdjustment}
              >
                AI 调整
              </Button>
            </div>
            <Paragraph className="text-xs text-gray-600 leading-relaxed mb-0 text-justify">
                {currentProfile.aiSuggestion}
            </Paragraph>
          </div>
        </div>

        {/* Right: Red Lines */}
        <div className="flex w-[260px] flex-shrink-0 flex-col rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm border-dashed border-2">
            <div className="mb-3 flex items-center gap-2 border-l-4 border-red-500 pl-3">
              <span className="font-bold text-red-900 text-sm">筛选红线条件</span>
              <span className="text-[10px] text-red-500 font-normal bg-red-100 px-1.5 py-0.5 rounded-full">自动淘汰</span>
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
        </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                请选择或创建一个岗位
            </div>
        )}
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
            - 提高 <span className="font-bold">{currentProfile?.indicators && currentProfile.indicators.length > 0 
                ? currentProfile.indicators.reduce((prev, current) => (prev.value < current.value) ? current : prev).name 
                : '核心能力'}</span> 权重<br/>
            - 微调其他辅助指标
            <br/><br/>
            是否继续？
        </p>
      </Modal>
      {/* Add Job Modal */}
      <Modal
        title="添加新岗位"
        open={isJobModalOpen}
        onOk={handleAddJob}
        onCancel={() => setIsJobModalOpen(false)}
        okText="创建"
        cancelText="取消"
        centered
      >
        <div className="py-4">
            <div className="mb-2 text-sm text-gray-600">岗位名称</div>
            <Input 
                placeholder="例如：高级Java工程师" 
                value={newJobTitle} 
                onChange={e => setNewJobTitle(e.target.value)} 
                onPressEnter={handleAddJob}
            />
        </div>
      </Modal>

      {/* Add Indicator Modal */}
      <Modal
        title="添加自定义指标"
        open={isIndicatorModalOpen}
        onOk={confirmAddIndicator}
        onCancel={() => setIsIndicatorModalOpen(false)}
        okText="添加"
        cancelText="取消"
        centered
      >
        <div className="py-4 space-y-4">
            <div>
                <div className="mb-2 text-sm text-gray-600">指标名称</div>
                <Input 
                    placeholder="例如：领导力" 
                    value={newIndicatorName} 
                    onChange={e => setNewIndicatorName(e.target.value)} 
                />
            </div>
            <div>
                <div className="mb-2 text-sm text-gray-600">所属类别 (可选)</div>
                <AutoComplete
                    placeholder="例如：软技能"
                    value={newIndicatorCategory}
                    onChange={setNewIndicatorCategory}
                    options={uniqueCategories}
                    allowClear
                    filterOption={(inputValue, option) =>
                        option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                />
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobProfilePage;
