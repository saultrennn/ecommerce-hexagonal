import { request } from './apiClient.js';

export const orderService = {
  create: (items) => request('/orders', { method: 'POST', body: { items } }),
  list: () => request('/orders'),
  get: (id) => request(`/orders/${id}`),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
  cancel: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
};
