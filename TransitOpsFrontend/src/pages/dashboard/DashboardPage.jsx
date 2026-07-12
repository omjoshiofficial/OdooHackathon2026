import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import StatusBadge from '../../components/common/StatusBadge';

/* ── tiny helpers ── */
const S = ({ label, value, accent }) => (
  <div className="flex flex-col px-4 py-3 rounded" style={{ background: '#121212', border: '1px solid #4c5359', minWidth: 0 }}>
    <div className="w-1 h-full absolute left-0 top-0 rounded-l" style={{ background: accent }} />
    <span className="text-xs mb-1" style={{ color: '#6e757c' }}>{label}</span>
    <span className="text-2xl font-bold" style={{ color: '#d3d3d3' }}>{value}</span>
  </div>
);

const ACCENT = { blue: '#5a89bc', green: '#39994b', orange: '#b86200', red: '#ff8383' };

const DashboardPage = () => {
  const [stats, setStats]   = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState(null);
  const [filters, setFilters] = useState({ vehicleType: 'All', status: 'All', region: 'All' });

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), dashboardApi.getChartData(), dashboardApi.getRecentActivity()])
      .then(([s, c, r]) => { setStats(s.data); setCharts(c.data); setRecent(r.data); })
      .catch(() => {});
  }, []);

  const setF = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));

  const sel = (val) => (
    <div className="relative">
      <select
        value={val === 'All' ? 'All' : val}
        onChange={() => {}}
        className="appearance-none text-xs px-3 py-1.5 rounded pr-6"
        style={{ background: '#121212', border: '1px solid #4c5359', color: '#a4aab0', outline: 'none' }}
      >
        <option>All</option>
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#6e757c' }}>▾</span>
    </div>
  );

  return (
    <div className="p-4 space-y-4" style={{ background: '#121212', minHeight: '100%' }}>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium" style={{ color: '#6e757c' }}>FILTERS</span>
        <div className="relative">
          <select onChange={setF('vehicleType')} className="appearance-none text-xs px-3 py-1.5 rounded pr-6"
            style={{ background: '#121212', border: '1px solid #4c5359', color: '#a4aab0', outline: 'none' }}>
            {['All','Truck','Van','Bus','Pickup','Tanker'].map((o) => <option key={o}>{o === 'All' ? 'Vehicle Type: All' : o}</option>)}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#6e757c' }}>▾</span>
        </div>
        <div className="relative">
          <select onChange={setF('status')} className="appearance-none text-xs px-3 py-1.5 rounded pr-6"
            style={{ background: '#121212', border: '1px solid #4c5359', color: '#a4aab0', outline: 'none' }}>
            {['All','Available','On Trip','In Shop','Retired'].map((o) => <option key={o}>{o === 'All' ? 'Status: All' : o}</option>)}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#6e757c' }}>▾</span>
        </div>
        <div className="relative">
          <select onChange={setF('region')} className="appearance-none text-xs px-3 py-1.5 rounded pr-6"
            style={{ background: '#121212', border: '1px solid #4c5359', color: '#a4aab0', outline: 'none' }}>
            {['All','North','South','East','West'].map((o) => <option key={o}>{o === 'All' ? 'Region: All' : o}</option>)}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: '#6e757c' }}>▾</span>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-7 gap-3">
        {[
          { label: 'ACTIVE VEHICLES',       value: stats?.activeVehicles      ?? '—', accent: ACCENT.blue   },
          { label: 'AVAILABLE VEHICLES',    value: stats?.availableVehicles   ?? '—', accent: ACCENT.green  },
          { label: 'VEHICLES IN MAINTENANCE', value: stats?.vehiclesInShop    ?? '—', accent: ACCENT.orange },
          { label: 'ACTIVE TRIPS',          value: stats?.activeTrips         ?? '—', accent: ACCENT.blue   },
          { label: 'PENDING TRIPS',         value: stats?.pendingTrips        ?? '—', accent: ACCENT.blue   },
          { label: 'DRIVERS ON DUTY',       value: stats?.driversOnTrip       ?? '—', accent: ACCENT.green  },
          { label: 'FLEET UTILIZATION',     value: stats ? `${stats.fleetUtilization}%` : '—', accent: ACCENT.green },
        ].map(({ label, value, accent }) => (
          <div key={label} className="relative flex flex-col px-3 py-3 rounded overflow-hidden"
            style={{ background: '#121212', border: '1px solid #4c5359' }}>
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ background: accent }} />
            <span className="text-xs mb-2 pl-1" style={{ color: '#6e757c' }}>{label}</span>
            <span className="text-2xl font-bold pl-1" style={{ color: '#d3d3d3' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Bottom: Recent Trips + Vehicle Status */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent Trips table — spans 2 cols */}
        <div className="col-span-2 rounded" style={{ background: '#121212', border: '1px solid #4c5359' }}>
          <div className="px-4 py-3">
            <span className="text-xs font-medium" style={{ color: '#a4aab0' }}>RECENT TRIPS</span>
          </div>

          {/* Header */}
          <div className="grid px-4 pb-2" style={{ gridTemplateColumns: '1fr 1fr 1fr 1.2fr 1fr', borderBottom: '1px solid #292c30' }}>
            {['TRIP','VEHICLE','DRIVER','STATUS','ETA'].map((h) => (
              <span key={h} className="text-xs" style={{ color: '#6e757c' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {recent?.recentTrips?.slice(0, 4).map((trip, i) => (
            <div
              key={trip.id}
              className="grid px-4 py-2.5"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr 1.2fr 1fr',
                borderBottom: i < 3 ? '1px solid #1b1d1f' : 'none',
              }}
            >
              <span className="text-xs" style={{ color: '#d3d3d3' }}>{trip.id?.toUpperCase()}</span>
              <span className="text-xs" style={{ color: '#d3d3d3' }}>{trip.vehicleId?.toUpperCase()}</span>
              <span className="text-xs" style={{ color: '#d3d3d3' }}>{trip.driverName ?? trip.driverId}</span>
              <StatusBadge status={trip.status} size="xs" />
              <span className="text-xs" style={{ color: '#d3d3d3' }}>
                {trip.status === 'Dispatched' ? '45 min' : trip.status === 'Draft' ? 'Awaiting vehicle' : '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Vehicle Status bar chart */}
        <div className="rounded p-4" style={{ background: '#121212', border: '1px solid #4c5359' }}>
          <span className="text-xs font-medium block mb-4" style={{ color: '#a4aab0' }}>FLEET UTILIZATION</span>
          <div className="space-y-3">
            {(charts?.fleetUtilization ?? []).map(({ name, value, color }) => {
              const total = (charts?.fleetUtilization ?? []).reduce((s, i) => s + i.value, 0);
              const pct = total > 0 ? Math.round((value / total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: '#a4aab0' }}>{name}</span>
                    <span className="text-xs" style={{ color: '#6e757c' }}>{value} ({pct}%)</span>
                  </div>
                  <div className="h-3 rounded" style={{ background: '#202325' }}>
                    <div className="h-3 rounded" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
