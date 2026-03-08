import React, { useState } from 'react';
import { Button, Tag, message, Avatar } from 'antd';
import { wsService } from '@/utils/websocket';
import InterviewContextPanel from '../HR/Interview/InterviewContextPanel';
import { addMessageTag, getAiSuggestion } from '@/apis/HR/Interview';
import { RobotOutlined, CheckCircleOutlined, WarningOutlined, BulbOutlined, UserOutlined } from '@ant-design/icons';

interface ChatRoomProps {
  interviewInfo: any;
  role: 'hr' | 'seeker';
  onEndInterview: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ interviewInfo, role, onEndInterview }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isHR = role === 'hr';
  const [aiSuggestion, setAiSuggestion] = useState<string>('如何处理高并发下的 Redis 缓存雪崩与穿透问题？');

  React.useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${interviewInfo.roomId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [interviewInfo.roomId]);

  React.useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem(`chat_history_${interviewInfo.roomId}`, JSON.stringify(messages));
    }
  }, [messages, interviewInfo.roomId]);

  React.useEffect(() => {
    // 优先使用 interviewInfo 中的 token，它是经过 validateInterview 校验过的有效 token
    const token = interviewInfo.token;
    
    if (token) {
      wsService.connect(token, interviewInfo.roomId, role);
    } else {
        message.error('无法连接聊天服务：缺少 Token');
    }

    const unsubscribeMsg = wsService.onMessage((msg) => {
      setMessages((prev) => {
        if (msg.id === 'welcome-msg' && prev.some(m => m.id === 'welcome-msg')) {
            return prev;
        }
        
        const isMyRole = (isHR && msg.role === 'HR') || (!isHR && msg.role === 'Seeker');
        
        if (isMyRole) {
            return prev;
        }

        return [...prev, msg];
      });
    });

    const unsubscribeStatus = wsService.onStatusChange((s) => {
      setStatus(s);
    });

    // 清理旧消息监听，防止重复
    return () => {
      unsubscribeMsg();
      unsubscribeStatus();
      // 这里不主动关闭连接，因为 InterviewRoom 卸载时会触发，但如果在 WelcomeStep 和 ChatRoom 切换时可能会导致断连
      // 现在的架构是 ChatRoom 只负责显示，连接管理在 websocket.ts 中单例维护，所以这里不需要 close
      // wsService.close(); 
    };
  }, []); 

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = text || inputValue;
    if (!content.trim()) return;

    const senderName = isHR ? interviewInfo.interviewer : '我';
    const senderRole = isHR ? 'HR' : 'Seeker';

    const newMsg = {
      id: Date.now().toString(),
      sender: 'me', 
      name: senderName,
      role: senderRole,
      content: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };

    setMessages((prev) => [...prev, newMsg]);
    wsService.send(content, interviewInfo.roomId, role);
    if (!text) setInputValue('');
    
    if (isHR) { 
        const context = [...messages, newMsg].slice(-5).map(m => `${m.name}: ${m.content}`).join('\n');
        
        setTimeout(async () => {
            try {
                const res: any = await getAiSuggestion({
                    room_id: interviewInfo.roomId || '', 
                    context: context
                });
                if (res.code === 200 || res.code === 0) {
                    setAiSuggestion(res.data.text);
                }
            } catch (error) {
                console.error('Failed to get AI suggestion', error);
            }
        }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleAiRefine = () => {
      if (!inputValue.trim()) return;
      const refined = `(AI 优化后) ${inputValue}`;
      setInputValue(refined);
      message.success('AI 已优化您的问题表达');
  };

  const handleMarking = async (type: string, label: string) => {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;

      try {
          const res: any = await addMessageTag({
              message_id: lastMessage.id,
              room_id: interviewInfo.roomId || '',
              tag: label
          });
          
          if (res.code === 200 || res.code === 0) {
              message.success(`已标记候选人表现：${label}`);
          } else {
              message.error('标记失败');
          }
      } catch (error) {
          console.error('Tagging failed', error);
          message.error('标记请求失败');
      }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 p-4">
      <div className="flex h-[90vh] w-full max-w-[1600px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        
        <div className="flex flex-1 flex-col min-w-0 relative">
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 shadow-sm z-10 shrink-0">
            <div>
              <div className="text-lg font-bold text-gray-800">
                {interviewInfo.position} - {interviewInfo.candidateName}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <div className={`flex items-center gap-1.5 ${status === 'connected' ? 'text-green-600' : 'text-orange-500'}`}>
                  <span className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-orange-500'} ring-2 ring-current ring-opacity-20`} />
                  {status === 'connected' ? '连接正常' : '连接中...'}
                </div>
                <span className="text-gray-300">|</span>
                <span>面试官: {interviewInfo.interviewer}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button danger onClick={onEndInterview} className="rounded-lg px-6">结束面试</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6 space-y-6 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full gap-4 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar 
                    size={40} 
                    className={`${msg.sender === 'me' ? 'bg-blue-600' : 'bg-orange-500'} flex-shrink-0 shadow-sm`}
                    icon={<UserOutlined />}
                >
                    {msg.name[0]}
                </Avatar>
                
                <div className={`flex max-w-[70%] flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700">{msg.name}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                    {msg.role && (
                        <Tag bordered={false} className="mr-0 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0">
                            {msg.role}
                        </Tag>
                    )}
                  </div>
                  
                  <div
                    className={`relative rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm
                      ${msg.sender === 'me' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                      }`}
                  >
                    {msg.content}
                  </div>

                  {isHR && msg.sender === 'other' && (
                      <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tag.CheckableTag checked={false} onChange={() => handleMarking('highlight', '亮点')} className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                              <CheckCircleOutlined /> 亮点
                          </Tag.CheckableTag>
                          <Tag.CheckableTag checked={false} onChange={() => handleMarking('risk', '风险')} className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                              <WarningOutlined /> 风险
                          </Tag.CheckableTag>
                      </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isHR && (
              <div className="bg-blue-50/50 border-b border-blue-100 px-4 py-2 flex items-center justify-between shrink-0 backdrop-blur-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                      <RobotOutlined className="text-blue-600 flex-shrink-0" />
                      <span className="text-xs font-bold text-blue-800 flex-shrink-0">AI 助理建议:</span>
                      <span className="text-xs text-blue-700 truncate cursor-pointer hover:underline" onClick={() => setInputValue(aiSuggestion)}>
                          "{aiSuggestion}"
                      </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                      <Button 
                          size="small" 
                          type="text" 
                          icon={<BulbOutlined />} 
                          className="text-blue-600 hover:bg-blue-100"
                          onClick={() => setInputValue(aiSuggestion)}
                      >
                          采用
                      </Button>
                  </div>
              </div>
          )}

          <div className="border-t border-gray-100 bg-white p-4 shrink-0">
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息..."
                className="h-12 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <Button 
                type="primary" 
                size="large" 
                onClick={() => handleSend()}
                className="h-12 w-24 rounded-xl shadow-md shadow-blue-200 font-semibold"
              >
                发送
              </Button>
            </div>
            <div className="mt-2 flex justify-between px-1">
                <div className="text-xs text-gray-400">
                    按 Enter 发送
                </div>
                {isHR && (
                    <div className="flex gap-2">
                        <Button type="link" size="small" icon={<RobotOutlined />} onClick={handleAiRefine} className="text-xs text-purple-600 p-0 h-auto">
                            AI 润色
                        </Button>
                    </div>
                )}
            </div>
          </div>
        </div>

        {isHR && (
            <div className="w-[450px] border-l border-gray-100 bg-white flex flex-col shrink-0 relative z-20 shadow-[-4px_0_16px_rgba(0,0,0,0.02)]">
                <div className="h-full w-full overflow-hidden">
                    <InterviewContextPanel talentId={interviewInfo.talentId} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
