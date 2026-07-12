import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Route, Wrench,
  Fuel, BarChart3, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, canAccess } from '../../constants';

const NAV = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: ROUTES.DASHBOARD,  module: null       },
  { label: 'Fleet',           icon: Truck,           to: ROUTES.VEHICLES,   module: 'fleet'    },
  { label: 'Drivers',         icon: Users,           to: ROUTES.DRIVERS,    module: 'drivers'  },
  { label: 'Trips',           icon: Route,           to: ROUTES.TRIPS,      module: 'trips'    },
  { label: 'Maintenance',     icon: Wrench,          to: ROUTES.MAINTENANCE,module: null       },
  { label: 'Fuel & Expenses', icon: Fuel,            to: ROUTES.FUEL,       module: 'fuel'     },
  { label: 'Analytics',       icon: BarChart3,       to: ROUTES.REPORTS,    module: 'analytics'},
  { label: 'Settings',        icon: Settings,        to: ROUTES.SETTINGS,   module: 'settings' },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const visibleNav = NAV.filter(({ module }) => {
    if (user?.role === 'Super Admin') return true;  // Super Admin sees everything
    if (!module) return true;
    return canAccess(user?.role, module) !== null;
  });

  return (
    <aside className="fixed left-0 top-0 h-full w-48 flex flex-col z-30" style={{ background: '#1b1d1f', borderRight: '1px solid #a4aab0' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 shrink-0">
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0" style={{ background: '#955600' }}>
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="font-bold text-sm" style={{ color: '#d3d3d3' }}>TransitOps</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {visibleNav.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-colors ${
                isActive
                  ? 'font-medium'
                  : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? '#352109' : 'transparent',
              border: isActive ? '1px solid #b86200' : '1px solid transparent',
              color: isActive ? '#d3d3d3' : '#a4aab0',
            })}
          >
            <Icon size={14} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 shrink-0" style={{ borderTop: '1px solid #292c30' }}>
        <button
          onClick={async () => { await logout(); navigate(ROUTES.LOGIN); }}
          className="flex items-center gap-2.5 px-3 py-2 rounded text-xs w-full hover:opacity-80 transition-colors"
          style={{ color: '#a4aab0' }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
