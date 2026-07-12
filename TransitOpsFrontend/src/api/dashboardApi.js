import api from './axios';

export const dashboardApi = {
  async getStats() {
    const { data } = await api.get('/dashboard/stats');
    return { data };
  },

  async getChartData() {
    const { data } = await api.get('/dashboard/chart-data');
    return { data };
  },

  async getRecentActivity() {
    const { data } = await api.get('/dashboard/recent-activity');
    return { data };
  },
};
