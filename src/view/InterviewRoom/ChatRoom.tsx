import React, { useState } from 'react';
import { Button, Tag, message, Avatar } from 'antd';
import { wsService } from '@/utils/websocket';
import InterviewContextPanel from '../HR/Interview/InterviewContextPanel';
import { addMessageTag, getAiSuggestion } from '@/apis/HR/Interview';
import { RobotOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, BulbOutlined, UserOutlined } from '@ant-design/icons';

interface ChatRoomProps {
  interviewInfo: any;
  onEndInterview: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ interviewInfo, onEndInterview }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const isHR = window.location.search.includes('hr-token');
  const [aiSuggestion, setAiSuggestion] = useState<string>('如何处理高并发下的 Redis 缓存雪崩与穿透问题？');

  // 从本地存储加载历史记录
  React.useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${interviewInfo.roomId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [interviewInfo.roomId]);

  // 将历史记录保存到本地存储
  React.useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem(`chat_history_${interviewInfo.roomId}`, JSON.stringify(messages));
    }
  }, [messages, interviewInfo.roomId]);

  // 连接 WebSocket
  React.useEffect(() => {
    // Prefer token from interviewInfo if available (from API validation)
    const token = interviewInfo.token || new URLSearchParams(window.location.search).get('token');
    
    if (token) {
      wsService.connect(token);
    }

    const unsubscribeMsg = wsService.onMessage((msg) => {
      setMessages((prev) => {
        // 防止重复的欢迎消息
        if (msg.id === 'welcome-msg' && prev.some(m => m.id === 'welcome-msg')) {
            return prev;
        }
        
        // 修正消息的发送者身份 (因为 websocket.ts 默认设为 'other')
        // 如果收到的消息角色与当前用户角色一致，则认为是自己发送的（或者是重复的 Echo）
        const isMyRole = (isHR && msg.role === 'HR') || (!isHR && msg.role === 'Seeker');
        
        if (isMyRole) {
            // 如果是我们自己发的消息（Echo），我们通常忽略它，因为我们已经乐观地添加到列表中了
            // 或者我们可以用它来确认消息发送成功（这里简化处理：忽略）
            return prev;
        }

        return [...prev, msg];
      });
    });

    const unsubscribeStatus = wsService.onStatusChange((s) => {
      setStatus(s);
    });

    return () => {
      unsubscribeMsg();
      unsubscribeStatus();
      wsService.close();
    };
  }, []);

  // 自动滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = text || inputValue;
    if (!content.trim()) return;

    // 根据角色确定发送者详情
    const senderName = isHR ? interviewInfo.interviewer : '我';
    const senderRole = isHR ? 'HR' : 'Seeker';

    // Optimistic update for local message
    const newMsg = {
      id: Date.now().toString(),
      sender: 'me', // Mark as sent by me for UI
      name: senderName,
      role: senderRole,
      content: content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };

    
    setMessages((prev) => [...prev, newMsg]);
    wsService.send(content);
    if (!text) setInputValue('');
    
    // HR 提问后请求 AI 刷新建议
    if (isHR) { // 仅当是 HR 自己发送消息后
        // 模拟上下文：取最近几条消息
        const context = [...messages, newMsg].slice(-5).map(m => `${m.name}: ${m.content}`).join('\n');
        
        // 调用 AI 建议接口 (防抖或延迟调用)
        setTimeout(async () => {
            try {
                const res: any = await getAiSuggestion({
                    room_id: interviewInfo.roomId || '', // 确保有 roomId
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
      // 获取最后一条消息的 ID (假设是对最后一条回答进行打标)   
      // 在实际场景中，可能需要交互选择特定的消息
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
    <div className="flex h-full w-full overflow-hidden bg-gray-50">
      <div className="flex flex-1 flex-col relative">
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm z-10">
          <div>
            <div className="text-lg font-bold text-gray-800">
              {interviewInfo.position} - {interviewInfo.candidateName}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`flex items-center gap-1 ${status === 'connected' ? 'text-green-600' : 'text-orange-500'}`}>
                <div className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-orange-500'}`} />
                {status === 'connected' ? '连接正常' : '连接中...'}
              </div>
              <span>|</span>
              <span>面试官: {interviewInfo.interviewer}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button danger onClick={onEndInterview}>结束面试</Button>
          </div>
        </div>

        {/* AI 助手栏（仅限 HR） */}
        {isHR && (
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2 overflow-hidden">
                    <RobotOutlined className="text-blue-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-blue-800 flex-shrink-0">AI 面试官助理建议:</span>
                    <span className="text-xs text-blue-700 truncate cursor-pointer hover:underline" onClick={() => setInputValue(aiSuggestion)}>
                        "{aiSuggestion}"
                    </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                    <Button 
                        size="small" 
                        type="link" 
                        icon={<BulbOutlined />} 
                        className="text-xs h-6"
                        onClick={() => setInputValue(aiSuggestion)}
                    >
                        采纳
                    </Button>
                    <Button size="small" type="text" className="text-xs h-6 text-gray-400">换一换</Button>
                </div>
            </div>
        )}

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {/* 系统欢迎语 */}
          <div className="flex justify-center my-4">
            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              面试已开始，系统全程录音中
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.sender === 'me';
            const isSystem = msg.type === 'system';
            
            if (isSystem) {
                return (
                    <div key={idx} className="flex justify-center my-2">
                        <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full border border-blue-100">
                            {msg.content}
                        </span>
                    </div>
                );
            }

            return (
              <div
                key={idx}
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                    {!isMe && <Avatar size={24} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />}
                    <span>{msg.name}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 bg-white p-4">
            {/* 快捷操作（仅限 HR） */}
            {isHR && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    <Tag icon={<CheckCircleOutlined />} color="success" className="cursor-pointer hover:opacity-80" onClick={() => handleMarking('positive', '回答准确')}>回答准确</Tag>
                    <Tag icon={<WarningOutlined />} color="warning" className="cursor-pointer hover:opacity-80" onClick={() => handleMarking('neutral', '逻辑不清')}>逻辑不清</Tag>
                    <Tag icon={<CloseCircleOutlined />} color="error" className="cursor-pointer hover:opacity-80" onClick={() => handleMarking('negative', '技术盲区')}>技术盲区</Tag>
                    <div className="w-[1px] h-5 bg-gray-200 mx-1"></div>
                    <Tag className="cursor-pointer bg-gray-100 border-gray-200 text-gray-600" onClick={() => handleSend('请做一个简短的自我介绍')}>自我介绍</Tag>
                    <Tag className="cursor-pointer bg-gray-100 border-gray-200 text-gray-600" onClick={() => handleSend('你对未来3年的职业规划是什么？')}>职业规划</Tag>
                </div>
            )}

            <div className="flex gap-2">
                <input
                type="text"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="输入消息..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                />
                {isHR && (
                    <Button icon={<RobotOutlined />} onClick={handleAiRefine} title="AI 润色">
                        润色
                    </Button>
                )}
                <Button type="primary" onClick={() => handleSend()}>
                发送
                </Button>
            </div>
        </div>
      </div>

      {/* HR 上下文面板（右侧） */}
      {isHR && (
          <div className="w-[400px] border-l border-gray-200 bg-white h-full flex flex-col shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.05)] z-20">
              <InterviewContextPanel talentId={interviewInfo.talentId} />
          </div>
      )}
    </div>
  );
};

export default ChatRoom;
