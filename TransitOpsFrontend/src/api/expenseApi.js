import { mockExpenses } from '../mock/data';
import { generateId } from '../utils';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));
let expenses = [...mockExpenses];

export const expenseApi = {
  async getExpenses(params = {}) {
    await delay();
    return { data: expenses };
  },

  async getExpense(id) {
    await delay();
    const expense = expenses.find((e) => e.id === id);
    if (!expense) throw { response: { data: { message: 'Expense not found' } } };
    return { data: expense };
  },

  async createExpense(payload) {
    await delay();
    const newExpense = { ...payload, id: generateId(), createdAt: new Date().toISOString() };
    expenses = [...expenses, newExpense];
    return { data: newExpense };
  },

  async updateExpense(id, payload) {
    await delay();
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) throw { response: { data: { message: 'Expense not found' } } };
    expenses[idx] = { ...expenses[idx], ...payload };
    return { data: expenses[idx] };
  },

  async deleteExpense(id) {
    await delay();
    expenses = expenses.filter((e) => e.id !== id);
    return { data: { success: true } };
  },
};
