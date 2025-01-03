import "./App.css";
import routers from "./router/router";
import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { reqMap } from "./state/common";
import { useDispatch } from "react-redux";
import { clearList, changeItemStatus, changeNowLength } from "./store/modules/upload";

function App() {
  const list = useSelector((state: RootState) => state.UploadReducer.list);
  const maxLength = useSelector((state: RootState) => state.UploadReducer.maxLength);
  const nowLength = useSelector((state: RootState) => state.UploadReducer.nowLength);
  const dispatch = useDispatch();
  
  function uploadAction() {
    if(list.length === 0) return;
    
    // 只处理未上传且当前上传数量未达到最大值的项
    const itemToUpload = list.find(item => !item.status && nowLength < maxLength);
    if(!itemToUpload) return;

    dispatch(changeItemStatus(itemToUpload));
    dispatch(changeNowLength(+1));
    
    reqMap[itemToUpload.type](itemToUpload.data).then((res) => {
      console.log(res);
      dispatch(clearList(itemToUpload));
      dispatch(changeNowLength(-1));
      // 完成一个上传后，检查是否还有待上传项
    });
  }

  useEffect(() => {
    uploadAction();
  }, [list]);

  return <RouterProvider router={routers}></RouterProvider>;
}

export default App;
