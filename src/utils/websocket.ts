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
  private url?: string;
  private messageListeners: Listener[] = [];
  private statusListeners: StatusListener[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectCount = 0;
  private readonly maxReconnects = 5;

  constructor(url: string) {
    this.url = url;
  }

  async connect(token: string, roomId: string, role: 'hr' | 'seeker') {
    if (!token || token === 'undefined' || token === 'null') {
        console.error('WS 连接失败: 无效的 Token');
        this.notifyStatus('disconnected');
        return;
    }

    if (!roomId || roomId === 'undefined') {
        console.error('WS 连接失败: 无效的 Room ID');
        this.notifyStatus('disconnected');
        return;
    }

    if (this.ws) {
        if (this.ws.readyState === WebSocket.OPEN) {
            console.log('WS 已经是连接状态，跳过重复连接');
            return;
        }
        if (this.ws.readyState === WebSocket.CONNECTING) {
            console.log('WS 正在连接中，跳过重复连接');
            return;
        }
        this.ws.close();
    }
    
    if (!this.reconnectTimer) {
       this.reconnectCount = 0;
    }

    try {
      this.notifyStatus('connecting');
      
      // 使用相对路径，走 Vite 代理
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/interview/ws/join?token=${encodeURIComponent(token)}&room_id=${encodeURIComponent(roomId)}`;

      console.log('WS 连接信息:', { wsUrl, token, roomId, role });
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WS 已连接');
        this.notifyStatus('connected');
        this.reconnectCount = 0; 
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.ws?.send(JSON.stringify({
            type: 'join',
            data: {
                room_id: roomId
            }
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          console.log('WS message', rawData);
          
          if (rawData.type === 'error') {
              // 用户反馈：不需要显示服务器错误提示，直接忽略或仅打印日志
              console.warn('WS Error Message (Hidden from UI):', rawData);
              return;
          }

          if (rawData.type === 'chat') {
              const msg: ChatMessage = {
                  id: Date.now().toString() + Math.random().toString(),
                  sender: 'other',
                  name: rawData.from === 'hr' ? '面试官' : '候选人',
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

      this.ws.onclose = (event) => {
        console.log(`WS 连接关闭: code=${event.code}, reason=${event.reason}, wasClean=${event.wasClean}`);
        
        // 处理“已在其他设备连接”的情况
        if (event.reason === '您已在其它设备连接' || event.code === 1000) {
            console.log('WS 正常关闭或被顶号，不重连');
            this.notifyStatus('disconnected');
            this.ws = null;
            return;
        }

        this.notifyStatus('disconnected');
        this.ws = null;

        if (event.code === 1008 || (event.code >= 4000 && event.code < 5000)) {
            console.error('WS 认证失败或策略违规，停止重连');
            return;
        }

        this.scheduleReconnect(token, roomId, role);
      };

      this.ws.onerror = (error) => {
        console.error('WS 错误:', error);
        this.notifyStatus('disconnected');
      };

    } catch (error) {
      console.error('WS 连接创建异常:', error);
      this.notifyStatus('disconnected');
      this.scheduleReconnect(token, roomId, role);
    }
  }

  send(content: string, roomId?: string, role: 'hr' | 'seeker' = 'hr') {
    // 增加对 WebSocket.CONNECTING 状态的容错，如果是连接中，则稍后重试
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        console.log('WS 正在连接中，消息进入等待队列...');
        setTimeout(() => this.send(content, roomId, role), 500);
        return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 构造符合后端要求的消息体
      // from 字段必须是 'hr' 或 'candidate' (注意这里后端可能是 candidate)
      // 根据之前的 ChatRoom 逻辑，我们这里统一用 'hr' 和 'candidate'
      const senderRole = role === 'hr' ? 'hr' : 'candidate';
      
      const payload = {
          type: 'chat',
          data: {
              text: content,
              room_id: roomId
          },
          from: senderRole
      };
      console.log('Sending WS message:', payload);
      this.ws.send(JSON.stringify(payload));
    } else {
        // console.warn('WS 未连接，无法发送消息', this.ws?.readyState);
        // message.error('连接已断开，消息发送失败');
        // 尝试自动重连并重发
        console.log('WS 未连接，尝试重连...');
        this.notifyStatus('connecting');
        message.warning('正在连接服务器，请稍后重试');
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

  private scheduleReconnect(token: string, roomId: string, role: 'hr' | 'seeker') {
    if (this.reconnectCount >= this.maxReconnects) {
      console.error('WS 重连失败次数过多，停止重连');
      this.notifyStatus('disconnected');
      return;
    }

    if (!this.reconnectTimer) {
      this.reconnectCount++;
      this.reconnectTimer = setTimeout(() => {
        console.log(`正在尝试重连 (${this.reconnectCount}/${this.maxReconnects})...`);
        this.connect(token, roomId, role);
        this.reconnectTimer = null;
      }, 3000);
    }
  }
}

// 导出单例实例，但也允许通过 connect 方法更改 URL
// 初始 URL 是占位符，将在 connect() 中被覆盖
export const wsService = new InterviewWebSocket('ws://localhost:8080/api/v1/interview/ws/join');
