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
          const { token, interviewId, role: savedRole, interviewInfo: savedInfo, talentToken: savedTalentToken, talentId: savedTalentId } = JSON.parse(savedSession);
          // 如果 URL 没传 roomId 或者匹配，则直接恢复
          if (!roomIdFromUrl || roomIdFromUrl === interviewId) {
            console.log('从 sessionStorage 恢复面试会话，跳过重复校验');
            setRole(savedRole as 'hr' | 'seeker');
            
            // 确保 savedInfo 里面包含 talentId，如果没有，则手动补上
            const fullInfo = {
                ...savedInfo,
                talentId: savedTalentId || savedInfo.talentId
            };
            
            setInterviewInfo(fullInfo);
            if (savedTalentToken) setTalentToken(savedTalentToken);
            setStep('welcome');
            return;
          }
        }

        // 2. 核心逻辑：判断角色并验证权限
        // 情况 A：URL 中有 token -> 视为被面试者/求职者 (Seeker)
        if (tokenFromUrl && roomIdFromUrl) {
          console.log('检测到 URL Token，正在以候选人身份校验...');
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
            interviewInfo: fullInfo,
            talentToken: tokenFromUrl // Seeker 自己的 token 就是 talentToken
          }));

          // URL 自动清理（隐藏敏感 token）
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('talentToken'); // 清理冗余参数
          window.history.replaceState({}, '', newUrl.toString());

          setRole(currentRole);
          setInterviewInfo(fullInfo);
          setTalentToken(tokenFromUrl);
          setStep('welcome');
          return;
        }

        // 情况 B：URL 无 token -> 尝试以 HR 身份（使用本地存储的 Token）进入
        const localToken = localStorage.getItem('token');
        const urlTalentToken = params.get('talentToken');
        const urlTalentId = params.get('talentId');
        
        if (roomIdFromUrl && localToken) {
          console.log('尝试以 HR 身份进入面试间');
          const info = await validateInterview(roomIdFromUrl, localToken);
          const currentRole: 'hr' | 'seeker' = 'hr';

          const fullInfo = {
            ...info,
            roomId: roomIdFromUrl,
            token: localToken,
            talentId: urlTalentId || info.talentId // 优先使用 URL 中的 talentId
          };

          // 存储到 sessionStorage
          sessionStorage.setItem('interview_session', JSON.stringify({
            token: localToken,
            interviewId: roomIdFromUrl,
            role: currentRole,
            interviewInfo: fullInfo,
            talentToken: urlTalentToken,
            talentId: urlTalentId || info.talentId
          }));

          // URL 自动清理
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('talentToken'); 
          newUrl.searchParams.delete('talentId');
          window.history.replaceState({}, '', newUrl.toString());

          setRole(currentRole);
          setInterviewInfo(fullInfo);
          if (urlTalentToken) setTalentToken(urlTalentToken);
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
