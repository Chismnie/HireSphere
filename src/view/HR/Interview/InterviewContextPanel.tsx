import React, { useState, useEffect } from 'react';
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
import PdfPreview from '@/components/ResumeUpload/PdfPreview';
import { getResumeUrl } from '@/apis/HR/Resume';

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

interface InterviewContextPanelProps {
  talentId?: string;
}

const InterviewContextPanel: React.FC<InterviewContextPanelProps> = ({ talentId }) => {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (talentId) {
      setLoading(true);
      getResumeUrl(talentId).then((res: any) => {
        if (res.code === 200 || res.code === 0) {
          setResumeUrl(res.data.resume_url);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [talentId]);

  const ResumeTab = () => (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-300 bg-gray-50/50">
      {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="mb-4 rounded-full bg-white p-6 shadow-sm border border-gray-300 animate-pulse">
               <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <Text type="secondary" className="text-gray-400">正在加载简历...</Text>
          </div>
      ) : resumeUrl ? (
        <div className="flex-1 overflow-hidden relative bg-white">
             {/* 检查文件扩展名，决定渲染方式 */}
             {resumeUrl.toLowerCase().includes('.pdf') ? (
                 <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                    <PdfPreview file={resumeUrl} />
                 </div>
             ) : (
                 <div className="absolute inset-0 overflow-y-auto custom-scrollbar flex items-start justify-center p-4">
                     <img src={resumeUrl} alt="Resume" className="max-w-full shadow-md rounded" />
                 </div>
             )}
        </div>
      ) : (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="mb-4 rounded-full bg-white p-8 shadow-sm border border-gray-300">
          <FileTextOutlined className="text-4xl text-blue-200" />
        </div>
        <Text type="secondary" className="text-gray-400">
          暂无简历预览
        </Text>
      </div>
      )}
    </div>
  );

  const AIInsightTab = () => (
    <div className="h-full space-y-6 overflow-y-auto p-1 pr-2 pb-10 custom-scrollbar">
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

  return (
    <div className="flex h-full flex-col bg-white p-4 overflow-hidden">
      <Tabs
        defaultActiveKey="1"
        className="h-full flex flex-col full-height-tabs"
        items={[
          {
            key: '1',
            label: (
              <span className="flex items-center gap-2 px-1">
                <FileTextOutlined />
                应聘简历
              </span>
            ),
            children: <div className="h-full overflow-hidden"><ResumeTab /></div>,
          },
          {
            key: '2',
            label: (
              <span className="flex items-center gap-2 px-1">
                <BulbOutlined />
                AI 洞察
              </span>
            ),
            children: <div className="h-full overflow-hidden flex flex-col"><AIInsightTab /></div>,
          },
        ]}
        // 确保 Tab 内容区域占满剩余高度
        renderTabBar={(props, DefaultTabBar) => (
            <div className="mb-2 flex-shrink-0">
                <DefaultTabBar {...props} />
            </div>
        )}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default InterviewContextPanel;
