import api from './axios';

export const driverApi = {
  async getDrivers() {
    const { data } = await api.get('/drivers');
    return { data };
  },

  async getDriver(id) {
    const { data } = await api.get(`/drivers/${id}`);
    return { data };
  },

  async createDriver(payload) {
    const { data } = await api.post('/drivers', payload);
    return { data };
  },

  async updateDriver(id, payload) {
    const { data } = await api.put(`/drivers/${id}`, payload);
    return { data };
  },

  async deleteDriver(id) {
    const { data } = await api.delete(`/drivers/${id}`);
    return { data };
  },

  async updateDriverStatus(id, status) {
    const { data } = await api.patch(`/drivers/${id}/status`, { status });
    return { data };
  },
};
