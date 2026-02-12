import { api } from './client.js';

export const workoutsApi = {
  list: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/workouts${qs ? '?' + qs : ''}`, options);
  },
  get: (id, options) => api.get(`/workouts/${id}`, options),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
};
