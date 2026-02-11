import { api } from './client.js';

export const plansApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/plans${qs ? '?' + qs : ''}`);
  },
  get: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  activate: (id) => api.post(`/plans/${id}/activate`),
  deactivate: (id) => api.post(`/plans/${id}/deactivate`),
  delete: (id) => api.delete(`/plans/${id}`),
};
