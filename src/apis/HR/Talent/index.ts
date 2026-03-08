import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';
import type { Candidate } from './type';

export * from './type';

// GET api/v1/talent/get (Get All Talents)
export const getAllTalents = () => {
  return request({
    url: '/api/v1/talent/get',
    method: 'GET',
    params: {
        type: 'all'
    }
  });
};

// GET api/v1/talent/get (Get Interviewed Talents)
export const getInterviewedTalents = () => {
  return request({
    url: '/api/v1/talent/get', 
    method: 'GET',
    params: {
        status: 'interviewed'
    }
  });
};

export const getTalentReport = (id: string) => {
  return request({
    url: `/hr/talent/${id}`,
    method: 'GET',
  }) as Promise<ApiResponse<any>>;
};

// Legacy Mock
export const getJobDashboard = (params?: { position?: string; status?: string }) => {
  return request({
    url: '/hr/dashboard/candidates',
    method: 'GET',
    params,
  }) as Promise<ApiResponse<Candidate[]>>;
};
