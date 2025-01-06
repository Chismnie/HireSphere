import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { reqMap } from "@/state/common";

// 定义请求类型
export type reqType = {
  type: keyof typeof reqMap;
  data: any;
  status: boolean;
};

// 定义状态类型
type stateType = {
  list: reqType[]; // list 类型为 reqType 数组
  maxLength: number; //最大发送数量
  nowLength: number; //当前发送数量
};

// 创建切片
const UploadSlice = createSlice({
  name: "upload",
  initialState: {
    list: [], // list 初始为空数组
    maxLength: 3, //最大发送数量
    nowLength: 0, //当前发送数量
  } as stateType, // 显式指定 initialState 的类型为 stateType
  reducers: {
    //添加队列
    changeList: (state, action: PayloadAction<Omit<reqType, "status">[]>) => {
      state.list = [
        ...state.list,
        ...action.payload.map((item) => ({
          ...item,
          status: false,
        })),
      ];
    },
    //已经完成后删除某个队列
    clearList: (state, action: PayloadAction<reqType>) => {
      state.list = state.list.filter(
        (item) =>
          item.type !== action.payload.type || item.data !== action.payload.data
      );
    },
    //改变当前发送数量
    changeNowLength: (state, action: PayloadAction<number>) => {
      state.nowLength += action.payload;
    },
    //改变某个请求的状态
    changeItemStatus: (state, action: PayloadAction<reqType>) => {
      state.list = state.list.map((item) =>
        item.type === action.payload.type && item.data === action.payload.data
          ? { ...item, status: true }
          : item
      );
    },
  },
});

// 导出 actions 和 reducer
export const { changeList, clearList, changeItemStatus, changeNowLength } =
  UploadSlice.actions;
export default UploadSlice.reducer;
