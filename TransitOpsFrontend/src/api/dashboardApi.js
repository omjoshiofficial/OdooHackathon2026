import { mockVehicles, mockDrivers, mockTrips, mockFuelLogs, mockExpenses, mockMaintenance, mockMonthlyData, mockFleetUtilization, mockActivities } from '../mock/data';

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms));

export const dashboardApi = {
  async getStats() {
    await delay();
    const activeVehicles = mockVehicles.filter((v) => v.status !== 'Retired').length;
    const availableVehicles = mockVehicles.filter((v) => v.status === 'Available').length;
    const vehiclesInShop = mockVehicles.filter((v) => v.status === 'In Shop').length;
    const driversAvailable = mockDrivers.filter((d) => d.status === 'Available').length;
    const driversOnTrip = mockDrivers.filter((d) => d.status === 'On Trip').length;
    const activeTrips = mockTrips.filter((t) => t.status === 'Dispatched').length;
    const pendingTrips = mockTrips.filter((t) => t.status === 'Draft').length;
    const fleetUtilization = Math.round((mockVehicles.filter((v) => v.status === 'On Trip').length / activeVehicles) * 100);
    const totalRevenue = mockTrips.filter((t) => t.status === 'Completed').reduce((s, t) => s + t.revenue, 0);
    const totalFuelCost = mockFuelLogs.reduce((s, f) => s + f.totalCost, 0);
    const totalMaintenanceCost = mockMaintenance.reduce((s, m) => s + m.cost, 0);
    const totalOperationalCost = mockExpenses.reduce((s, e) => s + e.amount, 0);

    return {
      data: {
        activeVehicles, availableVehicles, vehiclesInShop,
        driversAvailable, driversOnTrip,
        activeTrips, pendingTrips, fleetUtilization,
        totalRevenue, totalFuelCost, totalMaintenanceCost, totalOperationalCost,
      },
    };
  },

  async getChartData() {
    await delay();
    return { data: { monthly: mockMonthlyData, fleetUtilization: mockFleetUtilization } };
  },

  async getRecentActivity() {
    await delay();
    return {
      data: {
        recentTrips: mockTrips.slice(0, 5),
        recentExpenses: mockExpenses.slice(0, 5),
        recentMaintenance: mockMaintenance.slice(0, 4),
        activities: mockActivities,
        upcomingLicenseExpiry: mockDrivers
          .filter((d) => {
            const exp = new Date(d.licenseExpiry);
            const threshold = new Date();
            threshold.setDate(threshold.getDate() + 60);
            return exp <= threshold;
          })
          .sort((a, b) => new Date(a.licenseExpiry) - new Date(b.licenseExpiry)),
      },
    };
  },
};
