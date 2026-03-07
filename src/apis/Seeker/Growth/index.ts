import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';
import type { GrowthTrackData } from './type';

export * from './type';

export const getGrowthTrack = () => {
  return request({
    url: '/seeker/growth/track',
    method: 'GET',
  }) as Promise<ApiResponse<GrowthTrackData[]>>;
};
