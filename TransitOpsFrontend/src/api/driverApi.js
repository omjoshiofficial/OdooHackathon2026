import { mockDrivers } from '../mock/data';
import { generateId } from '../utils';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));
let drivers = [...mockDrivers];

export const driverApi = {
  async getDrivers(params = {}) {
    await delay();
    return { data: drivers };
  },

  async getDriver(id) {
    await delay();
    const driver = drivers.find((d) => d.id === id);
    if (!driver) throw { response: { data: { message: 'Driver not found' } } };
    return { data: driver };
  },

  async createDriver(payload) {
    await delay();
    const exists = drivers.find((d) => d.licenseNumber === payload.licenseNumber);
    if (exists) throw { response: { data: { message: 'License number already exists.' } } };
    const newDriver = { ...payload, id: generateId(), createdAt: new Date().toISOString() };
    drivers = [...drivers, newDriver];
    return { data: newDriver };
  },

  async updateDriver(id, payload) {
    await delay();
    const idx = drivers.findIndex((d) => d.id === id);
    if (idx === -1) throw { response: { data: { message: 'Driver not found' } } };
    drivers[idx] = { ...drivers[idx], ...payload };
    return { data: drivers[idx] };
  },

  async deleteDriver(id) {
    await delay();
    drivers = drivers.filter((d) => d.id !== id);
    return { data: { success: true } };
  },

  async updateDriverStatus(id, status) {
    await delay();
    const idx = drivers.findIndex((d) => d.id === id);
    if (idx !== -1) drivers[idx] = { ...drivers[idx], status };
    return { data: drivers[idx] };
  },

  getDriversSync: () => drivers,
};
