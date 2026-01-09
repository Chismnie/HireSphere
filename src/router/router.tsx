import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../view/Login/login";
const routers = [
  {
    path: "/",
    element: <Navigate to="/login" replace />, // 默认重定向到登录页面
  },
  {
    path: "/login",
    element: <Login />,
  },
];

// eslint-disable-next-line react-refresh/only-export-components
export default createBrowserRouter(routers);
