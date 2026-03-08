import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Spin } from "antd";
import Welcome from "../view/Welcome/index"; // 首屏保持静态引入，优化 LCP
import AuthGuard from "../components/AuthGuard";
// 路由懒加载
const Login = lazy(() => import("../view/Login/login"));
const Seeker = lazy(() => import("../view/Seeker/index"));
const HRDashboard = lazy(() => import("../view/HR/index"));
const InterviewPage = lazy(() => import('../view/HR/Interview/InterviewPage'));
const TalentReportPage = lazy(() => import('../view/HR/Talent/TalentReportPage'));
const InterviewRoom = lazy(() => import('../view/InterviewRoom/index'));
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

// 受保护路由的 loader：临时关闭检查
const authLoader = () => {
  // const { token } = useUserStore.getState();
  // if (!token) {
  //   return redirect("/");
  // }
  return null;
};

// 根入口组件：负责首屏渲染 Welcome 及已登录用户的分流
const RootEntry: React.FC = () => {
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
    path: '/interview-room',
    element: (
      <LazyWrapper>
        <InterviewRoom />
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
          <Seeker />
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
  {
    path: '/hr/interview/:id',
    element: (
      <AuthGuard allowedRoles={['hr']}>
        <LazyWrapper>
          <InterviewPage />
        </LazyWrapper>
      </AuthGuard>
    ),
    loader: authLoader,
  },
  {
    path: '/hr/talent/:id',
    element: (
      <AuthGuard allowedRoles={['hr']}>
        <LazyWrapper>
          <TalentReportPage />
        </LazyWrapper>
      </AuthGuard>
    ),
    loader: authLoader,
  },
];

//eslint-disable-next-line
export default createBrowserRouter(routers);
