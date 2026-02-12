import { api } from './client.js';

export const progressApi = {
  summary: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/summary${qs ? '?' + qs : ''}`, options);
  },
  grades: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/grades${qs ? '?' + qs : ''}`, options);
  },
  volume: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/volume${qs ? '?' + qs : ''}`, options);
  },
  frequency: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/frequency${qs ? '?' + qs : ''}`, options);
  },
  personalRecords: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/personal-records${qs ? '?' + qs : ''}`, options);
  },
};
