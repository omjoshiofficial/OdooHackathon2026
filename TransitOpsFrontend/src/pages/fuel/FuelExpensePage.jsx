import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { fuelApi } from '../../api/fuelApi';
import { expenseApi } from '../../api/expenseApi';
import { vehicleApi } from '../../api/vehicleApi';
import { tripApi } from '../../api/tripApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import { useForm } from '../../hooks/useForm';
import { EXPENSE_TYPES, MAINTENANCE_TYPES } from '../../constants';

// ── Fuel form
const FUEL_INIT = { vehicleId: '', date: new Date().toISOString().slice(0, 10), liters: '', pricePerLiter: '', vendor: '', odometer: '' };
const validateFuel = (v) => {
  const e = {};
  if (!v.vehicleId) e.vehicleId = 'Required';
  if (!v.date) e.date = 'Required';
  if (!v.liters || v.liters <= 0) e.liters = 'Must be > 0';
  if (!v.pricePerLiter || v.pricePerLiter <= 0) e.pricePerLiter = 'Must be > 0';
  return e;
};

// ── Expense form
const EXP_INIT = { vehicleId: '', tripId: '', type: 'Toll', amount: '', description: '', date: new Date().toISOString().slice(0, 10) };
const validateExp = (v) => {
  const e = {};
  if (!v.vehicleId) e.vehicleId = 'Required';
  if (!v.type) e.type = 'Required';
  if (!v.amount || v.amount <= 0) e.amount = 'Must be > 0';
  if (!v.date) e.date = 'Required';
  return e;
};

const statusBadge = {
  Available: 'bg-green-500 text-white',
  Completed: 'bg-green-500 text-white',
  'On Trip':  'bg-blue-500 text-white',
  Dispatched: 'bg-blue-500 text-white',
  Draft:      'bg-gray-600 text-white',
  Cancelled:  'bg-red-500 text-white',
};

// ── Tiny Modal wrapper
const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-md p-6 space-y-4 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

const PAGE_SIZE = 5;

const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 pt-2">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="px-2.5 py-1 rounded text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 hover:bg-gray-800 transition-colors">
        ‹ Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onPage(p)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors
            ${p === page ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="px-2.5 py-1 rounded text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 hover:bg-gray-800 transition-colors">
        Next ›
      </button>
    </div>
  );
};

const FuelExpensePage = () => {
  const [fuelLogs, setFuelLogs]     = useState([]);
  const [expenses, setExpenses]     = useState([]);
  const [vehicles, setVehicles]     = useState([]);
  const [trips, setTrips]           = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelModal, setFuelModal]   = useState(false);
  const [expModal, setExpModal]     = useState(false);
  const [savingFuel, setSavingFuel] = useState(false);
  const [savingExp, setSavingExp]   = useState(false);
  const [fuelPage, setFuelPage]     = useState(1);
  const [expPage, setExpPage]       = useState(1);

  // ── Fuel filters
  const [fuelVehicleF, setFuelVehicleF] = useState('');
  const [fuelDateFrom, setFuelDateFrom] = useState('');
  const [fuelDateTo,   setFuelDateTo]   = useState('');

  // ── Expense filters
  const [expVehicleF, setExpVehicleF] = useState('');
  const [expTypeF,    setExpTypeF]    = useState('');
  const [expStatusF,  setExpStatusF]  = useState('');

  const fuel = useForm(FUEL_INIT, validateFuel);
  const exp  = useForm(EXP_INIT, validateExp);

  useEffect(() => {
    Promise.all([
      fuelApi.getFuelLogs(),
      expenseApi.getExpenses(),
      vehicleApi.getVehicles(),
      tripApi.getTrips(),
      maintenanceApi.getMaintenance(),
    ]).then(([f, e, v, t, m]) => {
      setFuelLogs(f.data);
      setExpenses(e.data);
      setVehicles(v.data);
      setTrips(t.data);
      setMaintenance(m.data);
    }).catch(() => toast.error('Failed to load data.'));
  }, []);

  const getVehicleName = (id) => vehicles.find((v) => v.id === id)?.registrationNumber || id;
  const getTripLabel   = (id) => { const t = trips.find((x) => x.id === id); return t ? t.id?.toUpperCase() : '—'; };
  const getTripStatus  = (id) => trips.find((x) => x.id === id)?.status || '';

  // Linked maintenance cost per trip
  const getMaintCost = (tripId) => {
    if (!tripId) return 0;
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return 0;
    return maintenance
      .filter((m) => m.vehicleId === trip.vehicleId)
      .reduce((s, m) => s + Number(m.cost || 0), 0);
  };

  const totalFuelCost  = fuelLogs.reduce((s, l) => s + Number(l.totalCost || 0), 0);
  const totalMaintCost = maintenance.reduce((s, m) => s + Number(m.cost || 0), 0);
  const totalOpCost    = totalFuelCost + totalMaintCost;

  // ── Save fuel log
  const handleSaveFuel = async () => {
    if (!fuel.runValidation()) return;
    setSavingFuel(true);
    try {
      const created = await fuelApi.createFuelLog(fuel.values);
      setFuelLogs((prev) => [...prev, created.data]);
      fuel.reset(FUEL_INIT);
      setFuelModal(false);
      toast.success('Fuel log added.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed.');
    } finally { setSavingFuel(false); }
  };

  // ── Save expense
  const handleSaveExp = async () => {
    if (!exp.runValidation()) return;
    setSavingExp(true);
    try {
      const created = await expenseApi.createExpense(exp.values);
      setExpenses((prev) => [...prev, created.data]);
      exp.reset(EXP_INIT);
      setExpModal(false);
      toast.success('Expense added.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed.');
    } finally { setSavingExp(false); }
  };

  // ── Filtered fuel logs
  const filteredFuel = fuelLogs.filter((l) => {
    if (fuelVehicleF && l.vehicleId !== fuelVehicleF) return false;
    if (fuelDateFrom && l.date < fuelDateFrom) return false;
    if (fuelDateTo   && l.date > fuelDateTo)   return false;
    return true;
  });
  const pagedFuel      = filteredFuel.slice((fuelPage - 1) * PAGE_SIZE, fuelPage * PAGE_SIZE);
  const fuelTotalPages = Math.max(1, Math.ceil(filteredFuel.length / PAGE_SIZE));

  // ── Expense rows: group by trip, show toll/other/maint
  const expenseRows = trips
    .filter((t) => expenses.some((e) => e.tripId === t.id))
    .map((t) => {
      const tripExps = expenses.filter((e) => e.tripId === t.id);
      const toll  = tripExps.filter((e) => e.type === 'Toll').reduce((s, e) => s + Number(e.amount), 0);
      const other = tripExps.filter((e) => e.type !== 'Toll').reduce((s, e) => s + Number(e.amount), 0);
      const maint = getMaintCost(t.id);
      return { trip: t, vehicleId: t.vehicleId, toll, other, maint, total: toll + other + maint };
    });

  // Also show expenses not linked to any trip
  const noTripExps = expenses.filter((e) => !e.tripId);
  const allExpRows = [...expenseRows, ...noTripExps.map((e) => ({ _noTrip: true, ...e }))]
    .filter((row) => {
      const vid    = row._noTrip ? row.vehicleId : row.vehicleId;
      const status = row._noTrip ? '' : row.trip?.status;
      const type   = row._noTrip ? row.type : '';
      if (expVehicleF && vid !== expVehicleF) return false;
      if (expStatusF  && status !== expStatusF) return false;
      if (expTypeF    && row._noTrip && type !== expTypeF) return false;
      return true;
    });
  const pagedExp      = allExpRows.slice((expPage - 1) * PAGE_SIZE, expPage * PAGE_SIZE);
  const expTotalPages = Math.max(1, Math.ceil(allExpRows.length / PAGE_SIZE));

  const formatDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Fuel &amp; Expense Management</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFuelModal(true)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
            + Log Fuel
          </button>
          <button onClick={() => setExpModal(true)}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
            + Add Expense
          </button>
        </div>
      </div>

      {/* ── FUEL LOGS */}
      <div className="card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Fuel Logs</p>
          <div className="flex flex-wrap gap-2">
            <select value={fuelVehicleF} onChange={(e) => { setFuelVehicleF(e.target.value); setFuelPage(1); }}
              className="input py-1 px-2 text-xs w-36">
              <option value="">All Vehicles</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
            <input type="date" value={fuelDateFrom} onChange={(e) => { setFuelDateFrom(e.target.value); setFuelPage(1); }}
              className="input py-1 px-2 text-xs w-36" placeholder="From" />
            <input type="date" value={fuelDateTo} onChange={(e) => { setFuelDateTo(e.target.value); setFuelPage(1); }}
              className="input py-1 px-2 text-xs w-36" placeholder="To" />
            {(fuelVehicleF || fuelDateFrom || fuelDateTo) && (
              <button onClick={() => { setFuelVehicleF(''); setFuelDateFrom(''); setFuelDateTo(''); setFuelPage(1); }}
                className="text-xs text-orange-400 hover:text-orange-300 px-1">✕ Clear</button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Liters</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuel Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {fuelLogs.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-500 text-sm">No fuel logs yet.</td></tr>
              )}
              {pagedFuel.map((l) => (
                <tr key={l.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-200">{getVehicleName(l.vehicleId)}</td>
                  <td className="py-3 px-3 text-gray-300">{formatDate(l.date)}</td>
                  <td className="py-3 px-3 text-gray-300">{l.liters} L</td>
                  <td className="py-3 px-3 text-gray-300">{Number(l.totalCost).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={fuelPage} totalPages={fuelTotalPages} onPage={setFuelPage} />
        <p className="text-xs text-gray-600 text-right">{fuelLogs.length} records</p>
      </div>

      {/* ── OTHER EXPENSES */}
      <div className="card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Other Expenses (Toll / Misc)</p>
          <div className="flex flex-wrap gap-2">
            <select value={expVehicleF} onChange={(e) => { setExpVehicleF(e.target.value); setExpPage(1); }}
              className="input py-1 px-2 text-xs w-36">
              <option value="">All Vehicles</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
            <select value={expTypeF} onChange={(e) => { setExpTypeF(e.target.value); setExpPage(1); }}
              className="input py-1 px-2 text-xs w-32">
              <option value="">All Types</option>
              {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={expStatusF} onChange={(e) => { setExpStatusF(e.target.value); setExpPage(1); }}
              className="input py-1 px-2 text-xs w-36">
              <option value="">All Statuses</option>
              {['Draft','Dispatched','Completed','Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {(expVehicleF || expTypeF || expStatusF) && (
              <button onClick={() => { setExpVehicleF(''); setExpTypeF(''); setExpStatusF(''); setExpPage(1); }}
                className="text-xs text-orange-400 hover:text-orange-300 px-1">✕ Clear</button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trip</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Toll</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Other</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Maint. (Linked)</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allExpRows.length === 0 && (
                <tr><td colSpan={6} className="text-center py-6 text-gray-500 text-sm">No expenses yet.</td></tr>
              )}
              {pagedExp.map((row) =>
                row._noTrip ? (
                  <tr key={row.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 text-gray-500">—</td>
                    <td className="py-3 px-3 text-gray-300">{getVehicleName(row.vehicleId)}</td>
                    <td className="py-3 px-3 text-gray-300">{row.type === 'Toll' ? row.amount : 0}</td>
                    <td className="py-3 px-3 text-gray-300">{row.type !== 'Toll' ? row.amount : 0}</td>
                    <td className="py-3 px-3 text-gray-500">0</td>
                    <td className="py-3 px-3 text-gray-300">{Number(row.amount).toLocaleString()}</td>
                  </tr>
                ) : (
                  <tr key={row.trip.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-200">{row.trip.id?.toUpperCase()}</td>
                    <td className="py-3 px-3 text-gray-300">{getVehicleName(row.vehicleId)}</td>
                    <td className="py-3 px-3 text-gray-300">{row.toll || 0}</td>
                    <td className="py-3 px-3 text-gray-300">{row.other || 0}</td>
                    <td className="py-3 px-3 text-gray-300">{row.maint ? row.maint.toLocaleString() : 0}</td>
                    <td className="py-3 px-3">
                      <span className={`px-3 py-0.5 rounded text-xs font-semibold ${statusBadge[row.trip.status] || 'bg-gray-700 text-gray-300'}`}>
                        {row.trip.status}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={expPage} totalPages={expTotalPages} onPage={setExpPage} />
        <p className="text-xs text-gray-600 text-right">{allExpRows.length} records</p>
      </div>

      {/* ── TOTAL OPERATIONAL COST */}
      <div className="flex items-center gap-3 px-1">
        <p className="text-sm text-gray-400">Total Operational Cost (Auto) = Fuel + Maint</p>
        <span className="text-orange-400 font-bold text-base">{totalOpCost.toLocaleString()}</span>
      </div>

      {/* ── LOG FUEL MODAL */}
      <Modal open={fuelModal} title="Log Fuel" onClose={() => setFuelModal(false)}>
        <div className="space-y-3">
          <Field label="Vehicle" error={fuel.errors.vehicleId}>
            <select name="vehicleId" value={fuel.values.vehicleId} onChange={fuel.handleChange} className={`input ${fuel.errors.vehicleId ? 'input-error' : ''}`}>
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" error={fuel.errors.date}>
              <input name="date" type="date" value={fuel.values.date} onChange={fuel.handleChange} className={`input ${fuel.errors.date ? 'input-error' : ''}`} />
            </Field>
            <Field label="Vendor">
              <input name="vendor" value={fuel.values.vendor} onChange={fuel.handleChange} placeholder="Shell Station" className="input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Liters" error={fuel.errors.liters}>
              <input name="liters" type="number" value={fuel.values.liters} onChange={fuel.handleChange} className={`input ${fuel.errors.liters ? 'input-error' : ''}`} />
            </Field>
            <Field label="Price / Liter" error={fuel.errors.pricePerLiter}>
              <input name="pricePerLiter" type="number" step="0.01" value={fuel.values.pricePerLiter} onChange={fuel.handleChange} className={`input ${fuel.errors.pricePerLiter ? 'input-error' : ''}`} />
            </Field>
          </div>
          {fuel.values.liters && fuel.values.pricePerLiter && (
            <p className="text-xs text-gray-400">
              Total Cost: <span className="text-orange-400 font-semibold">
                {(fuel.values.liters * fuel.values.pricePerLiter).toFixed(2)}
              </span>
            </p>
          )}
          <Field label="Odometer (km)">
            <input name="odometer" type="number" value={fuel.values.odometer} onChange={fuel.handleChange} className="input" />
          </Field>
          <div className="flex gap-3 pt-1">
            <button onClick={handleSaveFuel} disabled={savingFuel}
              className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50">
              {savingFuel ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setFuelModal(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── ADD EXPENSE MODAL */}
      <Modal open={expModal} title="Add Expense" onClose={() => setExpModal(false)}>
        <div className="space-y-3">
          <Field label="Vehicle" error={exp.errors.vehicleId}>
            <select name="vehicleId" value={exp.values.vehicleId}
              onChange={(e) => { exp.handleChange(e); exp.setValue('tripId', ''); }}
              className={`input ${exp.errors.vehicleId ? 'input-error' : ''}`}>
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
          </Field>
          <Field label="Trip (Optional)">
            <select name="tripId" value={exp.values.tripId} onChange={exp.handleChange} className="input">
              <option value="">None</option>
              {trips
                .filter((t) => !exp.values.vehicleId || t.vehicleId === exp.values.vehicleId)
                .map((t) => <option key={t.id} value={t.id}>{t.id?.toUpperCase()} — {t.source} → {t.destination} ({t.status})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" error={exp.errors.type}>
              <select name="type" value={exp.values.type} onChange={exp.handleChange} className={`input ${exp.errors.type ? 'input-error' : ''}`}>
                {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Amount" error={exp.errors.amount}>
              <input name="amount" type="number" value={exp.values.amount} onChange={exp.handleChange} className={`input ${exp.errors.amount ? 'input-error' : ''}`} />
            </Field>
          </div>
          <Field label="Date" error={exp.errors.date}>
            <input name="date" type="date" value={exp.values.date} onChange={exp.handleChange} className={`input ${exp.errors.date ? 'input-error' : ''}`} />
          </Field>
          <Field label="Description">
            <input name="description" value={exp.values.description} onChange={exp.handleChange} placeholder="Optional..." className="input" />
          </Field>
          <div className="flex gap-3 pt-1">
            <button onClick={handleSaveExp} disabled={savingExp}
              className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold disabled:opacity-50">
              {savingExp ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setExpModal(false)} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FuelExpensePage;
