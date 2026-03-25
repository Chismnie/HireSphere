import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';
import type { LoginParams, UserInfo, RegisterParams } from './type';

export * from './type';

export const login = (data: LoginParams) => {
  return request({
    url: '/api/v1/user/login',
    method: 'POST',
    data,
  }) as Promise<ApiResponse<UserInfo>>;
};

export const register = (data: RegisterParams) => {
  return request({
    url: '/api/v1/user/register',
    method: 'POST',
    data,
  }) as Promise<ApiResponse<void>>;
};

export const sendCode = (email: string) => {
  return request({
    url: '/api/v1/user/sendcode',
    method: 'POST',
    data: { email },
  }) as Promise<ApiResponse<void>>;
};

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'POST',
  }) as Promise<ApiResponse<void>>;
};

export const getUserInfo = () => {
  return request({
    url: '/auth/me',
    method: 'GET',
  }) as Promise<ApiResponse<UserInfo>>;
};
