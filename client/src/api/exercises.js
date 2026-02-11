import { api } from './client.js';

export const exercisesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/exercises${qs ? '?' + qs : ''}`);
  },
  get: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
};
