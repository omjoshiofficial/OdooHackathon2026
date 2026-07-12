import api from './axios';

export const maintenanceApi = {
  async getMaintenance() {
    const { data } = await api.get('/maintenance');
    return { data };
  },

  async getMaintenanceById(id) {
    const { data } = await api.get(`/maintenance/${id}`);
    return { data };
  },

  async createMaintenance(payload) {
    const { data } = await api.post('/maintenance', payload);
    return { data };
  },

  async updateMaintenance(id, payload) {
    const { data } = await api.put(`/maintenance/${id}`, payload);
    return { data };
  },

  async deleteMaintenance(id) {
    const { data } = await api.delete(`/maintenance/${id}`);
    return { data };
  },
};
