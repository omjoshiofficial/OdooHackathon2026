import api from './axios';

export const expenseApi = {
  async getExpenses() {
    const { data } = await api.get('/expenses');
    return { data };
  },

  async getExpense(id) {
    const { data } = await api.get(`/expenses/${id}`);
    return { data };
  },

  async createExpense(payload) {
    const { data } = await api.post('/expenses', payload);
    return { data };
  },

  async updateExpense(id, payload) {
    const { data } = await api.put(`/expenses/${id}`, payload);
    return { data };
  },

  async deleteExpense(id) {
    const { data } = await api.delete(`/expenses/${id}`);
    return { data };
  },
};
