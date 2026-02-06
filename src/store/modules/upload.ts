import { create } from 'zustand';
import { ReqMap } from '@/state/common';
/**
 * 上传队列
 * 暂时不用，先废弃
 */
// 定义请求类型
export type ReqType = {
  type: keyof typeof ReqMap;
  data: unknown;
  status: boolean;
};

// 定义状态类型
type StateType = {
  list: ReqType[]; // list 类型为 reqType 数组
  maxLength: number; // 最大发送数量
  nowLength: number; // 当前发送数量
  changeList: (items: Omit<ReqType, 'status'>[]) => void; // 添加队列
  clearList: (item: ReqType) => void; // 删除某个队列
  changeNowLength: (length: number) => void; // 改变当前发送数量
  changeItemStatus: (item: ReqType) => void; // 改变某个请求的状态
};

// 创建 Zustand store
const useUploadStore = create<StateType>((set) => ({
  list: [], // list 初始为空数组
  maxLength: 3, // 最大发送数量
  nowLength: 0, // 当前发送数量
  changeList: (items) => {
    set((state) => ({
      list: [
        ...state.list,
        ...items.map((item) => ({
          ...item,
          status: false,
        })),
      ],
    }));
  },
  clearList: (item) => {
    set((state) => ({
      list: state.list.filter(
        (i) => i.type !== item.type || i.data !== item.data
      ),
    }));
  },
  changeNowLength: (length) => {
    set((state) => ({
      nowLength: state.nowLength + length,
    }));
  },
  changeItemStatus: (item) => {
    set((state) => ({
      list: state.list.map((i) =>
        i.type === item.type && i.data === item.data
          ? { ...i, status: true }
          : i
      ),
    }));
  },
}));

export default useUploadStore;
