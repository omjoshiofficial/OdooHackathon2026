import { useState, useEffect } from 'react';
import { ArrowRight, Pencil, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { maintenanceApi } from '../../api/maintenanceApi';
import { vehicleApi } from '../../api/vehicleApi';
import { useForm } from '../../hooks/useForm';
import { MAINTENANCE_TYPES } from '../../constants';

const INITIAL = { vehicleId: '', type: '', cost: '', date: new Date().toISOString().slice(0, 10), status: 'Open' };

const validate = (v) => {
  const e = {};
  if (!v.vehicleId) e.vehicleId = 'Required';
  if (!v.type) e.type = 'Required';
  if (!v.cost || v.cost < 0) e.cost = 'Must be ≥ 0';
  if (!v.date) e.date = 'Required';
  return e;
};

const statusBadge = {
  Open:      'bg-orange-500 text-white',
  Closed:    'bg-green-500 text-white',
  'In Shop': 'bg-orange-500 text-white',
  Completed: 'bg-green-500 text-white',
};

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
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            p === page ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}>
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

const MaintenancePage = () => {
  const [records, setRecords]     = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [saving, setSaving]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage]           = useState(1);

  const { values, errors, handleChange, runValidation, reset } = useForm(INITIAL, validate);

  useEffect(() => {
    Promise.all([maintenanceApi.getMaintenance(), vehicleApi.getVehicles()])
      .then(([m, v]) => { setRecords(m.data); setVehicles(v.data); })
      .catch(() => toast.error('Failed to load data.'));
  }, []);

  const getVehicleName = (id) => vehicles.find((v) => v.id === id)?.registrationNumber || id;

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = records.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleStatusUpdate = async (record) => {
    setUpdatingId(record.id);
    try {
      const updated = await maintenanceApi.updateMaintenance(record.id, { ...record, status: editStatus });
      setRecords((prev) => prev.map((r) => r.id === record.id ? updated.data : r));
      const v = await vehicleApi.getVehicles();
      setVehicles(v.data);
      toast.success('Status updated.');
      setEditingId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSave = async () => {
    if (!runValidation()) return;
    setSaving(true);
    try {
      const created = await maintenanceApi.createMaintenance(values);
      setRecords((prev) => [...prev, created.data]);
      const v = await vehicleApi.getVehicles();
      setVehicles(v.data);
      reset(INITIAL);
      toast.success('Service record saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-slide-up">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">5.</p>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Maintenance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* LEFT — Log Service Record */}
        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Log Service Record
          </p>

          <div className="space-y-3">
            <div>
              <label className="label">Vehicle</label>
              <select name="vehicleId" value={values.vehicleId} onChange={handleChange}
                className={`input ${errors.vehicleId ? 'input-error' : ''}`}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
              </select>
              {errors.vehicleId && <p className="text-xs text-red-400 mt-1">{errors.vehicleId}</p>}
            </div>

            <div>
              <label className="label">Service Type</label>
              <select name="type" value={values.type} onChange={handleChange}
                className={`input ${errors.type ? 'input-error' : ''}`}>
                <option value="">Select type...</option>
                {MAINTENANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="text-xs text-red-400 mt-1">{errors.type}</p>}
            </div>

            <div>
              <label className="label">Cost</label>
              <input name="cost" type="number" value={values.cost} onChange={handleChange}
                placeholder="2500" className={`input ${errors.cost ? 'input-error' : ''}`} />
              {errors.cost && <p className="text-xs text-red-400 mt-1">{errors.cost}</p>}
            </div>

            <div>
              <label className="label">Date</label>
              <input name="date" type="date" value={values.date} onChange={handleChange}
                className={`input ${errors.date ? 'input-error' : ''}`} />
              {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="label">Status</label>
              <select name="status" value={values.status} onChange={handleChange} className="input">
                <option value="Open">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 mt-1">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Status Flow Diagram */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-sm font-medium w-20">Available</span>
              <div className="flex-1 border-t border-dashed border-gray-600 relative">
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 text-xs text-gray-500 whitespace-nowrap">
                  log maintenance record
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
              <span className="text-orange-400 text-sm font-medium w-16 text-right">In Shop</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-400 text-sm font-medium w-20">In Shop</span>
              <div className="flex-1 border-t border-dashed border-gray-600 relative">
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 text-xs text-gray-500 whitespace-nowrap">
                  close record (mark as closed)
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-400" />
              <span className="text-green-400 text-sm font-medium w-16 text-right">Available</span>
            </div>
            <p className="text-xs text-orange-400 pt-1">
              Note: In Shop vehicles are removed from the dispatch pool.
            </p>
          </div>
        </div>

        {/* RIGHT — Service Log Table */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Service Log
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {records.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">No records yet.</td>
                  </tr>
                )}
                {paged.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-200">{getVehicleName(r.vehicleId)}</td>
                    <td className="py-3 px-3 text-gray-300">{r.type}</td>
                    <td className="py-3 px-3 text-gray-300">{r.cost?.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      {editingId === r.id ? (
                        <div className="flex items-center gap-2">
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                            className="input py-0.5 px-2 text-xs w-28">
                            <option value="Open">In Shop</option>
                            <option value="Closed">Completed</option>
                          </select>
                          <button onClick={() => handleStatusUpdate(r)} disabled={!!updatingId}
                            className="p-1 rounded text-green-400 hover:text-green-300 disabled:opacity-50">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1 rounded text-gray-500 hover:text-gray-300">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-0.5 rounded text-xs font-semibold ${statusBadge[r.status] || 'bg-gray-700 text-gray-300'}`}>
                            {r.status === 'Open' ? 'In Shop' : r.status === 'Closed' ? 'Completed' : r.status}
                          </span>
                          <button onClick={() => { setEditingId(r.id); setEditStatus(r.status); }}
                            className="p-1 rounded text-gray-500 hover:text-gray-300">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-600">{records.length} records</span>
            <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
