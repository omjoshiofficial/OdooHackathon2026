import api from './axios';

export const tripApi = {
  async getTrips() {
    const { data } = await api.get('/trips');
    return { data };
  },

  async getTrip(id) {
    const { data } = await api.get(`/trips/${id}`);
    return { data };
  },

  async createTrip(payload) {
    const { data } = await api.post('/trips', payload);
    return { data };
  },

  async updateTrip(id, payload) {
    const { data } = await api.put(`/trips/${id}`, payload);
    return { data };
  },

  async dispatchTrip(id) {
    const { data } = await api.post(`/trips/${id}/dispatch`);
    return { data };
  },

  async completeTrip(id) {
    const { data } = await api.post(`/trips/${id}/complete`);
    return { data };
  },

  async cancelTrip(id) {
    const { data } = await api.post(`/trips/${id}/cancel`);
    return { data };
  },

  async deleteTrip(id) {
    const { data } = await api.delete(`/trips/${id}`);
    return { data };
  },
};
