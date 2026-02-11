import { api } from './client.js';

export const timersApi = {
  list: () => api.get('/timer-presets'),
  get: (id) => api.get(`/timer-presets/${id}`),
  create: (data) => api.post('/timer-presets', data),
  update: (id, data) => api.put(`/timer-presets/${id}`, data),
  delete: (id) => api.delete(`/timer-presets/${id}`),
};
