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
        const roomId = params.get('roomId');
        
        // 尝试获取各种 token
        const urlToken = params.get('token');
        const urlTalentToken = params.get('talentToken');
        const urlTalentId = params.get('talentId'); // 获取 talentId
        const localToken = localStorage.getItem('token');
        
        // 核心逻辑：判断角色
        // 1. 如果 URL 中有 token 且与 talentToken 相等 -> Seeker
        // 2. 如果 URL 中有 token 且包含 'talent' -> Seeker (兼容旧逻辑)
        // 3. 否则默认为 HR (使用 localToken)
        
        let activeToken = '';
        let currentRole: 'hr' | 'seeker' = 'hr';

        if (urlToken) {
            // 如果 urlToken 等于 urlTalentToken，或者是 seeker 格式
            if ((urlTalentToken && urlToken === urlTalentToken) || urlToken.includes('talent')) {
                currentRole = 'seeker';
                activeToken = urlToken;
            } else {
                // URL 中有 token 但不是 seeker，可能是 HR 的 token (虽然不推荐 URL 传 HR token)
                currentRole = 'hr';
                activeToken = urlToken;
            }
        } else if (localToken) {
            // 没有 URL token，使用本地 token -> HR
            currentRole = 'hr';
            activeToken = localToken;
        }

        if (!roomId || !activeToken) {
          throw new Error('无效的面试链接：缺少必要参数');
        }

        // 验证权限 (API 调用)
        const info = await validateInterview(roomId, activeToken);
        
        setRole(currentRole);
        if (urlTalentToken) {
            setTalentToken(urlTalentToken);
        }

        setInterviewInfo({
            ...info,
            roomId,
            token: activeToken,
            talentId: urlTalentId || undefined // 将 talentId 放入 interviewInfo
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
    return <EndStep interviewInfo={interviewInfo} />;
  }

  return null;
};

export default InterviewRoom;
