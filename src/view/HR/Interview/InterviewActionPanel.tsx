import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Button, Tag, Avatar, message, Typography, Rate } from 'antd';
import {
  SendOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { debounce } from 'lodash';

const { Text } = Typography;

interface Message {
  id: string;
  role: 'ai' | 'candidate';
  content: string;
  type?: 'text' | 'suggestion';
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    content:
      '请您简单介绍一下在上一家公司处理过的最具挑战性的高并发场景，特别是数据库方面。',
  },
  {
    id: '2',
    role: 'candidate',
    content:
      '好的。在去年的双十一活动中，我们的订单系统面临了每秒 5万 QPS 的峰值。当时数据库 CPU 直接飙升到了 90%...',
  },
];

const InterviewActionPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [isRecording] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [tags, setTags] = useState<
    {
      label: string;
      active: boolean;
      type: 'default' | 'success' | 'warning';
    }[]
  >([
    { label: '细节模糊', active: false, type: 'warning' },
    { label: '沟通流畅', active: false, type: 'success' },
    { label: '风险预警', active: false, type: 'warning' },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SSE Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'suggestion-1',
          role: 'ai',
          content: '✨ 如何处理高并发下的 Redis 缓存雪崩与穿透问题？',
          type: 'suggestion',
        },
      ]);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'ai', content: inputText },
    ]);
    setInputText('');
  };

  const handleAISuggestion = async () => {
    if (!inputText.trim()) return;
    message.loading({ content: 'AI 正在润色问题...', key: 'polish' });
    setTimeout(() => {
      setInputText(
        '针对您提到的高并发场景，能否详细展开讲讲 Redis 缓存策略的具体实现？'
      );
      message.success({ content: '润色完成', key: 'polish' });
    }, 1000);
  };

  // Debounced save for scoring
  const debouncedSaveScore = useCallback(
    debounce((newScore: number) => {
      // Mock API call
      console.log('Saving score:', newScore);
      message.success('评分已自动保存');
    }, 500),
    []
  );

  const handleScoreChange = (value: number) => {
    setScore(value);
    debouncedSaveScore(value);
  };

  const handleTagClick = (index: number) => {
    setTags((prev) => {
      const newTags = [...prev];
      newTags[index].active = !newTags[index].active;

      // Auto submit score simulation
      if (newTags[index].active) {
        message.success(`已标记：${newTags[index].label}`);
      }
      return newTags;
    });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/30">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <Text strong className="text-lg">
            面试进行中
          </Text>
          <span className="text-gray-300">|</span>
          <Text type="secondary">候选人：张三</Text>
          <Tag color="blue" className="ml-2 rounded-full">
            产品经理
          </Tag>
        </div>
        <Button type="text" icon={<MoreOutlined />} />
      </div>

      {/* Chat Area - 70% Height (Flex 7) */}
      <div className="flex-[7] space-y-6 overflow-y-auto p-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} group`}
          >
            {msg.role === 'ai' && (
              <Avatar
                className="mr-3 shrink-0 bg-blue-600"
                icon={<BulbOutlined />}
              />
            )}

            <div
              className={`relative max-w-[85%] p-4 text-sm leading-relaxed shadow-sm ${
                msg.type === 'suggestion'
                  ? 'cursor-pointer rounded-2xl rounded-tl-none border border-purple-100 bg-purple-50 text-purple-700 transition-colors hover:bg-purple-100'
                  : msg.role === 'ai'
                    ? 'rounded-2xl rounded-tl-none border border-gray-100 bg-white text-gray-800'
                    : 'rounded-2xl rounded-tr-none bg-blue-600 text-white shadow-blue-200'
              }`}
              onClick={() => {
                if (msg.type === 'suggestion') {
                  setInputText(msg.content.replace('✨ ', ''));
                }
              }}
            >
              {msg.content}
            </div>

            {msg.role === 'candidate' && (
              <Avatar
                className="ml-3 shrink-0 bg-gray-200 text-gray-600"
                icon={<UserOutlined />}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - 30% Height (Flex 3) */}
      <div className="z-10 flex flex-[3] shrink-0 flex-col overflow-hidden border-t border-gray-100 bg-white p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        {/* Real-time Scoring & Tags */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="mb-1 text-xs text-gray-400">实时评分</span>
              <Rate
                allowHalf
                value={score}
                onChange={handleScoreChange}
                className="text-lg text-blue-500"
              />
            </div>
            <div className="mx-2 h-8 w-[1px] bg-gray-200" />
            <div className="scrollbar-hide flex max-w-[300px] gap-2 overflow-x-auto pb-1">
              {tags.map((tag, index) => (
                <Tag.CheckableTag
                  key={tag.label}
                  checked={tag.active}
                  onChange={() => handleTagClick(index)}
                  className={` ${tag.active ? (tag.type === 'warning' ? '!border-red-200 !bg-red-50 !text-red-500' : '!border-green-200 !bg-green-50 !text-green-500') : 'border-gray-200 bg-gray-50 text-gray-500 hover:text-blue-500'} flex h-7 cursor-pointer select-none items-center rounded-full border px-3 py-1 transition-all`}
                >
                  {tag.active ? (
                    tag.type === 'warning' ? (
                      <CloseCircleOutlined className="mr-1" />
                    ) : (
                      <CheckCircleOutlined className="mr-1" />
                    )
                  ) : null}
                  {tag.label}
                </Tag.CheckableTag>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <Input.TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入追问内容，AI 将辅助润色..."
            style={{ height: '100%', resize: 'none' }}
            className="h-full rounded-xl border-gray-200 bg-gray-50/50 pr-24 transition-colors hover:bg-white focus:border-blue-400 focus:shadow-none"
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="text"
              icon={<BulbOutlined />}
              className="rounded-lg border-0 bg-purple-50 text-xs text-purple-600 hover:bg-purple-100"
              onClick={handleAISuggestion}
            >
              AI 润色
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              className="rounded-lg bg-blue-600 shadow-lg shadow-blue-200"
              onClick={handleSendMessage}
            />
          </div>
        </div>

        <div className="mt-3 flex shrink-0 items-center justify-between px-1 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            AI 协同面试助手已就绪
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`h-2 w-2 rounded-full ${isRecording ? 'animate-pulse bg-red-500' : 'bg-gray-300'}`}
            />
            <span>{isRecording ? 'REC 00:15:45' : '00:15:45'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewActionPanel;
