import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { rbacStore, MODULES, ROLES } from '../../constants';
import { mockUsers } from '../../mock/data';

const PERMISSION_CYCLE = [null, 'view', 'full'];
const MODULE_LABELS = { fleet: 'Fleet', drivers: 'Drivers', trips: 'Trips', fuel: 'Fuel/Exp.', analytics: 'Analytics', settings: 'Settings' };
const ROLE_LIST = Object.values(ROLES);

const PermCell = ({ value, editable, onChange }) => {
  if (!editable) {
    if (value === 'full') return <span className="text-gray-200 font-bold text-base">✓</span>;
    if (value === 'view') return <span className="text-gray-400 text-xs font-medium">View</span>;
    return <span className="text-gray-600">—</span>;
  }
  const cycle = () => {
    const idx = PERMISSION_CYCLE.indexOf(value);
    onChange(PERMISSION_CYCLE[(idx + 1) % PERMISSION_CYCLE.length]);
  };
  return (
    <button onClick={cycle}
      className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors border ${
        value === 'full' ? 'border-green-500 text-green-400 hover:bg-green-900/30' :
        value === 'view' ? 'border-blue-500 text-blue-400 hover:bg-blue-900/30' :
        'border-gray-700 text-gray-600 hover:bg-gray-800'
      }`}>
      {value === 'full' ? '✓ Full' : value === 'view' ? 'View' : '—'}
    </button>
  );
};

const SettingsPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';

  const [depot,    setDepot]    = useState('Gandhinagar Depot GJ4');
  const [currency, setCurrency] = useState('INR (Rs.)');
  const [distUnit, setDistUnit] = useState('Kilometers');
  const [saving,   setSaving]   = useState(false);

  // Editable RBAC state — initialized from rbacStore
  const [rbac, setRbac] = useState(() =>
    ROLE_LIST.reduce((acc, role) => {
      acc[role] = { ...rbacStore[role] };
      return acc;
    }, {})
  );

  // User list with editable roles
  const [users, setUsers] = useState(() =>
    mockUsers.filter((u) => u.role !== 'Super Admin').map((u) => ({ ...u }))
  );
  const [userPage, setUserPage] = useState(1);
  const USER_PAGE_SIZE = 5;

  const handlePermChange = (role, module, val) => {
    setRbac((prev) => ({ ...prev, [role]: { ...prev[role], [module]: val } }));
  };

  const handleUserRoleChange = (userId, newRole) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    // Apply changes to live rbacStore
    ROLE_LIST.forEach((role) => {
      Object.assign(rbacStore[role], rbac[role]);
    });
    setSaving(false);
    toast.success('Settings saved.');
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings &amp; RBAC</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* LEFT — General */}
        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">General</p>
          <div className="space-y-3">
            <div>
              <label className="label">Depot Name</label>
              <input value={depot} onChange={(e) => setDepot(e.target.value)} className="input" placeholder="Depot name..." />
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input">
                <option>INR (Rs.)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="label">Distance Unit</label>
              <select value={distUnit} onChange={(e) => setDistUnit(e.target.value)} className="input">
                <option>Kilometers</option>
                <option>Miles</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* RIGHT — RBAC Table */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Role-Based Access (RBAC)
            </p>
            {isSuperAdmin && (
              <span className="text-xs text-orange-400 font-medium">Click cells to toggle permissions</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  {MODULES.map((m) => (
                    <th key={m} className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {MODULE_LABELS[m]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {ROLE_LIST.map((role) => (
                  <tr key={role} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-200 whitespace-nowrap">{role}</td>
                    {MODULES.map((m) => (
                      <td key={m} className="py-3 px-3 text-center">
                        <PermCell
                          value={rbac[role]?.[m] ?? null}
                          editable={isSuperAdmin}
                          onChange={(val) => handlePermChange(role, m, val)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="text-green-400 font-bold">✓</span> Full Access</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="text-blue-400 text-xs font-medium">View</span> Read Only</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="text-gray-600">—</span> No Access</span>
          </div>
        </div>
      </div>

      {/* User Role Management — Super Admin only */}
      {isSuperAdmin && (
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            User Role Management
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.slice((userPage - 1) * USER_PAGE_SIZE, userPage * USER_PAGE_SIZE).map((u) => (
                  <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-200">{u.name}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{u.email}</td>
                    <td className="py-3 px-3 text-gray-400 text-xs">{u.department}</td>
                    <td className="py-3 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                        className="input py-1 px-2 text-xs w-40"
                      >
                        {ROLE_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            {users.length > USER_PAGE_SIZE && (() => {
              const totalPages = Math.ceil(users.length / USER_PAGE_SIZE);
              return (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 mr-2">
                    {(userPage - 1) * USER_PAGE_SIZE + 1}–{Math.min(userPage * USER_PAGE_SIZE, users.length)} of {users.length}
                  </span>
                  <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1}
                    className="px-2.5 py-1 rounded text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 hover:bg-gray-800 transition-colors">
                    ‹ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setUserPage(p)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        p === userPage ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}>{p}</button>
                  ))}
                  <button onClick={() => setUserPage((p) => Math.min(totalPages, p + 1))} disabled={userPage === totalPages}
                    className="px-2.5 py-1 rounded text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 hover:bg-gray-800 transition-colors">
                    Next ›
                  </button>
                </div>
              );
            })()}
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 ml-auto">
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
