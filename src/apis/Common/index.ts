import { request, fetchReader } from '@/utils/request';
import type { ApiResponse } from '../types';

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  return request({
    url: '/upload/image',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as Promise<ApiResponse<{ url: string }>>;
};

export const getFetchSse = () => {
  return fetchReader('/stream', {
    method: 'GET',
  });
};
