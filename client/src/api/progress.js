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
  streak: (options) => api.get('/progress/streak', options),
  trends: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/trends${qs ? '?' + qs : ''}`, options);
  },
  distribution: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/distribution${qs ? '?' + qs : ''}`, options);
  },
  rpeTrend: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/rpe-trend${qs ? '?' + qs : ''}`, options);
  },
  recovery: (options) => api.get('/progress/recovery', options),
  checkPRs: (workoutId) => api.post('/progress/check-prs', { workout_id: workoutId }),
  insight: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/insight${qs ? '?' + qs : ''}`, options);
  },
  exerciseHistory: (exerciseId, params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/exercise-history/${exerciseId}${qs ? '?' + qs : ''}`, options);
  },
  volumeDetail: (params = {}, options) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/progress/volume-detail${qs ? '?' + qs : ''}`, options);
  },
  exercisesWithData: (options) => api.get('/progress/exercises-with-data', options),
  dashboard: (options) => api.get('/progress/dashboard', options),
};
