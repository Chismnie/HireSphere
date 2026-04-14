import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Checkbox, Radio, Typography, Badge, Avatar, message } from 'antd';
import {
  RightOutlined,
  LeftOutlined,
  PlusOutlined,
  UserOutlined,
  AudioOutlined,
  AudioFilled,
  SendOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSpeechToText } from '@/hooks/useSpeechToText';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Mock Data for Modes
const interviewModes = [
  {
    id: 'general',
    title: '通用模拟模式',
    desc: '针对大多数公司的普适的专项模拟。',
    isHot: true,
    isWide: true,
  },
  {
    id: 'streaming',
    title: '高并发流媒体类模拟模式',
    desc: '针对字节、小红书等业务驱动型公司的专项模拟。',
    tag: '方向定制',
  },
  {
    id: 'hardtech',
    title: '硬科技类模拟模式',
    desc: '针对华为、百度等传统互联网公司的专项模拟。',
    tag: '方向定制',
  },
  {
    id: 'ecommerce',
    title: '电商方向模拟模式',
    desc: '针对阿里，京东等业务复杂型公司的专项模拟。',
    tag: '方向定制',
  },
  {
    id: 'aisec',
    title: 'AI实验室类类模拟模式',
    desc: '针对OpenAI等创新型公司的专项模拟。',
    tag: '方向定制',
  },
  {
    id: 'custom',
    title: '(核心技术栈名称) 模式',
    desc: '针对Java后端开发（职位）方向模拟。',
    tag: '个人定制',
  },
];

// Mock Chat Messages
const initialMessages = [
  {
    id: '1',
    role: 'ai',
    content: '你好，欢迎参加今天的模拟面试。我是你的 AI 面试官 Alex。我看过你的简历，你之前在分布式缓存方面有比较深入的研究。我们先聊聊，你为什么在简历中提到的那个项目里选择了 Redis 而不是 Memcached？',
  },
];

const MockInterview: React.FC = () => {
  const [viewState, setViewState] = useState<'dashboard' | 'config' | 'chat'>('dashboard');
  const [selectedMode, setSelectedMode] = useState<string>('');
  
  // Config State
  const [config, setConfig] = useState({
    jobTitle: 'Java后端开发',
    techStack: 'Spring Boot, Redis',
    level: 'P6',
    style: 'strict',
    language: 'zh',
    duration: '20',
    topics: ['algorithm', 'system_design', 'basic', 'project'],
    customReq: '',
  });

  // Chat State
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [timer, setTimer] = useState(0);

  // 语音识别逻辑
  const { isListening, startListening, stopListening, isSupported } = useSpeechToText({
    onResult: (transcript, isFinal) => {
      if (isFinal) {
        setInputValue(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript);
      }
    },
    onError: (err) => {
      if (err === 'not-allowed') {
        message.error('请允许浏览器使用麦克风以启用语音输入');
      }
    }
  });

  const toggleListening = () => {
    if (!isSupported) {
      message.warning('当前浏览器不支持语音识别功能');
      return;
    }
    isListening ? stopListening() : startListening();
  };

  // Timer Effect for Chat
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (viewState === 'chat') {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `REC ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
    if (modeId === 'custom') {
      setViewState('config');
    } else {
      // For standard modes, jump directly to chat
      handleStartInterview();
    }
  };

  const handleStartInterview = () => {
    setViewState('chat');
    setTimer(0);
    setMessages(initialMessages);
  };

  const handleEndInterview = () => {
    setViewState('dashboard');
    message.success('模拟面试已结束');
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const newMsg = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages([...messages, newMsg]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: '很好的回答。那么在这个架构中，如果缓存击穿了，你会怎么处理？',
        },
      ]);
    }, 1500);
  };

  // 1. Dashboard View
  const renderDashboard = () => (
    <div className="flex h-full flex-col overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <Title level={2} className="!mb-2 text-gray-800">AI面试训练场</Title>
        <Text className="text-gray-500">
          基于目标岗位：<span className="font-bold text-blue-600">Java后端开发</span> 的模拟面试
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {interviewModes.map((mode) => (
          <div
            key={mode.id}
            className={`relative flex flex-col justify-between rounded-xl border border-gray-300 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md ${
              mode.isWide ? 'md:col-span-2 lg:col-span-3 flex-row items-center' : ''
            }`}
          >
            {/* Tag */}
            {(mode.isHot || mode.tag) && (
              <div className="absolute left-6 top-6">
                 <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                   mode.isHot ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                 }`}>
                   {mode.isHot ? '热门推荐' : mode.tag}
                 </span>
              </div>
            )}

            <div className={mode.isHot || mode.tag ? 'mt-8' : ''}>
              <Title level={mode.isWide ? 2 : 4} className="!mb-2">
                {mode.title}
              </Title>
              <Text className="text-gray-500">{mode.desc}</Text>
            </div>

            <Button
              type="primary"
              size="large"
              className={`bg-blue-600 shadow-sm ${mode.isWide ? 'w-48' : 'mt-6 w-full'}`}
              onClick={() => handleModeSelect(mode.id)}
            >
              进入模拟面试 {mode.isWide && <RightOutlined />}
            </Button>
          </div>
        ))}

        {/* Add Custom Mode Card */}
        <div 
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
          onClick={() => handleModeSelect('custom')}
        >
          <PlusOutlined className="mb-4 text-4xl text-gray-400" />
          <Text className="text-gray-500">上传 JD (职位描述) 定制面试</Text>
        </div>
      </div>
    </div>
  );

  // 2. Config View
  const renderConfig = () => (
    <div className="flex h-full flex-col overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-6 flex items-center gap-4">
        <Button 
          icon={<LeftOutlined />} 
          type="text" 
          className="text-gray-600 hover:bg-gray-100"
          onClick={() => setViewState('dashboard')}
        />
        <Title level={2} className="!mb-0 text-gray-800">自定义模拟面试</Title>
      </div>
      
      <Text className="mb-8 text-gray-500 block">
        基于目标岗位：<span className="font-bold text-blue-600">Java后端开发</span> 的模拟面试
      </Text>

      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Job Anchors */}
        <div className="space-y-4">
          <Title level={5}>1. 职位锚点 (Auto-parsed)</Title>
          <div className="space-y-3 pl-4">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span className="w-24 font-medium text-gray-700">职位名称：</span>
              <Input 
                value={config.jobTitle} 
                onChange={e => setConfig({...config, jobTitle: e.target.value})}
                className="w-64 border-b border-gray-300 border-l-0 border-r-0 border-t-0 bg-transparent px-0 focus:shadow-none"
                suffix={<EditOutlined className="text-gray-400" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span className="w-24 font-medium text-gray-700">核心技术栈：</span>
              <Input 
                value={config.techStack} 
                onChange={e => setConfig({...config, techStack: e.target.value})}
                className="w-64 border-b border-gray-300 border-l-0 border-r-0 border-t-0 bg-transparent px-0 focus:shadow-none"
                suffix={<EditOutlined className="text-gray-400" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span className="w-24 font-medium text-gray-700">目标职级：</span>
              <Input 
                value={config.level} 
                onChange={e => setConfig({...config, level: e.target.value})}
                className="w-64 border-b border-gray-300 border-l-0 border-r-0 border-t-0 bg-transparent px-0 focus:shadow-none"
                suffix={<EditOutlined className="text-gray-400" />}
              />
            </div>
          </div>
        </div>

        {/* Style Anchors */}
        <div className="space-y-4">
          <Title level={5}>2. 职位锚点 (Auto-parsed)</Title>
          <Radio.Group 
            className="pl-4 flex flex-wrap gap-8" 
            value={config.style}
            onChange={e => setConfig({...config, style: e.target.value})}
          >
            <Radio value="strict">严厉 (追问底层逻辑)</Radio>
            <Radio value="guide">导师 (引导式交流)</Radio>
            <Radio value="stress">压力 (模拟高频追问)</Radio>
          </Radio.Group>
        </div>

        {/* Language */}
        <div className="space-y-4">
          <Title level={5}>3. 语言偏好</Title>
          <Radio.Group 
            className="pl-4 flex gap-8" 
            value={config.language}
            onChange={e => setConfig({...config, language: e.target.value})}
          >
            <Radio value="zh">汉语</Radio>
            <Radio value="en">英语</Radio>
            <Radio value="mixed">中英文混合</Radio>
          </Radio.Group>
        </div>

        {/* Duration */}
        <div className="space-y-4">
          <Title level={5}>4. 时长设置</Title>
          <Radio.Group 
            className="pl-4 flex flex-wrap gap-8" 
            value={config.duration}
            onChange={e => setConfig({...config, duration: e.target.value})}
          >
            <Radio value="20">20分钟 (快速热身)</Radio>
            <Radio value="45">45分钟 (标准面试)</Radio>
            <Radio value="60">60分钟 (深度技术考察)</Radio>
          </Radio.Group>
        </div>

        {/* Topics */}
        <div className="space-y-4">
          <Title level={5}>5. 题目设置</Title>
          <Checkbox.Group 
            className="pl-4 flex flex-wrap gap-8" 
            value={config.topics}
            onChange={vals => setConfig({...config, topics: vals as string[]})}
          >
            <Checkbox value="algorithm">算法</Checkbox>
            <Checkbox value="system_design">系统设计</Checkbox>
            <Checkbox value="basic">基础八股</Checkbox>
            <Checkbox value="project">项目深挖</Checkbox>
          </Checkbox.Group>
          <div className="pl-4 mt-2 flex items-center gap-2">
             <Checkbox checked disabled />
             <Input 
               placeholder="自定义" 
               className="w-48" 
               value={config.customReq}
               onChange={e => setConfig({...config, customReq: e.target.value})}
             />
          </div>
        </div>

        {/* Personalization */}
        <div className="space-y-4">
          <Title level={5}>6. 个性化设置</Title>
          <div className="pl-4">
            <TextArea 
              rows={3} 
              placeholder="请输入内容" 
              className="bg-gray-50 border-gray-300"
            />
            <Text className="text-xs text-gray-400 mt-2 block">
              例：我是个比较内向的人，希望面试官能在沟通技巧上多给我一些反馈。针对我简历里那个分布式锁的项目狠狠提问。
            </Text>
          </div>
        </div>

        <Button 
          type="primary" 
          size="large" 
          block 
          className="h-12 bg-blue-600 font-bold shadow-md mt-8"
          onClick={handleStartInterview}
        >
          确定
        </Button>
      </div>
    </div>
  );

  // 3. Chat View
  const renderChat = () => (
    <div className="flex h-full flex-col bg-gray-50/30">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            icon={<LeftOutlined />} 
            type="text" 
            onClick={() => {
              if (window.confirm('确定要结束当前面试吗？')) {
                handleEndInterview();
              }
            }}
          />
          <div>
            <Title level={4} className="!mb-0">AI面试训练场</Title>
            <Text className="text-xs text-gray-500">
              基于目标岗位：<span className="font-bold text-blue-600">Java后端开发</span> 的模拟面试
            </Text>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-red-50 px-3 py-1 text-red-500 border border-red-100 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono">{formatTime(timer)}</span>
          </div>
          <Button 
            type="primary" 
            danger 
            onClick={handleEndInterview}
            className="shadow-sm"
          >
            结束模拟面试
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <Avatar 
              size={48} 
              icon={<UserOutlined />} 
              className={msg.role === 'ai' ? 'bg-blue-600' : 'bg-gray-800'}
              src={msg.role === 'ai' ? '/logo-ai.png' : undefined}
            />
            <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm text-base leading-relaxed ${
              msg.role === 'ai' 
                ? 'bg-white border border-gray-300 text-gray-800 rounded-tl-none' 
                : 'bg-green-100 border border-green-200 text-gray-800 rounded-tr-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-300 bg-white p-6">
        <div className="relative">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="在这里输入你的回答，或点击下方麦克风开启语音..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            className="pr-12 resize-none text-base border-gray-300 rounded-xl"
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <Button 
            icon={isListening ? <AudioFilled className="animate-pulse" /> : <AudioOutlined />} 
            className={`flex items-center gap-2 transition-all ${isListening ? 'bg-red-50 text-red-500 border-red-200 shadow-sm' : 'text-gray-600 hover:text-blue-600'}`}
            onClick={toggleListening}
          >
            {isListening ? '停止录音' : '语音作答'}
          </Button>
          
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>按下 Enter 发送 / Shift+Enter 换行</span>
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={() => {
                if (isListening) stopListening();
                handleSendMessage();
              }}
              disabled={!inputValue.trim()}
              className="bg-blue-600 shadow-sm"
            >
              发送回答
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-gray-50/50">
      {viewState === 'dashboard' && renderDashboard()}
      {viewState === 'config' && renderConfig()}
      {viewState === 'chat' && renderChat()}
    </div>
  );
};

export default MockInterview;
