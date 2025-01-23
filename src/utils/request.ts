//utils.js
import axios from "axios";
const baseURL = "http://yanmengsss.xyz:3005";
axios.defaults.baseURL = baseURL;

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
      const queueItem = { options, resolve, reject };
      //查看请求参数的请求头是否有pop
      if (options.Headers && options.Headers.pop) {
        //去掉请求头中的pop
        delete options.Headers.pop;
        if (this.activeCount < this.maxConcurrent) {
          // 如果当前活跃请求数小于最大并发数，直接执行
          this.processRequest(queueItem);
        } else {
          // 否则加入队列
          this.queue.push(queueItem);
        }
      } else {
        this.processNormalRequest(queueItem);
      }
    });
  }

  private async processRequest(queueItem: QueueItem) {
    this.activeCount++;
    try {
      const response = await axiosInstance(queueItem.options);
      queueItem.resolve(response.data);
    } catch (error) {
      queueItem.reject(error);
    } finally {
      this.activeCount--;
      this.processNextRequest();
    }
  }
  private async processNormalRequest(queueItem: QueueItem) {
    try {
      const response = await axiosInstance(queueItem.options);
      queueItem.resolve(response.data);
    } catch (error) {
      queueItem.reject(error);
    } finally {
      this.processNextRequest();
    }
  }
  private processNextRequest() {
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
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
  timeout: 5 * 1000, // 请求超时时间（5秒）
});

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
          reject(new Error("Response body is null"));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};
