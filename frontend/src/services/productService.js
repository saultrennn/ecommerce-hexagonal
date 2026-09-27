import { request } from './apiClient.js';

export const productService = {
  list: () => request('/products', { auth: false }),
  get: (id) => request(`/products/${id}`, { auth: false }),
  create: (data) => request('/products', { method: 'POST', body: data }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};
