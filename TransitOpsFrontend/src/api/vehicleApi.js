import { mockVehicles } from '../mock/data';
import { generateId } from '../utils';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));
let vehicles = [...mockVehicles];

export const vehicleApi = {
  async getVehicles(params = {}) {
    await delay();
    return { data: vehicles };
  },

  async getVehicle(id) {
    await delay();
    const vehicle = vehicles.find((v) => v.id === id);
    if (!vehicle) throw { response: { data: { message: 'Vehicle not found' } } };
    return { data: vehicle };
  },

  async createVehicle(payload) {
    await delay();
    const exists = vehicles.find((v) => v.registrationNumber === payload.registrationNumber);
    if (exists) throw { response: { data: { message: 'Registration number already exists.' } } };
    const newVehicle = { ...payload, id: generateId(), createdAt: new Date().toISOString() };
    vehicles = [...vehicles, newVehicle];
    return { data: newVehicle };
  },

  async updateVehicle(id, payload) {
    await delay();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw { response: { data: { message: 'Vehicle not found' } } };
    const duplicate = vehicles.find((v) => v.registrationNumber === payload.registrationNumber && v.id !== id);
    if (duplicate) throw { response: { data: { message: 'Registration number already exists.' } } };
    vehicles[idx] = { ...vehicles[idx], ...payload };
    return { data: vehicles[idx] };
  },

  async deleteVehicle(id) {
    await delay();
    vehicles = vehicles.filter((v) => v.id !== id);
    return { data: { success: true } };
  },

  async updateVehicleStatus(id, status) {
    await delay();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx !== -1) vehicles[idx] = { ...vehicles[idx], status };
    return { data: vehicles[idx] };
  },

  getVehiclesSync: () => vehicles,
};
