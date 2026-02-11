import { api } from './client.js';

export const toolsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.tool_type) query.set('tool_type', params.tool_type);
    if (params.difficulty) query.set('difficulty', params.difficulty);
    const qs = query.toString();
    return api.get(`/tools${qs ? `?${qs}` : ''}`);
  },
  get: (slug) => api.get(`/tools/${slug}`),
  categories: () => api.get('/tools/categories'),
  saveSession: (session) => api.post('/tools/sessions', session),
  history: (params = {}) => {
    const query = new URLSearchParams();
    if (params.tool_id) query.set('tool_id', params.tool_id);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString();
    return api.get(`/tools/sessions/history${qs ? `?${qs}` : ''}`);
  },
  getFavorites: () => api.get('/tools/favorites'),
  addFavorite: (toolId) => api.post(`/tools/favorites/${toolId}`),
  removeFavorite: (toolId) => api.delete(`/tools/favorites/${toolId}`),
  recentTools: () => api.get('/tools/sessions/recent-tools'),
  stats: () => api.get('/tools/sessions/stats'),
};
