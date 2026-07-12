import api from './axios';

export const fuelApi = {
  async getFuelLogs() {
    const { data } = await api.get('/fuellogs');
    return { data };
  },

  async getFuelLog(id) {
    const { data } = await api.get(`/fuellogs/${id}`);
    return { data };
  },

  async createFuelLog(payload) {
    const { data } = await api.post('/fuellogs', payload);
    return { data };
  },

  async updateFuelLog(id, payload) {
    const { data } = await api.put(`/fuellogs/${id}`, payload);
    return { data };
  },

  async deleteFuelLog(id) {
    const { data } = await api.delete(`/fuellogs/${id}`);
    return { data };
  },
};
