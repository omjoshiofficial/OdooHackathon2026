import { mockFuelLogs } from '../mock/data';
import { generateId } from '../utils';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));
let fuelLogs = [...mockFuelLogs];

export const fuelApi = {
  async getFuelLogs(params = {}) {
    await delay();
    return { data: fuelLogs };
  },

  async getFuelLog(id) {
    await delay();
    const log = fuelLogs.find((f) => f.id === id);
    if (!log) throw { response: { data: { message: 'Fuel log not found' } } };
    return { data: log };
  },

  async createFuelLog(payload) {
    await delay();
    const totalCost = Number((payload.liters * payload.pricePerLiter).toFixed(2));
    const newLog = { ...payload, id: generateId(), totalCost, createdAt: new Date().toISOString() };
    fuelLogs = [...fuelLogs, newLog];
    return { data: newLog };
  },

  async updateFuelLog(id, payload) {
    await delay();
    const idx = fuelLogs.findIndex((f) => f.id === id);
    if (idx === -1) throw { response: { data: { message: 'Fuel log not found' } } };
    const totalCost = Number((payload.liters * payload.pricePerLiter).toFixed(2));
    fuelLogs[idx] = { ...fuelLogs[idx], ...payload, totalCost };
    return { data: fuelLogs[idx] };
  },

  async deleteFuelLog(id) {
    await delay();
    fuelLogs = fuelLogs.filter((f) => f.id !== id);
    return { data: { success: true } };
  },
};
