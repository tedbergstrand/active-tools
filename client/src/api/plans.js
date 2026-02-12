import { api } from './client.js';

export const plansApi = {
  list: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/plans${qs ? '?' + qs : ''}`, options);
  },
  get: (id, options) => api.get(`/plans/${id}`, options),
  todayPlan: (options) => api.get('/plans/active/today', options),
  progress: (id, options) => api.get(`/plans/${id}/progress`, options),
  create: (data) => api.post('/plans', data),
  update: (id, data) => api.put(`/plans/${id}`, data),
  activate: (id) => api.post(`/plans/${id}/activate`),
  deactivate: (id) => api.post(`/plans/${id}/deactivate`),
  delete: (id) => api.delete(`/plans/${id}`),
};
