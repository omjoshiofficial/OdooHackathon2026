export const mockUsers = [
  {
    id: 'u0',
    name: 'Super Admin',
    email: 'admin@transitops.com',
    password: 'admin123',
    role: 'Super Admin',
    avatar: null,
    phone: '+1 (555) 000-0000',
    department: 'Administration',
    joinedAt: '2020-01-01',
    notifications: { email: true, push: true, sms: true },
  },
  {
    id: 'u1',
    name: 'Alex Morgan',
    email: 'alex@transitops.com',
    password: 'password',
    role: 'Fleet Manager',
    avatar: null,
    phone: '+1 (555) 001-0001',
    department: 'Operations',
    joinedAt: '2022-01-15',
    notifications: { email: true, push: true, sms: false },
  },
  {
    id: 'u2',
    name: 'Jordan Lee',
    email: 'jordan@transitops.com',
    password: 'password',
    role: 'Dispatcher',
    avatar: null,
    phone: '+1 (555) 001-0002',
    department: 'Dispatch',
    joinedAt: '2022-03-20',
    notifications: { email: true, push: false, sms: true },
  },
  {
    id: 'u3',
    name: 'Sam Rivera',
    email: 'sam@transitops.com',
    password: 'password',
    role: 'Safety Officer',
    avatar: null,
    phone: '+1 (555) 001-0003',
    department: 'Safety',
    joinedAt: '2021-11-10',
    notifications: { email: true, push: true, sms: true },
  },
  {
    id: 'u4',
    name: 'Taylor Kim',
    email: 'taylor@transitops.com',
    password: 'password',
    role: 'Financial Analyst',
    avatar: null,
    phone: '+1 (555) 001-0004',
    department: 'Finance',
    joinedAt: '2023-02-01',
    notifications: { email: false, push: true, sms: false },
  },
];

export const mockVehicles = [
  { id: 'v1', registrationNumber: 'TRK-001', name: 'Freightliner Alpha', model: 'Cascadia 2022', type: 'Truck', maxLoadCapacity: 20000, currentOdometer: 145200, acquisitionCost: 185000, status: 'Available', createdAt: '2022-01-10' },
  { id: 'v2', registrationNumber: 'TRK-002', name: 'Kenworth Bravo', model: 'T680 2021', type: 'Truck', maxLoadCapacity: 22000, currentOdometer: 210500, acquisitionCost: 195000, status: 'On Trip', createdAt: '2021-06-15' },
  { id: 'v3', registrationNumber: 'VAN-001', name: 'Ford Transit Charlie', model: 'Transit 2023', type: 'Van', maxLoadCapacity: 3500, currentOdometer: 45000, acquisitionCost: 42000, status: 'Available', createdAt: '2023-03-01' },
  { id: 'v4', registrationNumber: 'BUS-001', name: 'Blue Bird Delta', model: 'Vision 2020', type: 'Bus', maxLoadCapacity: 5000, currentOdometer: 320000, acquisitionCost: 95000, status: 'In Shop', createdAt: '2020-08-20' },
  { id: 'v5', registrationNumber: 'TRK-003', name: 'Peterbilt Echo', model: '579 2022', type: 'Truck', maxLoadCapacity: 25000, currentOdometer: 98000, acquisitionCost: 210000, status: 'Available', createdAt: '2022-05-12' },
  { id: 'v6', registrationNumber: 'TNK-001', name: 'Volvo Foxtrot', model: 'VNL 2021', type: 'Tanker', maxLoadCapacity: 30000, currentOdometer: 175000, acquisitionCost: 220000, status: 'On Trip', createdAt: '2021-09-08' },
  { id: 'v7', registrationNumber: 'VAN-002', name: 'Mercedes Golf', model: 'Sprinter 2023', type: 'Van', maxLoadCapacity: 4000, currentOdometer: 28000, acquisitionCost: 55000, status: 'Available', createdAt: '2023-01-20' },
  { id: 'v8', registrationNumber: 'TRK-004', name: 'Mack Hotel', model: 'Anthem 2019', type: 'Truck', maxLoadCapacity: 18000, currentOdometer: 450000, acquisitionCost: 160000, status: 'Retired', createdAt: '2019-04-05' },
  { id: 'v9', registrationNumber: 'PKP-001', name: 'Toyota India', model: 'Hilux 2022', type: 'Pickup', maxLoadCapacity: 1500, currentOdometer: 62000, acquisitionCost: 38000, status: 'Available', createdAt: '2022-07-18' },
  { id: 'v10', registrationNumber: 'TRL-001', name: 'Great Dane Juliet', model: 'Everest 2021', type: 'Trailer', maxLoadCapacity: 35000, currentOdometer: 88000, acquisitionCost: 75000, status: 'Available', createdAt: '2021-12-01' },
];

export const mockDrivers = [
  { id: 'd1', name: 'Carlos Mendez', licenseNumber: 'DL-TX-001234', licenseCategory: 'CE', licenseExpiry: '2026-05-15', phone: '+1 (555) 100-0001', safetyScore: 95, status: 'Available', createdAt: '2021-03-10' },
  { id: 'd2', name: 'Maria Santos', licenseNumber: 'DL-TX-002345', licenseCategory: 'C', licenseExpiry: '2025-11-20', phone: '+1 (555) 100-0002', safetyScore: 88, status: 'On Trip', createdAt: '2020-07-22' },
  { id: 'd3', name: 'James Wilson', licenseNumber: 'DL-TX-003456', licenseCategory: 'CE', licenseExpiry: '2024-03-10', phone: '+1 (555) 100-0003', safetyScore: 72, status: 'Available', createdAt: '2022-01-05' },
  { id: 'd4', name: 'Priya Patel', licenseNumber: 'DL-TX-004567', licenseCategory: 'B', licenseExpiry: '2026-08-30', phone: '+1 (555) 100-0004', safetyScore: 98, status: 'Off Duty', createdAt: '2023-02-14' },
  { id: 'd5', name: 'Robert Chen', licenseNumber: 'DL-TX-005678', licenseCategory: 'CE', licenseExpiry: '2025-06-12', phone: '+1 (555) 100-0005', safetyScore: 91, status: 'On Trip', createdAt: '2021-09-30' },
  { id: 'd6', name: 'Lisa Thompson', licenseNumber: 'DL-TX-006789', licenseCategory: 'C', licenseExpiry: '2023-12-01', phone: '+1 (555) 100-0006', safetyScore: 65, status: 'Suspended', createdAt: '2020-04-18' },
  { id: 'd7', name: 'Ahmed Hassan', licenseNumber: 'DL-TX-007890', licenseCategory: 'CE', licenseExpiry: '2027-02-28', phone: '+1 (555) 100-0007', safetyScore: 94, status: 'Available', createdAt: '2022-11-11' },
  { id: 'd8', name: 'Sofia Garcia', licenseNumber: 'DL-TX-008901', licenseCategory: 'D', licenseExpiry: '2026-09-15', phone: '+1 (555) 100-0008', safetyScore: 87, status: 'Available', createdAt: '2023-05-07' },
];

export const mockTrips = [
  { id: 't1', source: 'Dallas, TX', destination: 'Houston, TX', vehicleId: 'v2', driverId: 'd2', cargoWeight: 15000, plannedDistance: 240, revenue: 3200, notes: 'Fragile cargo', status: 'Dispatched', createdAt: '2024-01-15', completedAt: null },
  { id: 't2', source: 'Houston, TX', destination: 'San Antonio, TX', vehicleId: 'v6', driverId: 'd5', cargoWeight: 28000, plannedDistance: 197, revenue: 4100, notes: 'Fuel tanker delivery', status: 'Dispatched', createdAt: '2024-01-15', completedAt: null },
  { id: 't3', source: 'Austin, TX', destination: 'El Paso, TX', vehicleId: 'v1', driverId: 'd1', cargoWeight: 18000, plannedDistance: 580, revenue: 7800, notes: '', status: 'Completed', createdAt: '2024-01-10', completedAt: '2024-01-12' },
  { id: 't4', source: 'Fort Worth, TX', destination: 'Lubbock, TX', vehicleId: 'v5', driverId: 'd7', cargoWeight: 22000, plannedDistance: 320, revenue: 4500, notes: 'Refrigerated goods', status: 'Completed', createdAt: '2024-01-08', completedAt: '2024-01-09' },
  { id: 't5', source: 'San Antonio, TX', destination: 'Corpus Christi, TX', vehicleId: 'v3', driverId: 'd4', cargoWeight: 2800, plannedDistance: 143, revenue: 1800, notes: '', status: 'Draft', createdAt: '2024-01-16', completedAt: null },
  { id: 't6', source: 'Dallas, TX', destination: 'Amarillo, TX', vehicleId: 'v9', driverId: 'd8', cargoWeight: 1200, plannedDistance: 360, revenue: 2200, notes: '', status: 'Cancelled', createdAt: '2024-01-05', completedAt: null },
  { id: 't7', source: 'Houston, TX', destination: 'Beaumont, TX', vehicleId: 'v7', driverId: 'd3', cargoWeight: 3200, plannedDistance: 85, revenue: 1100, notes: '', status: 'Completed', createdAt: '2024-01-12', completedAt: '2024-01-12' },
  { id: 't8', source: 'El Paso, TX', destination: 'Midland, TX', vehicleId: 'v10', driverId: 'd1', cargoWeight: 30000, plannedDistance: 290, revenue: 5600, notes: 'Heavy machinery', status: 'Completed', createdAt: '2024-01-03', completedAt: '2024-01-04' },
];

export const mockMaintenance = [
  { id: 'm1', vehicleId: 'v4', type: 'Engine Repair', description: 'Major engine overhaul required', date: '2024-01-10', cost: 8500, status: 'Open', createdAt: '2024-01-10' },
  { id: 'm2', vehicleId: 'v1', type: 'Oil Change', description: 'Routine oil and filter change', date: '2024-01-05', cost: 250, status: 'Closed', createdAt: '2024-01-05' },
  { id: 'm3', vehicleId: 'v2', type: 'Tire Replacement', description: 'Replace all 18 tires', date: '2023-12-20', cost: 4200, status: 'Closed', createdAt: '2023-12-20' },
  { id: 'm4', vehicleId: 'v5', type: 'Brake Service', description: 'Front brake pads and rotors', date: '2024-01-08', cost: 1800, status: 'Closed', createdAt: '2024-01-08' },
  { id: 'm5', vehicleId: 'v6', type: 'General Inspection', description: 'Annual DOT inspection', date: '2024-01-14', cost: 350, status: 'Closed', createdAt: '2024-01-14' },
  { id: 'm6', vehicleId: 'v3', type: 'AC Service', description: 'AC compressor replacement', date: '2024-01-16', cost: 1200, status: 'Open', createdAt: '2024-01-16' },
];

export const mockFuelLogs = [
  { id: 'f1', vehicleId: 'v1', date: '2024-01-15', liters: 450, pricePerLiter: 1.05, totalCost: 472.5, vendor: 'Shell Station #42', odometer: 145200, notes: '' },
  { id: 'f2', vehicleId: 'v2', date: '2024-01-14', liters: 520, pricePerLiter: 1.02, totalCost: 530.4, vendor: 'Pilot Flying J', odometer: 210500, notes: 'DEF added' },
  { id: 'f3', vehicleId: 'v5', date: '2024-01-13', liters: 480, pricePerLiter: 1.08, totalCost: 518.4, vendor: 'Love\'s Travel Stop', odometer: 98000, notes: '' },
  { id: 'f4', vehicleId: 'v6', date: '2024-01-12', liters: 600, pricePerLiter: 1.03, totalCost: 618, vendor: 'TA Travel Center', odometer: 175000, notes: 'Full tank' },
  { id: 'f5', vehicleId: 'v3', date: '2024-01-11', liters: 120, pricePerLiter: 1.12, totalCost: 134.4, vendor: 'BP Station', odometer: 45000, notes: '' },
  { id: 'f6', vehicleId: 'v7', date: '2024-01-10', liters: 95, pricePerLiter: 1.15, totalCost: 109.25, vendor: 'Chevron', odometer: 28000, notes: '' },
  { id: 'f7', vehicleId: 'v9', date: '2024-01-09', liters: 65, pricePerLiter: 1.18, totalCost: 76.7, vendor: 'ExxonMobil', odometer: 62000, notes: '' },
  { id: 'f8', vehicleId: 'v1', date: '2024-01-08', liters: 430, pricePerLiter: 1.04, totalCost: 447.2, vendor: 'Shell Station #42', odometer: 144800, notes: '' },
];

export const mockExpenses = [
  { id: 'e1', vehicleId: 'v4', tripId: null, type: 'Maintenance', amount: 8500, description: 'Engine overhaul', date: '2024-01-10', createdAt: '2024-01-10' },
  { id: 'e2', vehicleId: 'v1', tripId: 't3', type: 'Fuel', amount: 472.5, description: 'Fuel fill-up Dallas', date: '2024-01-15', createdAt: '2024-01-15' },
  { id: 'e3', vehicleId: 'v2', tripId: 't1', type: 'Toll', amount: 45, description: 'Highway tolls', date: '2024-01-15', createdAt: '2024-01-15' },
  { id: 'e4', vehicleId: 'v5', tripId: 't4', type: 'Parking', amount: 120, description: 'Overnight parking Lubbock', date: '2024-01-09', createdAt: '2024-01-09' },
  { id: 'e5', vehicleId: 'v6', tripId: 't2', type: 'Fuel', amount: 618, description: 'Fuel fill-up Houston', date: '2024-01-12', createdAt: '2024-01-12' },
  { id: 'e6', vehicleId: 'v1', tripId: null, type: 'Insurance', amount: 2400, description: 'Monthly insurance premium', date: '2024-01-01', createdAt: '2024-01-01' },
  { id: 'e7', vehicleId: 'v3', tripId: null, type: 'Repair', amount: 1200, description: 'AC compressor', date: '2024-01-16', createdAt: '2024-01-16' },
  { id: 'e8', vehicleId: 'v7', tripId: 't7', type: 'Misc', amount: 85, description: 'Driver meal allowance', date: '2024-01-12', createdAt: '2024-01-12' },
];

export const mockActivities = [
  { id: 'a1', type: 'trip', message: 'Trip TRK-002 dispatched to Houston', time: '2024-01-15T09:30:00', icon: 'truck' },
  { id: 'a2', type: 'maintenance', message: 'BUS-001 sent to shop for engine repair', time: '2024-01-15T08:15:00', icon: 'wrench' },
  { id: 'a3', type: 'driver', message: 'Driver Carlos Mendez completed trip', time: '2024-01-14T17:45:00', icon: 'user' },
  { id: 'a4', type: 'fuel', message: 'Fuel log added for TRK-001 — 450L', time: '2024-01-14T14:20:00', icon: 'fuel' },
  { id: 'a5', type: 'trip', message: 'Trip to El Paso marked as Completed', time: '2024-01-12T16:00:00', icon: 'check' },
  { id: 'a6', type: 'expense', message: 'Insurance expense $2,400 recorded', time: '2024-01-12T10:30:00', icon: 'dollar' },
];

export const mockMonthlyData = [
  { month: 'Aug', revenue: 42000, fuelCost: 8200, maintenanceCost: 3100, trips: 28 },
  { month: 'Sep', revenue: 48500, fuelCost: 9100, maintenanceCost: 2800, trips: 32 },
  { month: 'Oct', revenue: 51200, fuelCost: 9800, maintenanceCost: 4200, trips: 35 },
  { month: 'Nov', revenue: 46800, fuelCost: 8900, maintenanceCost: 3600, trips: 30 },
  { month: 'Dec', revenue: 53400, fuelCost: 10200, maintenanceCost: 5100, trips: 38 },
  { month: 'Jan', revenue: 58200, fuelCost: 11400, maintenanceCost: 3800, trips: 42 },
];

export const mockFleetUtilization = [
  { name: 'On Trip', value: 2, color: '#3b82f6' },
  { name: 'Available', value: 6, color: '#22c55e' },
  { name: 'In Shop', value: 1, color: '#f59e0b' },
  { name: 'Retired', value: 1, color: '#9ca3af' },
];
