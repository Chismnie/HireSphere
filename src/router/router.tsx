import React, { useEffect, lazy, Suspense } from "react";
import { createBrowserRouter, redirect, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import Welcome from "../view/Welcome/index"; // 首屏保持静态引入，优化 LCP
import AuthGuard from "../components/AuthGuard";
import useUserStore from "@/store/modules/user";

// 路由懒加载
const Login = lazy(() => import("../view/Login/login"));
const Home = lazy(() => import("../view/Home/index"));
const HRDashboard = lazy(() => import("../view/HR/index"));
const Forbidden = lazy(() => import("../view/Error/403"));

// 懒加载包裹组件
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Spin size="large" tip="Loading..." />
      </div>
    }
  >
    {children}
  </Suspense>
);

// 受保护路由的 loader：没有 token 就去 /login
const authLoader = () => {
  const { token } = useUserStore.getState();
  if (!token) {
    return redirect("/login");
  }
  return null;
};

// 根入口组件：负责首屏渲染 Welcome 及已登录用户的分流
const RootEntry: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { token, role } = useUserStore.getState();

    // 如果已登录，根据角色分流到对应主页
    if (token && role) {
      if (role === "hr") {
        navigate("/hr");
      } else {
        navigate("/home");
      }
    }
  }, [navigate]);

  return <Welcome />;
};

const routers = [
  {
    path: "/",
    element: <RootEntry />,
    // 移除 loader，确保 RootEntry 必定渲染
  },
  {
    path: "/welcome",
    element: <Welcome />,
  },
  {
    path: "/login",
    element: (
      <LazyWrapper>
        <Login />
      </LazyWrapper>
    ),
  },
  {
    path: "/403",
    element: (
      <LazyWrapper>
        <Forbidden />
      </LazyWrapper>
    ),
  },
  {
    path: "/home",
    element: (
      <AuthGuard allowedRoles={['seeker']}>
        <LazyWrapper>
          <Home />
        </LazyWrapper>
      </AuthGuard>
    ),
    loader: authLoader,
  },
  {
    path: "/hr",
    element: (
      <AuthGuard allowedRoles={['hr']}>
        <LazyWrapper>
          <HRDashboard />
        </LazyWrapper>
      </AuthGuard>
    ),
    loader: authLoader,
  },
];

//eslint-disable-next-line
export default createBrowserRouter(routers);
