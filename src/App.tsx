import "./App.css";
import routers from "./router/router";
import { RouterProvider } from "react-router-dom";


function App() {

  return <RouterProvider router={routers}></RouterProvider>;
}

export default App;
/**
 * 暂且不用，先废弃
 * import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { reqMap } from "./state/common";
import { useDispatch } from "react-redux";
import { clearList, changeItemStatus, changeNowLength } from "./store/modules/upload";
 *   const list = useSelector((state: RootState) => state.UploadReducer.list);//队列
  const maxLength = useSelector((state: RootState) => state.UploadReducer.maxLength);//最大发送数量
  const nowLength = useSelector((state: RootState) => state.UploadReducer.nowLength);//当前发送数量
  const dispatch = useDispatch();
  
  function uploadAction() {
    if(list.length === 0) return;
    
    // 只处理未上传且当前上传数量未达到最大值的项
    const itemToUpload = list.find(item => !item.status && nowLength < maxLength);
    if(!itemToUpload) return;//没有了就返回

    dispatch(changeItemStatus(itemToUpload));//将一项改变状态为已经处理
    dispatch(changeNowLength(+1));//当前正在处理数量+1
    
    reqMap[itemToUpload.type](itemToUpload.data as never).then((res) => {
      console.log(res);
      dispatch(clearList(itemToUpload)); //已经处理完队列里删除
      dispatch(changeNowLength(-1)); //当前正在处理数量-1
      
    });
  }
  useEffect(() => {
    uploadAction();// 监听变化，有加或者减都触发
  }, [list]);

 */
