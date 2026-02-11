import { api } from './client.js';

export const progressApi = {
  summary: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/summary${qs ? '?' + qs : ''}`);
  },
  grades: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/grades${qs ? '?' + qs : ''}`);
  },
  volume: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/volume${qs ? '?' + qs : ''}`);
  },
  frequency: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/frequency${qs ? '?' + qs : ''}`);
  },
  personalRecords: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/personal-records${qs ? '?' + qs : ''}`);
  },
};
