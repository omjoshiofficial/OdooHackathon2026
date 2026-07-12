import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { vehicleApi } from '../api/vehicleApi';
import { driverApi } from '../api/driverApi';
import { tripApi } from '../api/tripApi';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    vehicleApi.getVehicles().then((r) => setVehicles(r.data)).catch(() => {});
    driverApi.getDrivers().then((r) => setDrivers(r.data)).catch(() => {});
    tripApi.getTrips().then((r) => setTrips(r.data)).catch(() => {});
  }, [isAuthenticated, loading]);

  const addTrip = useCallback((trip) => setTrips((prev) => [...prev, trip]), []);
  const updateTrip = useCallback((updated) =>
    setTrips((prev) => prev.map((t) => t.id === updated.id ? updated : t)), []);
  const refreshVehicles = useCallback((list) => setVehicles(list), []);
  const refreshDrivers = useCallback((list) => setDrivers(list), []);

  return (
    <AppDataContext.Provider value={{ trips, vehicles, drivers, addTrip, updateTrip, refreshVehicles, refreshDrivers }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
};
