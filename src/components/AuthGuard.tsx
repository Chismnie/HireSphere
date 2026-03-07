import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore, { UserRole } from '@/store/modules/user';

interface AuthGuardProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  // 临时关闭路由守卫，直接放行
  return <>{children || <Outlet />}</>;
};

export default AuthGuard;
