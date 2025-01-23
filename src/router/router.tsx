import { createBrowserRouter } from "react-router-dom";
import Login from "../view/Login/login";
import Home from "../view/Home/index";
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
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export default createBrowserRouter(routers);
