import { mockMaintenance } from '../mock/data';
import { vehicleApi } from './vehicleApi';
import { generateId } from '../utils';
import { VEHICLE_STATUS } from '../constants';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));
let maintenance = [...mockMaintenance];

export const maintenanceApi = {
  async getMaintenance(params = {}) {
    await delay();
    return { data: maintenance };
  },

  async getMaintenanceById(id) {
    await delay();
    const record = maintenance.find((m) => m.id === id);
    if (!record) throw { response: { data: { message: 'Record not found' } } };
    return { data: record };
  },

  async createMaintenance(payload) {
    await delay();
    const newRecord = { ...payload, id: generateId(), createdAt: new Date().toISOString() };
    maintenance = [...maintenance, newRecord];
    if (payload.status === 'Open') {
      await vehicleApi.updateVehicleStatus(payload.vehicleId, VEHICLE_STATUS.IN_SHOP);
    }
    return { data: newRecord };
  },

  async updateMaintenance(id, payload) {
    await delay();
    const idx = maintenance.findIndex((m) => m.id === id);
    if (idx === -1) throw { response: { data: { message: 'Record not found' } } };
    const prev = maintenance[idx];
    maintenance[idx] = { ...prev, ...payload };
    if (payload.status === 'Open' && prev.status !== 'Open') {
      await vehicleApi.updateVehicleStatus(payload.vehicleId || prev.vehicleId, VEHICLE_STATUS.IN_SHOP);
    } else if (payload.status === 'Closed' && prev.status !== 'Closed') {
      const vehicles = vehicleApi.getVehiclesSync();
      const vehicle = vehicles.find((v) => v.id === (payload.vehicleId || prev.vehicleId));
      if (vehicle && vehicle.status !== VEHICLE_STATUS.RETIRED) {
        await vehicleApi.updateVehicleStatus(vehicle.id, VEHICLE_STATUS.AVAILABLE);
      }
    }
    return { data: maintenance[idx] };
  },

  async deleteMaintenance(id) {
    await delay();
    maintenance = maintenance.filter((m) => m.id !== id);
    return { data: { success: true } };
  },
};
