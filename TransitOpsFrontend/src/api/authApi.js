import api from './axios';

export const authApi = {
  async login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    return { data };
  },

  async logout() {
    return { data: { success: true } };
  },

  async getProfile() {
    const { data } = await api.get('/auth/profile');
    return { data };
  },

  async updateProfile(payload) {
    const { data } = await api.put('/auth/profile', payload);
    return { data };
  },

  async changePassword(payload) {
    const { data } = await api.post('/auth/change-password', payload);
    return { data };
  },

  async getUsers() {
    const { data } = await api.get('/auth/users');
    return { data };
  },

  async updateUserRole(id, role) {
    const { data } = await api.put(`/auth/users/${id}/role`, { role });
    return { data };
  },
};
