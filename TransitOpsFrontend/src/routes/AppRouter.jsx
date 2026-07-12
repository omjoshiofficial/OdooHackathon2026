import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, RoleRoute } from './guards';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import VehiclesPage from '../pages/vehicles/VehiclesPage';
import DriversPage from '../pages/drivers/DriversPage';
import TripsPage from '../pages/trips/TripsPage';
import MaintenancePage from '../pages/maintenance/MaintenancePage';
import FuelExpensePage from '../pages/fuel/FuelExpensePage';
import ReportsPage from '../pages/reports/ReportsPage';
import ProfilePage from '../pages/profile/ProfilePage';
import SettingsPage from '../pages/settings/SettingsPage';
import { ROUTES } from '../constants';

const AppRouter = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        {/* Dashboard — all roles */}
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

        {/* Fleet — Fleet Manager (full), Dispatcher (view), Financial Analyst (view) */}
        <Route element={<RoleRoute module="fleet" />}>
          <Route path={ROUTES.VEHICLES} element={<VehiclesPage />} />
        </Route>

        {/* Drivers — Fleet Manager (full), Safety Officer (full) */}
        <Route element={<RoleRoute module="drivers" />}>
          <Route path={ROUTES.DRIVERS} element={<DriversPage />} />
        </Route>

        {/* Trips — Dispatcher (full), Safety Officer (view) */}
        <Route element={<RoleRoute module="trips" />}>
          <Route path={ROUTES.TRIPS} element={<TripsPage />} />
        </Route>

        {/* Maintenance — no explicit RBAC module, accessible to all */}
        <Route path={ROUTES.MAINTENANCE} element={<MaintenancePage />} />

        {/* Fuel & Expenses — Financial Analyst (full), others no access */}
        <Route element={<RoleRoute module="fuel" />}>
          <Route path={ROUTES.FUEL} element={<FuelExpensePage />} />
          <Route path={ROUTES.EXPENSES} element={<FuelExpensePage />} />
        </Route>

        {/* Analytics — Fleet Manager (full), Financial Analyst (full) */}
        <Route element={<RoleRoute module="analytics" />}>
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        </Route>

        {/* Settings — Fleet Manager only */}
        <Route element={<RoleRoute module="settings" />}>
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* Profile — all roles */}
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRouter;
