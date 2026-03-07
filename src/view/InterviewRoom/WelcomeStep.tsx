import React from 'react';
import { Button, message, Input, Tooltip, Typography } from 'antd';
import { CopyOutlined, FileTextOutlined, VideoCameraOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface WelcomeStepProps {
  interviewInfo: any;
  onStart: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ interviewInfo, onStart }) => {
  // 检查当前用户是否为 HR（演示时通过 token 简单检查）
  const isHR = window.location.search.includes('hr-token');
  const currentUrl = window.location.href;

  const handleStart = () => {
    onStart();
  };

  const handleCopyLink = () => {
    const url = new URL(currentUrl);
    const talentId = interviewInfo.talentId || '1';
    url.searchParams.set('token', `seeker-token-${talentId}`);
    
    navigator.clipboard.writeText(url.toString());
    message.success('面试链接已复制，请发送给候选人');
  };

  const seekerLink = React.useMemo(() => {
      const url = new URL(currentUrl);
      const talentId = interviewInfo.talentId || '1';
      url.searchParams.set('token', `seeker-token-${talentId}`);
      return url.toString();
  }, [currentUrl, interviewInfo.talentId]);

  const handleOpenInterviewPage = () => {
      window.open(seekerLink, '_blank');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-12 shadow-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <VideoCameraOutlined className="text-4xl text-blue-600" />
          </div>
        </div>
        
        <Title level={2} className="mb-2 text-gray-800">
          欢迎进入面试间
        </Title>
        <Text className="mb-8 block text-lg text-gray-500">
          {interviewInfo.position} - {interviewInfo.candidateName}
        </Text>

        <div className="mb-10 grid grid-cols-3 gap-6 text-left">
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-1 text-xs text-gray-400">面试官</div>
            <div className="font-medium text-gray-800">{interviewInfo.interviewer}</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-1 text-xs text-gray-400">公司</div>
            <div className="font-medium text-gray-800">{interviewInfo.company}</div>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-1 text-xs text-gray-400">预计时长</div>
            <div className="font-medium text-gray-800">45 分钟</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button 
            type="primary" 
            size="large" 
            className="h-12 px-12 text-lg rounded-full shadow-lg shadow-blue-200"
            onClick={handleStart}
          >
            开始面试
          </Button>
          
          <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
            <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                摄像头就绪
            </span>
            <span className="mx-2">|</span>
            <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                麦克风就绪
            </span>
          </div>

            {/* 仅在 HR 端显示链接分享 */}
            {isHR && (
                <div className="mt-8 w-full border-t border-gray-100 pt-6">
                <Text type="secondary" className="mb-3 block text-sm">分享面试链接给候选人</Text>
                <div className="flex gap-2">
                    <Input 
                        readOnly 
                        value={seekerLink} 
                        className="bg-white text-gray-500"
                    />
                    <Tooltip title="复制链接">
                        <Button type="primary" icon={<CopyOutlined />} onClick={handleCopyLink}>复制</Button>
                    </Tooltip>
                </div>
                 <div className="mt-3">
                    <Button type="link" icon={<FileTextOutlined />} onClick={handleOpenInterviewPage}>
                        以求职者视角打开（测试用）
                    </Button>
                 </div>
                </div>
            )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>系统已自动检测您的设备状态</p>
        <p>© 2023 HireSphere Intelligent Interview System</p>
      </div>
    </div>
  );
};

export default WelcomeStep;
