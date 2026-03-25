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
  const [role, setRole] = useState<'hr' | 'seeker'>('hr');
  const [talentToken, setTalentToken] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const roomIdFromUrl = params.get('roomId');
        const tokenFromUrl = params.get('token');
        
        // 1. 优先从 sessionStorage 恢复状态（单点来源）
        const savedSession = sessionStorage.getItem('interview_session');
        if (savedSession) {
          const { token, interviewId, role: savedRole, interviewInfo: savedInfo } = JSON.parse(savedSession);
          // 如果 URL 没传 roomId 或者匹配，则直接恢复
          if (!roomIdFromUrl || roomIdFromUrl === interviewId) {
            console.log('从 sessionStorage 恢复面试会话，跳过重复校验');
            setRole(savedRole as 'hr' | 'seeker');
            setInterviewInfo(savedInfo);
            setStep('welcome');
            return;
          }
        }

        // 2. 检查 URL 中是否有 token 参数（双入口支持：作为被面试者进入）
        if (tokenFromUrl && roomIdFromUrl) {
          console.log('检测到 URL Token，正在自动校验身份...');
          const info = await validateInterview(roomIdFromUrl, tokenFromUrl);
          const currentRole: 'hr' | 'seeker' = 'seeker'; 

          const fullInfo = {
            ...info,
            roomId: roomIdFromUrl,
            token: tokenFromUrl
          };

          // 统一存储到 sessionStorage
          sessionStorage.setItem('interview_session', JSON.stringify({
            token: tokenFromUrl,
            interviewId: roomIdFromUrl,
            role: currentRole,
            interviewInfo: fullInfo
          }));

          // URL 自动清理
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          window.history.replaceState({}, '', newUrl.toString());

          setRole(currentRole);
          setInterviewInfo(fullInfo);
          setStep('welcome');
          return;
        }

        // 3. 走原有逻辑：HR 从本地存储获取 Token
        const localToken = localStorage.getItem('token');
        if (roomIdFromUrl && localToken) {
          console.log('尝试以 HR 身份进入面试间');
          const info = await validateInterview(roomIdFromUrl, localToken);
          const currentRole: 'hr' | 'seeker' = 'hr';

          const fullInfo = {
            ...info,
            roomId: roomIdFromUrl,
            token: localToken
          };

          // 同样存入 sessionStorage 以便刷新持久化
          sessionStorage.setItem('interview_session', JSON.stringify({
            token: localToken,
            interviewId: roomIdFromUrl,
            role: currentRole,
            interviewInfo: fullInfo
          }));

          setRole(currentRole);
          setInterviewInfo(fullInfo);
          setStep('welcome');
          return;
        }

        throw new Error('无效的面试链接：缺少必要参数或权限不足');
      } catch (err: any) {
        console.error('面试间初始化失败:', err);
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

  // 渲染逻辑分流
  const commonProps = {
      interviewInfo: interviewInfo!,
      role,
      talentToken
  };

  if (step === 'welcome' && interviewInfo) {
    return (
      <WelcomeStep 
        {...commonProps}
        onStart={() => setStep('chat')} 
      />
    );
  }

  if (step === 'chat' && interviewInfo) {
    return (
      <ChatRoom 
        {...commonProps}
        onEndInterview={() => setStep('end')} 
      />
    );
  }

  if (step === 'end' && interviewInfo) {
    return <EndStep interviewInfo={interviewInfo} role={role} />;
  }

  return null;
};

export default InterviewRoom;
