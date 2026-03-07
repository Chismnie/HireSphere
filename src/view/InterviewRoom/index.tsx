import React, { useState, useEffect } from 'react';
import { Spin, Result } from 'antd';
import { validateInterview, InterviewInfo } from '@/apis/HR/Interview';
import WelcomeStep from './WelcomeStep';
import ChatRoom from './ChatRoom';
import EndStep from './EndStep';

const InterviewRoom: React.FC = () => {
  const [step, setStep] = useState<'loading' | 'welcome' | 'chat' | 'end' | 'error'>('loading');
  const [interviewInfo, setInterviewInfo] = useState<InterviewInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // 从 URL 获取房间 ID 和 Token
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('roomId');
        const token = params.get('token');

        if (!roomId || !token) {
          throw new Error('无效的面试链接');
        }

        // 验证面试信息
        const info = await validateInterview(roomId, token);
        setInterviewInfo({
            ...info,
            roomId, // Ensure roomId and token are passed down
            token
        });
        setStep('welcome');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || '无法进入面试间');
        setStep('error');
      }
    };

    init();
  }, []);

  if (step === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Spin size="large" tip="正在进入面试间..." />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Result
          status="403"
          title="无法进入面试"
          subTitle={errorMsg}
        />
      </div>
    );
  }

  if (step === 'welcome' && interviewInfo) {
    return (
      <WelcomeStep 
        interviewInfo={interviewInfo} 
        onStart={() => setStep('chat')} 
      />
    );
  }

  if (step === 'chat' && interviewInfo) {
    return (
      <ChatRoom 
        interviewInfo={interviewInfo} 
        onEndInterview={() => setStep('end')} 
      />
    );
  }

  if (step === 'end' && interviewInfo) {
    return <EndStep interviewInfo={interviewInfo} />;
  }

  return null;
};

export default InterviewRoom;
