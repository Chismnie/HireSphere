import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Avatar, Button } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, UserOutlined, FileTextOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import PdfPreview from '@/components/ResumeUpload/PdfPreview';
import { getTalentReport } from '@/apis/HR/Talent';
import { getResumeUrl } from '@/apis/HR/Resume';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const mockRadarData = [
  { subject: '技术能力', A: 120, fullMark: 150 },
  { subject: '沟通表达', A: 98, fullMark: 150 },
  { subject: '逻辑思维', A: 86, fullMark: 150 },
  { subject: '团队协作', A: 99, fullMark: 150 },
  { subject: '抗压能力', A: 85, fullMark: 150 },
  { subject: '创新意识', A: 65, fullMark: 150 },
];

const TalentReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation();
  const initialTalent = location.state?.talent || {};

  const [report, setReport] = useState<any>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number>(400);
  const resumeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      // 获取人才报告数据
      getTalentReport(id).then((res: any) => {
          if (res.code === 200 || res.code === 0) {
              setReport(res.data);
          }
      }).catch(console.error);

      // 获取简历
      getResumeUrl(id).then((res: any) => {
        if (res.code === 200 || res.code === 0) {
          let url = res.data.resume_url;
          if (import.meta.env.DEV && url.includes('myqcloud.com')) {
              url = url.replace(/https?:\/\/[^/]+/, '/cos-proxy');
          }
          setResumeUrl(url);
        }
      }).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    const updateWidth = () => {
        if (resumeContainerRef.current) {
            setPdfWidth(resumeContainerRef.current.clientWidth);
        }
    };
    
    // Initial update
    updateWidth();

    // Resize observer for more robust handling
    const observer = new ResizeObserver(updateWidth);
    if (resumeContainerRef.current) {
        observer.observe(resumeContainerRef.current);
    }

    window.addEventListener('resize', updateWidth);
    
    return () => {
        window.removeEventListener('resize', updateWidth);
        observer.disconnect();
    };
  }, [resumeUrl]); // Re-run when resumeUrl changes to ensure container is rendered

  // Merge report data with initial data from navigation state
  // Try to recover chat history from localStorage if backend records are empty
  const localChatHistory = id ? localStorage.getItem(`chat_history_talent_${id}`) : null;
  const parsedChatHistory = localChatHistory ? JSON.parse(localChatHistory) : [];
  
  // Transform chat history to interview records format if needed
  const localRecords = parsedChatHistory.filter((msg: any) => msg.role === 'HR' || msg.role === 'Seeker').map((msg: any, index: number) => {
      // Simplistic grouping: Assume Q & A pairs or just list them. 
      // Better approach: Since it's a chat log, we might need a different UI or map it to Q&A.
      // For now, let's just map individual messages or try to group them.
      // Actually, the UI expects { question, answer, ai_analysis }. 
      // If we only have raw chat, we might just show them as a list, or try to reconstruct.
      // Let's assume the chat history is linear. We can display them differently or adapt the UI.
      // Given the current UI is Q&A based, let's try to mock Q&A pairs from the chat if possible, 
      // or just list the user's answers if we can't identify questions easily.
      // A simple fallback: Treat HR messages as Questions and Seeker messages as Answers.
      return null;
  }).filter(Boolean);

  // Better Strategy: Just use the raw chat messages and adapt the UI if `interview_records` is empty but `localChatHistory` exists.
  // But to stick to the current UI structure (Q&A), let's try to pair them up.
  const reconstructedRecords: any[] = [];
  let currentQ = '';
  
  parsedChatHistory.forEach((msg: any) => {
      if (msg.role === 'HR') {
          currentQ = msg.content;
      } else if (msg.role === 'Seeker' && currentQ) {
          reconstructedRecords.push({
              question: currentQ,
              answer: msg.content,
              ai_analysis: '' // No analysis for local history
          });
          currentQ = ''; // Reset after pairing
      }
  });

  const mergedReport = {
      full_name: report?.full_name || initialTalent.name || '候选人',
      target_position: report?.target_position || initialTalent.position || 'N/A',
      hire_status: report?.hire_status || initialTalent.status || '面试完成',
      interview_time: report?.interview_time || initialTalent.interviewTime,
      // Handle tags: report.core_advantages might be string or array
      core_advantages: report?.core_advantages 
          ? (Array.isArray(report.core_advantages) ? report.core_advantages : report.core_advantages.split(/,|，/))
          : (initialTalent.tags || []),
      work_years: report?.work_years || '3', // Default if missing
      education: report?.education || '本科', // Default if missing
      radar_chart: report?.radar_chart || mockRadarData,
      ai_evaluation: report?.ai_evaluation || '正在生成AI评估报告...',
      interview_records: (report?.interview_records && report.interview_records.length > 0) 
          ? report.interview_records 
          : (reconstructedRecords.length > 0 ? reconstructedRecords : []),
      duration: report?.duration || '45min'
  };

  const hasData = report || initialTalent.id;

  if (!hasData) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50">
              <div className="text-gray-400">正在生成人才报告...</div>
          </div>
      );
  }

  const tags = mergedReport.core_advantages;
  const radarData = mergedReport.radar_chart;

  return (
    <Layout className="flex h-screen w-full flex-col bg-cover bg-center" style={{ backgroundImage: "url('/welcome-bg.png')" }}>
        <div className="absolute inset-0 z-0 bg-white/90 backdrop-blur-sm" />
        
        {/* Header */}
        <Header className="relative z-10 flex h-auto items-center justify-between border-b border-gray-300 bg-white/80 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-6">
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined className="text-xl"/>} 
                    onClick={() => navigate('/hr', { state: { activeTab: 'talent' } })}
                    className="hover:bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center"
                />
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-4">
                        <Title level={3} className="!mb-0 !mt-0 text-gray-800">{mergedReport.full_name}</Title>
                        <div className="flex gap-2">
                            <span className="rounded-full border border-gray-300 bg-cyan-50 px-3 py-0.5 text-xs font-medium text-cyan-700">
                                职位 ({mergedReport.target_position})
                            </span>
                            <span className={`rounded-full border border-gray-300 px-3 py-0.5 text-xs font-medium ${
                                mergedReport.hire_status === '已录用' || mergedReport.hire_status === 'accepted' 
                                ? 'bg-lime-50 text-lime-700' 
                                : (mergedReport.hire_status === '已淘汰' || mergedReport.hire_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700')
                            }`}>
                                {mergedReport.hire_status === 'accepted' ? '已录用' : (mergedReport.hire_status === 'rejected' ? '已淘汰' : (mergedReport.hire_status === 'pending' ? '面试完成' : mergedReport.hire_status))}
                            </span>
                            <span className="rounded-full border border-gray-300 bg-purple-50 px-3 py-0.5 text-xs font-medium text-purple-700 hidden">
                                面试时间: {mergedReport.interview_time ? (new Date(mergedReport.interview_time).toString() !== 'Invalid Date' ? new Date(mergedReport.interview_time).toLocaleDateString() : mergedReport.interview_time) : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <Text type="secondary" className="text-xs">
                        核心优势 (eg: {tags.join('/')})
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
                
                {/* Left Column: AI Assessment & Personal Info */}
                <div className="flex w-1/4 flex-col gap-4">
                    {/* Personal Info Card */}
                    <div className="flex flex-col items-center rounded-2xl border border-gray-300 bg-white/80 p-6 shadow-sm backdrop-blur-md">
                        <Avatar 
                            size={100} 
                            icon={<UserOutlined />} 
                            className="mb-4 bg-blue-600 text-white text-4xl border border-gray-300"
                        />
                        <Title level={2} className="!mb-1 text-blue-600">{mergedReport.full_name}</Title>
                        <Text type="secondary" className="mb-4">{mergedReport.work_years}年工作经验 | {mergedReport.education}</Text>
                        <div className="flex flex-col gap-2 items-center w-full">
                            {tags.slice(0, 3).map((tag: string, i: number) => (
                                <span key={i} className="w-full text-center rounded-lg bg-gray-100 py-1 text-xs font-bold text-gray-600"># {tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* AI Assessment Card */}
                    <div className="flex-1 rounded-2xl border border-gray-300 bg-white/80 p-6 shadow-sm backdrop-blur-md flex flex-col">
                        <div className="flex items-center gap-2 mb-4 border-l-4 border-purple-500 pl-3">
                            <Title level={4} className="!mb-0">AI 智能评估</Title>
                        </div>
                        
                        <div className="flex-1 w-full min-h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar name={mergedReport.full_name} dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#a78bfa" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Analysis Text */}
                        <div className="mt-4 space-y-3 overflow-y-auto max-h-[200px] custom-scrollbar">
                            <div className="rounded-xl bg-green-50 p-3 border border-green-100">
                                <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    AI 综合评价
                                </div>
                                <div className="text-xs text-green-800 leading-relaxed text-justify">
                                    {mergedReport.ai_evaluation}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Interview Record */}
                <div className="flex w-2/5 flex-col rounded-2xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-md overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-300 p-4 bg-gray-50/50">
                        <Title level={4} className="!mb-0">面试记录回溯</Title>
                        <div className="text-xs text-gray-500">面试时长: {mergedReport.duration} | 录音已转写完毕</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {mergedReport.interview_records && mergedReport.interview_records.length > 0 ? (
                            mergedReport.interview_records.map((record: any, index: number) => (
                                <div key={index} className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <Avatar className="bg-purple-100 text-purple-600 border border-gray-300 shrink-0">Q{index + 1}</Avatar>
                                        <div className="rounded-2xl rounded-tl-none border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800 shadow-sm w-full">
                                            <span className="font-bold">{record.question}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pl-12">
                                        <div className="relative rounded-2xl border-l-4 border-l-gray-300 border-t border-r border-b border-gray-200 bg-white p-6 text-sm text-gray-600 italic shadow-sm w-full">
                                            <span className="text-4xl text-gray-200 absolute top-2 left-2">“</span>
                                            {record.answer}
                                            <span className="text-4xl text-gray-200 absolute bottom-[-10px] right-4">”</span>
                                        </div>
                                    </div>
                                    
                                    {/* AI Analysis Box */}
                                    {record.ai_analysis && (
                                        <div className="ml-12 mt-2 rounded-xl border border-purple-200 bg-purple-50 p-4">
                                            <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold">
                                                <BulbOutlined /> AI 解析:
                                            </div>
                                            <div className="text-sm text-purple-900 mb-0 text-justify">
                                                {record.ai_analysis}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                {report ? '暂无面试记录' : '加载中...'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Resume Preview */}
                <div className="flex w-1/3 flex-col rounded-2xl border border-gray-300 bg-white/80 shadow-sm backdrop-blur-md overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-gray-300 p-4 bg-gray-50/50">
                        <FileTextOutlined />
                        <Title level={4} className="!mb-0">简历原文</Title>
                    </div>
                    <div ref={resumeContainerRef} className="flex-1 overflow-hidden bg-white relative">
                        {resumeUrl ? (
                             <PdfPreview file={resumeUrl} width={pdfWidth} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                {report ? '暂无简历预览' : '加载中...'}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Content>
    </Layout>
  );
};

export default TalentReportPage;
