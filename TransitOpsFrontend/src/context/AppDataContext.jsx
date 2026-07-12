import { createContext, useContext, useState, useCallback } from 'react';
import { mockTrips, mockVehicles, mockDrivers } from '../mock/data';

const AppDataContext = createContext(null);

export const AppDataProvider = ({ children }) => {
  const [trips, setTrips] = useState(mockTrips);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [drivers, setDrivers] = useState(mockDrivers);

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
