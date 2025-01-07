//utils.js
import axios from "axios";

axios.defaults.baseURL = "http://127.0.0.1:3005";

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
        this.processRequest(queueItem);
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
