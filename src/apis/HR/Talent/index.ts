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

export const getInterviewedTalents = () => {
  return request({
    url: '/api/v1/talent/get', 
    method: 'GET',
    params: {
        type: 'interview'
    }
  });
};

export const updateTalentStatus = (talentId: string, status: 'accepted' | 'rejected') => {
  return request({
    url: '/api/v1/talent/update_status',
    method: 'POST',
    data: {
      talent_id: talentId,
      status: status
    }
  }) as Promise<ApiResponse<void>>;
};

// Legacy Mock
export const getJobDashboard = (params?: { position?: string; status?: string }) => {
  return request({
    url: '/hr/dashboard/candidates',
    method: 'GET',
    params,
  }) as Promise<ApiResponse<Candidate[]>>;
};

export const getTalentReport = (id: string) => {
  return request({
    url: '/api/v1/talent/get_report',
    method: 'GET',
    params: {
      talent_id: id,
    },
  }) as Promise<ApiResponse<any>>;
};
