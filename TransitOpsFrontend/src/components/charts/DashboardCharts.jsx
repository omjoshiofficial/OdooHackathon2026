import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--tooltip-bg, #fff)',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
};

export const RevenueAreaChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
      <Tooltip {...tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
      <Area type="monotone" dataKey="fuelCost" name="Fuel Cost" stroke="#f59e0b" strokeWidth={2} fill="url(#fuelGrad)" />
    </AreaChart>
  </ResponsiveContainer>
);

export const TripBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip {...tooltipStyle} />
      <Bar dataKey="trips" name="Trips" fill="#6366f1" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const CostLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
      <Tooltip {...tooltipStyle} formatter={(v) => [`$${v.toLocaleString()}`, undefined]} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      <Line type="monotone" dataKey="maintenanceCost" name="Maintenance" stroke="#ef4444" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="fuelCost" name="Fuel" stroke="#f59e0b" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export const FleetPieChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip {...tooltipStyle} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
    </PieChart>
  </ResponsiveContainer>
);
