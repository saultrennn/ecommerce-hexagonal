import { request } from './apiClient.js';

export const analyticsService = {
  // params: { range, from, to, granularity, limit }
  dashboard: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    return request(`/analytics/dashboard${query ? `?${query}` : ''}`);
  },
};
