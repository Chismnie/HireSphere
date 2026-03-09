import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';
import type { JobProfileData } from './type';

export * from './type';

// 保存岗位画像（新建或更新）
export const saveJobProfile = (data: JobProfileData) => {
  return request({
    url: '/api/v1/job_profile/save',
    method: 'POST',
    data,
  }) as Promise<ApiResponse<JobProfileData>>;
};

// 获取岗位画像列表
export const getJobProfiles = () => {
  return request({
    url: '/api/v1/job_profile/get',
    method: 'GET',
  }) as Promise<ApiResponse<{ list: JobProfileData[] }>>;
};

// 废弃的旧接口，保留以兼容可能的遗留调用，建议尽快替换
export const updateJobProfile = (data: any) => {
  return Promise.resolve({ code: 0, message: 'Deprecated', data: null });
};

export const createJobProfile = (data: any) => {
   return Promise.resolve({ code: 0, message: 'Deprecated', data: null });
};
