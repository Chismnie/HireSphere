import React from 'react';
import { Button, message, Input, Typography, Avatar } from 'antd';
import { 
  VideoCameraOutlined, 
  UserOutlined, 
  CopyOutlined,
  LinkOutlined,
  CheckCircleFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface WelcomeStepProps {
  interviewInfo: any;
  role: 'hr' | 'seeker';
  talentToken?: string;
  onStart: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ interviewInfo, role, talentToken, onStart }) => {
  const isHR = role === 'hr';

  const currentUrl = window.location.href;

  const seekerLink = React.useMemo(() => {
      // 获取当前的 URL 并构建新的求职者链接
      const currentOrigin = window.location.origin + window.location.pathname;
      const params = new URLSearchParams();
      params.set('roomId', interviewInfo.roomId);
      
      if (talentToken) {
        params.set('token', talentToken);
        params.set('talentToken', talentToken); // 冗余一份，方便 Seeker 页面判断
      } else {
        console.warn('缺少 talentToken，生成的求职者链接可能无效');
      }
      
      return `${currentOrigin}?${params.toString()}`;
  }, [interviewInfo, talentToken]);

  const handleCopyLink = () => {
    if (!talentToken) {
      message.error('缺少求职者 Token，无法生成面试链接');
      return;
    }
    navigator.clipboard.writeText(seekerLink);
    message.success('面试链接已复制');
  };

  const handleOpenSeekerPage = () => {
      window.open(seekerLink, '_blank');
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-16 shadow-xl border border-gray-200 relative overflow-hidden">
        
        {/* 顶部装饰背景圆 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* 图标区域 */}
          <div className="mb-8 relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 shadow-inner">
              <VideoCameraOutlined className="text-5xl text-blue-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                 <CheckCircleFilled className="text-xl text-green-500" />
            </div>
          </div>
          
          {/* 标题区域 */}
          <Title level={2} className="mb-2 !text-3xl !font-bold text-gray-800">
            欢迎进入面试间
          </Title>
          <Text className="mb-10 block text-lg text-gray-500 font-medium">
             - {interviewInfo.candidateName || '候选人'} -
          </Text>

          {/* 信息卡片网格 */}
          <div className="mb-12 grid w-full grid-cols-3 gap-6">
            <div className="flex flex-col items-start rounded-2xl border border-gray-200 bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">面试官</div>
              <div className="flex items-center gap-3">
                 <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                 <div className="text-base font-bold text-gray-800 truncate">{interviewInfo.interviewer || '面试官'}</div>
              </div>
            </div>
            
            <div className="flex flex-col items-start rounded-2xl border border-gray-200 bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">公司</div>
              <div className="text-base font-bold text-gray-800 truncate w-full text-left">{interviewInfo.company || 'HireSphere 科技'}</div>
            </div>
            
            <div className="flex flex-col items-start rounded-2xl border border-gray-200 bg-gray-50/50 p-6 transition-all hover:bg-white hover:shadow-md">
              <div className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">预计时长</div>
              <div className="text-base font-bold text-gray-800">45 分钟</div>
            </div>
          </div>

          {/* 核心操作区 */}
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <Button 
              type="primary" 
              size="large" 
              className="h-14 w-full text-lg font-semibold rounded-full shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] transition-all duration-300"
              onClick={onStart}
            >
              开始面试
            </Button>
            
            <div className="flex items-center gap-6 text-gray-400 text-sm font-medium">
              <span className="flex items-center gap-2 transition-colors hover:text-green-600 cursor-default">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  摄像头就绪
              </span>
              <span className="h-3 w-px bg-gray-200"></span>
              <span className="flex items-center gap-2 transition-colors hover:text-green-600 cursor-default">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  麦克风就绪
              </span>
            </div>
          </div>

          {/* 底部链接分享区 (仅 HR 可见) */}
          {isHR && (
          <div className="mt-12 w-full pt-8 border-t border-gray-100">
             <div className="flex flex-col items-center gap-4">
                <Text type="secondary" className="text-sm font-medium">分享面试链接给候选人</Text>
                
                <div className="flex w-full max-w-xl gap-3 items-center">
                    <div className="flex-1 relative group">
                        <Input 
                            readOnly 
                            value={seekerLink} 
                            className="h-11 rounded-xl bg-gray-50 border-gray-200 text-gray-500 text-sm pl-4 pr-10 focus:bg-white transition-all"
                        />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <LinkOutlined className="text-gray-400" />
                         </div>
                    </div>
                    
                    <Button 
                        icon={<CopyOutlined />} 
                        onClick={handleCopyLink}
                        className="h-11 px-6 rounded-xl border-blue-100 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:border-blue-200 font-medium transition-colors"
                    >
                        复制
                    </Button>
                </div>

                <div className="flex justify-center w-full">
                  <Button 
                      type="link" 
                      size="small" 
                      className="text-gray-400 hover:text-blue-600 text-xs flex items-center gap-1 mt-2"
                      onClick={handleOpenSeekerPage}
                  >
                      <LinkOutlined /> 以求职者视角打开 (测试用)
                  </Button>
               </div>
            </div>
          </div>
          )}

        </div>
      </div>
      
      {/* 底部页脚 */}
      <div className="mt-8 text-center text-gray-400 text-xs">
         系统已自动检测您的设备状态 • 请保持网络通畅
      </div>
    </div>
  );
};

export default WelcomeStep;
