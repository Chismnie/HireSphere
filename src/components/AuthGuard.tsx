import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore, { UserRole } from '@/store/modules/user';

interface AuthGuardProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const { token, role } = useUserStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children || <Outlet />}</>;
};

export default AuthGuard;
