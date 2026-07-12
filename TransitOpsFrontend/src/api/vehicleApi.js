import api from './axios';

export const vehicleApi = {
  async getVehicles() {
    const { data } = await api.get('/vehicles');
    return { data };
  },

  async getVehicle(id) {
    const { data } = await api.get(`/vehicles/${id}`);
    return { data };
  },

  async createVehicle(payload) {
    const { data } = await api.post('/vehicles', payload);
    return { data };
  },

  async updateVehicle(id, payload) {
    const { data } = await api.put(`/vehicles/${id}`, payload);
    return { data };
  },

  async deleteVehicle(id) {
    const { data } = await api.delete(`/vehicles/${id}`);
    return { data };
  },

  async updateVehicleStatus(id, status) {
    const { data } = await api.patch(`/vehicles/${id}/status`, { status });
    return { data };
  },
};
