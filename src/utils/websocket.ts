import { message } from 'antd';

type MessageType = 'text' | 'system';

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  name: string;
  role?: string; // 添加角色字段
  content: string;
  time: string;
  type: MessageType;
}

type Listener = (msg: ChatMessage) => void;
type StatusListener = (status: 'connecting' | 'connected' | 'disconnected') => void;

class InterviewWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private messageListeners: Listener[] = [];
  private statusListeners: StatusListener[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  connect(token: string) {
    if (this.ws) {
      this.ws.close();
    }

    try {
      // 连接到真实的 WebSocket 服务器
      const wsUrl = `ws://localhost:8080/api/v1/interview/ws/join?token=${token}`;
      console.log(`正在连接到 ${wsUrl}...`);
      this.notifyStatus('connecting');
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WS 已连接');
        this.notifyStatus('connected');
        // 连接成功后清除重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          // 将后端消息格式适配为前端 ChatMessage
          
          if (rawData.type === 'chat') {
              const msg: ChatMessage = {
                  id: Date.now().toString() + Math.random().toString(), // 如果未提供则生成 ID
                  sender: 'other', // 将由 UI 根据当前用户角色调整
                  name: rawData.from === 'hr' ? '面试官' : '候选人', // 简单映射
                  role: rawData.from === 'hr' ? 'HR' : 'Seeker',
                  content: rawData.data.text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  type: 'text'
              };
              this.notifyMessage(msg);
          }
        } catch (e) {
          console.error('解析 WS 消息失败:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('WS 已关闭');
        this.notifyStatus('disconnected');
        this.ws = null;
        // 自动重连
        this.scheduleReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('WS 错误:', error);
        this.notifyStatus('disconnected');
      };

    } catch (error) {
      console.error('WS 连接错误:', error);
      this.notifyStatus('disconnected');
      this.scheduleReconnect(token);
    }
  }

  send(content: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 后端期望格式: { type: "chat", data: { text: "..." } }
      // room_id 通常从连接会话/token 中推断
      const payload = {
          type: 'chat',
          data: {
              text: content
          }
      };
      this.ws.send(JSON.stringify(payload));
    } else {
        console.warn('WS 未连接，无法发送消息');
        message.error('连接已断开，消息发送失败');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.notifyStatus('disconnected');
  }

  onMessage(listener: Listener) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.push(listener);
    return () => {
      this.statusListeners = this.statusListeners.filter(l => l !== listener);
    };
  }

  private notifyMessage(msg: ChatMessage) {
    this.messageListeners.forEach(l => l(msg));
  }

  private notifyStatus(status: 'connecting' | 'connected' | 'disconnected') {
    this.statusListeners.forEach(l => l(status));
  }

  private scheduleReconnect(token: string) {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        console.log('正在尝试重连...');
        this.connect(token);
        this.reconnectTimer = null;
      }, 3000); // 3秒后重连
    }
  }
}

// 导出单例实例，但也允许通过 connect 方法更改 URL
// 初始 URL 是占位符，将在 connect() 中被覆盖
export const wsService = new InterviewWebSocket('ws://localhost:8080/api/v1/interview/ws/join');
