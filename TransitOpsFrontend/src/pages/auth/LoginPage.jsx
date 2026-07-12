import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROUTES } from '../../constants';

const ROLE_LIST = [
  { role: 'Super Admin',           email: 'admin@transitops.com',   access: 'All Modules' },
  { role: ROLES.FLEET_MANAGER,     email: 'alex@transitops.com',    access: 'Fleet, Maintenance' },
  { role: ROLES.DISPATCHER,        email: 'jordan@transitops.com',  access: 'Dashboard, Trips' },
  { role: ROLES.SAFETY_OFFICER,    email: 'sam@transitops.com',     access: 'Drivers, Compliance' },
  { role: ROLES.FINANCIAL_ANALYST, email: 'taylor@transitops.com',  access: 'Fuel & Expenses, Analytics' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: localStorage.getItem('transitops_remember') || '',
    password: 'password',
    role: ROLES.DISPATCHER,
    rememberMe: !!localStorage.getItem('transitops_remember'),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [failCount, setFailCount] = useState(0);

  const [detectedRole, setDetectedRole] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
    if (name === 'email') {
      const matched = ROLE_LIST.find((r) => r.email.toLowerCase() === value.toLowerCase());
      if (matched) {
        setDetectedRole(matched.role);
        setForm((p) => ({ ...p, email: value, role: matched.role }));
      } else {
        setDetectedRole('');
      }
    }
  };

  const handleRoleChange = (e) => {
    const selected = ROLE_LIST.find((r) => r.role === e.target.value);
    if (selected) setForm((p) => ({ ...p, role: selected.role, email: selected.email }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (failCount >= 5) { setErrors({ form: 'Account locked after 5 failed attempts.' }); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form);
      if (form.rememberMe) localStorage.setItem('transitops_remember', form.email);
      else localStorage.removeItem('transitops_remember');
      toast.success('Welcome back!');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const next = failCount + 1;
      setFailCount(next);
      setErrors({ form: next >= 5 ? 'Account locked after 5 failed attempts.' : (err?.response?.data?.message || 'Invalid credentials.') });
    } finally {
      setLoading(false);
    }
  };

  const locked = failCount >= 5;

  return (
    <div className="min-h-screen flex" style={{ background: '#121212' }}>

      {/* ── Left branding panel ── */}
      <div className="w-72 flex-shrink-0 flex flex-col p-6" style={{ background: '#d7dade', borderRight: '1px solid #c5cbd1' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded flex items-center justify-center" style={{ background: '#955600' }}>
            <span className="text-white font-bold text-lg">T</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-2" style={{ color: '#121212' }}>TransitOps</h1>
        <p className="text-xs mt-0.5" style={{ color: '#5b636a' }}>Smart Transport Operations Platform</p>

        <div className="mt-8">
          <p className="text-sm font-medium mb-3" style={{ color: '#282720' }}>One login, four roles:</p>
          <ul className="space-y-2.5">
            {ROLE_LIST.map(({ role }) => (
              <li key={role} className="flex items-center gap-2 text-sm" style={{ color: '#282720' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#955600' }} />
                {role}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <p className="text-xs" style={{ color: '#8c959d' }}>TRANSITOPS © 2026 · RBAC ENABLED</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#121212' }}>
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-1" style={{ color: '#d3d3d3' }}>Sign in to your account</h2>
          <p className="text-xs mb-6" style={{ color: '#6e757c' }}>Enter your credentials to continue</p>

          {/* Error callout */}
          {errors.form && (
            <div className="mb-4 p-3 rounded" style={{ border: '1px dashed #ff8383', background: '#1f1717' }}>
              <p className="text-xs font-medium" style={{ color: '#ff8383' }}>Error state</p>
              <p className="text-xs mt-0.5" style={{ color: '#ff8383' }}>❌ {errors.form}</p>
              {locked && <p className="text-xs" style={{ color: '#ff8383' }}>Account locked after 5 failed attempts.</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6e757c' }}>EMAIL</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Raven.k@transitops.in" autoComplete="email"
                className="w-full px-3 py-2 rounded text-sm"
                style={{ background: '#121212', border: `1px solid ${errors.email ? '#ff8383' : '#4c5359'}`, color: '#4c5359', outline: 'none' }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#ff8383' }}>{errors.email}</p>}
              {detectedRole && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#39994b' }}>
                  ✓ Role detected: <span className="font-semibold">{detectedRole}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6e757c' }}>PASSWORD</label>
              <div className="relative">
                <input
                  name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="••••••••" autoComplete="current-password"
                  className="w-full px-3 py-2 rounded text-sm pr-9"
                  style={{ background: '#121212', border: `1px solid ${errors.password ? '#ff8383' : '#4c5359'}`, color: '#4c5359', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2" style={{ color: '#4c5359' }}>
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Role dropdown */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6e757c' }}>ROLE (RBAC)</label>
              <div className="relative">
                <select
                  name="role" value={form.role} onChange={handleRoleChange}
                  className="w-full px-3 py-2 rounded text-sm appearance-none"
                  style={{ background: '#121212', border: '1px solid #4c5359', color: '#a4aab0', outline: 'none' }}
                >
                  {ROLE_LIST.map(({ role }) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6e757c' }} />
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm((p) => ({ ...p, rememberMe: !p.rememberMe }))}
                  className="w-4 h-4 rounded flex items-center justify-center cursor-pointer"
                  style={{ border: '1px solid #a4aab0', background: '#121212' }}
                >
                  {form.rememberMe && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#39994b" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs" style={{ color: '#a4aab0' }}>Remember me</span>
              </label>
              <button type="button" className="text-xs" style={{ color: '#5a89bc' }}>Forgot password?</button>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading || locked}
              className="w-full py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2"
              style={{ background: '#955600', color: '#e3ddcd', opacity: (loading || locked) ? 0.6 : 1 }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-5" style={{ borderTop: '1px solid #292c30' }} />

          {/* RBAC scope info */}
          <div className="space-y-1">
            <p className="text-xs" style={{ color: '#6e757c' }}>Access is scoped by role after login:</p>
            {ROLE_LIST.map(({ role, access }) => (
              <p key={role} className="text-xs" style={{ color: '#a4aab0' }}>• {role} → {access}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
