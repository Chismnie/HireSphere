import axios from 'axios';

// 所有服务的默认地址
export const DEFAULT_BASE_URL = 'https://frp-ski.com:46285';

// 在开发环境下使用相对路径，以便通过 Vite 代理解决 CORS 问题
const baseURL = ''; 


interface QueueItem {
  options: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueueItem[] = [];
  private activeCount = 0;
  private readonly maxConcurrent = 3; //最大并发数

  async add(options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // 检查请求头中的 pop 属性
      const useQueue = options.headers && options.headers.pop;
      
      const queueItem: QueueItem = { options, resolve, reject };

      if (useQueue) {
        // 去掉请求头中的 pop
        delete options.headers.pop;
        if (this.activeCount < this.maxConcurrent) {
          this.processRequest(queueItem);
        } else {
          this.queue.push(queueItem);
        }
      } else {
        // 普通请求直接执行
        this.processNormalRequest(queueItem);
      }
    });
  }

  private async processRequest(queueItem: QueueItem) {
    this.activeCount++;
    try {
      const response = await axiosInstance(queueItem.options);
      queueItem.resolve(response.data);
    } catch (error: any) {
        // Fast fail for connection errors
        if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('Network Error'))) {
            queueItem.reject(new Error('无法连接到服务器，请检查网络或稍后重试'));
        } else {
            queueItem.reject(error);
        }
    } finally {
      this.activeCount--;
      this.processNextRequest();
    }
  }
  private async processNormalRequest(queueItem: QueueItem) {
    try {
      const response = await axiosInstance(queueItem.options);
      queueItem.resolve(response.data);
    } catch (error: any) {
        if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('Network Error'))) {
            queueItem.reject(new Error('无法连接到服务器，请检查网络或稍后重试'));
        } else {
            queueItem.reject(error);
        }
    }
  }
  private processNextRequest() {
    while (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const nextRequest = this.queue.shift();
      if (nextRequest) {
        this.processRequest(nextRequest);
      }
    }
  }

  // 清除所有请求队列
  clearQueue() {
    this.queue = [];
    this.activeCount = 0;
  }
}

const axiosInstance = axios.create({
  baseURL: baseURL, // 使用 DEFAULT_BASE_URL 作为默认地址
  timeout: 1280000 * 1000, 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const requestQueue = new RequestQueue();

export const request = (options: any) => {
  return requestQueue.add(options);
};

// 导出清除队列方法
export const clearRequestQueue = () => {
  requestQueue.clearQueue();
};

/**
 * @name fetchSse
 * @description 使用fetch来实现sse,使用的时候传入url和options
 * @param url
 * @param options
 * @returns //reader是流读取器，decoder是解码器，reader里面包含value和done
 * @example
 * //api封装
 * //sse
export const getFetchSse = () => {
  return fetchReader("/stream", {
    method: "GET",
  });
};

  //获取数据及处理
    getFetchSse().then(async ({ reader, decoder }) => {
      // 循环读取流数据
      let done = false;
      while (!done) {
        // 读取流中的一部分
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!done) {
          let buffer = "";
          buffer = decoder.decode(value, { stream: true });
          const parsedMessage = JSON.parse(buffer);
          console.log({ value: parsedMessage, status: done }); // 输出每次的内容
        }
      }
    });
 * 
 * 
 */
export const fetchReader = (url: string, options: RequestInit = {}) => {
  const decoder = new TextDecoder();
  return new Promise<{
    reader: ReadableStreamDefaultReader<Uint8Array>;
    decoder: TextDecoder;
  }>((resolve, reject) => {
    fetch(`${baseURL}${url}`, options)
      .then((response) => {
        const reader = response.body?.getReader();
        if (reader) {
          resolve({ reader, decoder });
        } else {
          reject(new Error('Response body is null'));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};