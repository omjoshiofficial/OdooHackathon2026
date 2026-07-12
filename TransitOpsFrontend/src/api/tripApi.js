import { mockTrips } from '../mock/data';
import { vehicleApi } from './vehicleApi';
import { driverApi } from './driverApi';
import { generateId } from '../utils';
import { VEHICLE_STATUS, DRIVER_STATUS } from '../constants';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));
let trips = [...mockTrips];

const validateDispatch = (vehicle, driver, cargoWeight) => {
  const blockedVehicleStatuses = [VEHICLE_STATUS.IN_SHOP, VEHICLE_STATUS.RETIRED, VEHICLE_STATUS.ON_TRIP];
  if (blockedVehicleStatuses.includes(vehicle.status))
    throw { response: { data: { message: `Vehicle is ${vehicle.status} and cannot be assigned.` } } };
  if (driver.status === DRIVER_STATUS.ON_TRIP)
    throw { response: { data: { message: 'Driver is already on a trip.' } } };
  if (driver.status === DRIVER_STATUS.SUSPENDED)
    throw { response: { data: { message: 'Driver is suspended and cannot be assigned.' } } };
  if (new Date(driver.licenseExpiry) < new Date())
    throw { response: { data: { message: 'Driver license is expired.' } } };
  if (Number(cargoWeight) > Number(vehicle.maxLoadCapacity))
    throw { response: { data: { message: `Cargo weight exceeds vehicle capacity of ${vehicle.maxLoadCapacity} kg.` } } };
};

export const tripApi = {
  async getTrips(params = {}) {
    await delay();
    return { data: trips };
  },

  async getTrip(id) {
    await delay();
    const trip = trips.find((t) => t.id === id);
    if (!trip) throw { response: { data: { message: 'Trip not found' } } };
    return { data: trip };
  },

  async createTrip(payload) {
    await delay();
    const newTrip = { ...payload, id: generateId(), status: 'Draft', createdAt: new Date().toISOString(), completedAt: null };
    trips = [...trips, newTrip];
    return { data: newTrip };
  },

  async updateTrip(id, payload) {
    await delay();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) throw { response: { data: { message: 'Trip not found' } } };
    trips[idx] = { ...trips[idx], ...payload };
    return { data: trips[idx] };
  },

  async dispatchTrip(id) {
    await delay();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) throw { response: { data: { message: 'Trip not found' } } };
    const trip = trips[idx];
    const vehicles = vehicleApi.getVehiclesSync();
    const drivers = driverApi.getDriversSync();
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);
    if (!vehicle) throw { response: { data: { message: 'Vehicle not found.' } } };
    if (!driver) throw { response: { data: { message: 'Driver not found.' } } };
    validateDispatch(vehicle, driver, trip.cargoWeight);
    trips[idx] = { ...trips[idx], status: 'Dispatched' };
    await vehicleApi.updateVehicleStatus(trip.vehicleId, VEHICLE_STATUS.ON_TRIP);
    await driverApi.updateDriverStatus(trip.driverId, DRIVER_STATUS.ON_TRIP);
    return { data: trips[idx] };
  },

  async completeTrip(id) {
    await delay();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) throw { response: { data: { message: 'Trip not found' } } };
    const trip = trips[idx];
    trips[idx] = { ...trips[idx], status: 'Completed', completedAt: new Date().toISOString() };
    await vehicleApi.updateVehicleStatus(trip.vehicleId, VEHICLE_STATUS.AVAILABLE);
    await driverApi.updateDriverStatus(trip.driverId, DRIVER_STATUS.AVAILABLE);
    return { data: trips[idx] };
  },

  async cancelTrip(id) {
    await delay();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) throw { response: { data: { message: 'Trip not found' } } };
    const trip = trips[idx];
    trips[idx] = { ...trips[idx], status: 'Cancelled' };
    if (trip.status === 'Dispatched') {
      await vehicleApi.updateVehicleStatus(trip.vehicleId, VEHICLE_STATUS.AVAILABLE);
      await driverApi.updateDriverStatus(trip.driverId, DRIVER_STATUS.AVAILABLE);
    }
    return { data: trips[idx] };
  },

  async deleteTrip(id) {
    await delay();
    trips = trips.filter((t) => t.id !== id);
    return { data: { success: true } };
  },

  getTripsSync: () => trips,
};
