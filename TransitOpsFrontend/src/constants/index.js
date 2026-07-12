export const APP_NAME = 'TransitOps';

export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const VEHICLE_STATUS = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
};

export const DRIVER_STATUS = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
};

export const TRIP_STATUS = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const MAINTENANCE_STATUS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
};

export const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Pickup', 'Tanker', 'Trailer', 'Motorcycle'];

export const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'CE', 'DE'];

export const EXPENSE_TYPES = ['Fuel', 'Maintenance', 'Repair', 'Insurance', 'Parking', 'Toll', 'Misc'];

export const MAINTENANCE_TYPES = [
  'Oil Change',
  'Tire Replacement',
  'Brake Service',
  'Engine Repair',
  'Transmission Service',
  'Battery Replacement',
  'AC Service',
  'General Inspection',
  'Body Repair',
];

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  VEHICLES: '/vehicles',
  DRIVERS: '/drivers',
  TRIPS: '/trips',
  MAINTENANCE: '/maintenance',
  FUEL: '/fuel',
  EXPENSES: '/expenses',
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export const ITEMS_PER_PAGE = 10;

export const MODULES = ['fleet', 'drivers', 'trips', 'fuel', 'analytics', 'settings'];

// Mutable RBAC store — Super Admin can edit this at runtime
export const rbacStore = {
  'Fleet Manager':    { fleet: 'full', drivers: 'full', trips: null,   fuel: null,   analytics: 'full', settings: 'full' },
  'Dispatcher':       { fleet: 'view', drivers: null,   trips: 'full', fuel: null,   analytics: null,   settings: null   },
  'Safety Officer':   { fleet: null,   drivers: 'full', trips: 'view', fuel: null,   analytics: null,   settings: null   },
  'Financial Analyst':{ fleet: 'view', drivers: null,   trips: null,   fuel: 'full', analytics: 'full', settings: null   },
};

export const RBAC = rbacStore;

export const canAccess = (role, module) => {
  if (role === 'Super Admin') return 'full';   // Super Admin bypasses all checks
  return rbacStore[role]?.[module] ?? null;
};

export const STATUS_COLORS = {
  Available: 'green',
  'On Trip': 'blue',
  'In Shop': 'yellow',
  Retired: 'gray',
  'Off Duty': 'gray',
  Suspended: 'red',
  Draft: 'gray',
  Dispatched: 'blue',
  Completed: 'green',
  Cancelled: 'red',
  Open: 'yellow',
  Closed: 'green',
};
