import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../view/Login/login";
import Home from "../view/Home/index";
import Hiresphere from "../view/Hiresphere/index";
import Welcome from "../view/Welcome/index";
const routers = [
  {
    path: "/",
    element: <Welcome />, // 默认重定向到登录页面
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
    meta: {
      title: "Home",
      description: "这里是home页面,我们可以用来选择",
    },
  },
  {
    path: "/hiresphere",
    element: <Hiresphere />,
    meta: {
      title: "Hiresphere",
      description: "这里是hiresphere页面,我们可以用来进行人工模拟对话",
    },
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export default createBrowserRouter(routers);
