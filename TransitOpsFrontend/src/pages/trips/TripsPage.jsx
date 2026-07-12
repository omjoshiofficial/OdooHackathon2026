import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import { tripApi } from '../../api/tripApi';
import { vehicleApi } from '../../api/vehicleApi';
import { driverApi } from '../../api/driverApi';
import { useForm } from '../../hooks/useForm';
import { useAppData } from '../../context/AppDataContext';
import { VEHICLE_STATUS } from '../../constants';

const INITIAL = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' };

const LIFECYCLE = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

const statusColor = {
  Dispatched: 'bg-blue-500 text-white',
  Draft: 'bg-gray-600 text-white',
  Completed: 'bg-green-600 text-white',
  Cancelled: 'bg-red-500 text-white',
};

const validate = (v, selectedVehicle) => {
  const e = {};
  if (!v.source) e.source = 'Required';
  if (!v.destination) e.destination = 'Required';
  if (!v.vehicleId) e.vehicleId = 'Required';
  if (!v.driverId) e.driverId = 'Required';
  if (!v.cargoWeight || v.cargoWeight <= 0) e.cargoWeight = 'Must be > 0';
  if (!v.plannedDistance || v.plannedDistance <= 0) e.plannedDistance = 'Must be > 0';
  if (selectedVehicle && Number(v.cargoWeight) > selectedVehicle.maxLoadCapacity) {
    e.cargoWeight = `Exceeds vehicle capacity (${selectedVehicle.maxLoadCapacity} kg)`;
  }
  return e;
};

const TripsPage = () => {
  const ctx = useOutletContext();
  const canWrite = !ctx || ctx.permission === 'full';
  const { vehicles, drivers, refreshVehicles, refreshDrivers } = useAppData();

  const [trips, setTrips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [boardPage, setBoardPage] = useState(1);
  const BOARD_PAGE_SIZE = 5;

  const { values, errors, handleChange, runValidation, reset } = useForm(INITIAL, (v) => {
    const sv = vehicles.find((x) => x.id === v.vehicleId);
    return validate(v, sv);
  });

  const loadTrips = useCallback(() => {
    tripApi.getTrips().then((r) => setTrips(r.data)).catch(() => {});
  }, []);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const availableVehicles = vehicles.filter((v) => v.status === VEHICLE_STATUS.AVAILABLE);
  const availableDrivers = drivers.filter((d) => d.status === 'Available');
  const selectedVehicle = vehicles.find((v) => v.id === values.vehicleId);
  const capacityExceeded = selectedVehicle && Number(values.cargoWeight) > selectedVehicle.maxLoadCapacity;

  const handleDispatch = async () => {
    if (!runValidation()) return;
    if (capacityExceeded) return;
    setSaving(true);
    try {
      const created = await tripApi.createTrip({ ...values, status: 'Draft' });
      await tripApi.dispatchTrip(created.data.id);
      reset(INITIAL);
      toast.success('Trip dispatched.');
      const [v, d] = await Promise.all([vehicleApi.getVehicles(), driverApi.getDrivers()]);
      refreshVehicles(v.data);
      refreshDrivers(d.data);
      loadTrips();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Dispatch failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action, trip) => {
    setActionLoading(trip.id + action);
    try {
      if (action === 'complete') await tripApi.completeTrip(trip.id);
      else if (action === 'cancel') await tripApi.cancelTrip(trip.id);
      toast.success(action === 'complete' ? 'Trip completed.' : 'Trip cancelled.');
      const [v, d] = await Promise.all([vehicleApi.getVehicles(), driverApi.getDrivers()]);
      refreshVehicles(v.data);
      refreshDrivers(d.data);
      loadTrips();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const getVehicleLabel = (id) => {
    const v = vehicles.find((x) => x.id === id);
    return v ? `${v.registrationNumber} / ${v.name}` : id;
  };
  const getDriverLabel = (id) => drivers.find((d) => d.id === id)?.name || id;

  return (
    <div className="p-4 md:p-6 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Trip Dispatcher</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Dispatcher</span>
          <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">Dispatcher</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT — Create Trip (full access only) */}
        {canWrite && (
        <div className="card p-5 space-y-4">
          {/* Trip Lifecycle Stepper */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Trip Lifecycle</p>
            <div className="flex items-center gap-0">
              {LIFECYCLE.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${i === 1
                        ? 'bg-blue-500 border-blue-500'
                        : i === 0
                        ? 'bg-green-500 border-green-500'
                        : 'bg-gray-600 border-gray-600'}`}>
                      {(i === 0 || i === 1) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className={`text-xs mt-1 font-medium
                      ${i === 1 ? 'text-blue-400' : i === 0 ? 'text-green-400' : 'text-gray-500'}`}>
                      {step}
                    </span>
                  </div>
                  {i < LIFECYCLE.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 ${i < 1 ? 'bg-blue-500' : 'bg-gray-700'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Create Trip</p>
            <div className="space-y-3">
              <div>
                <label className="label">Source</label>
                <input name="source" value={values.source} onChange={handleChange}
                  placeholder="Gandhinagar Depot"
                  className={`input ${errors.source ? 'input-error' : ''}`} />
                {errors.source && <p className="text-xs text-red-400 mt-1">{errors.source}</p>}
              </div>

              <div>
                <label className="label">Destination</label>
                <input name="destination" value={values.destination} onChange={handleChange}
                  placeholder="Ahmedabad Hub"
                  className={`input ${errors.destination ? 'input-error' : ''}`} />
                {errors.destination && <p className="text-xs text-red-400 mt-1">{errors.destination}</p>}
              </div>

              <div>
                <label className="label">Vehicle <span className="text-gray-500 font-normal">(available only)</span></label>
                <select name="vehicleId" value={values.vehicleId} onChange={handleChange}
                  className={`input ${errors.vehicleId ? 'input-error' : ''}`}>
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} — {v.maxLoadCapacity} kg capacity</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-xs text-red-400 mt-1">{errors.vehicleId}</p>}
              </div>

              <div>
                <label className="label">Driver <span className="text-gray-500 font-normal">(available only)</span></label>
                <select name="driverId" value={values.driverId} onChange={handleChange}
                  className={`input ${errors.driverId ? 'input-error' : ''}`}>
                  <option value="">Select driver...</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.driverId && <p className="text-xs text-red-400 mt-1">{errors.driverId}</p>}
              </div>

              <div>
                <label className="label">Cargo Weight (kg)</label>
                <input name="cargoWeight" type="number" value={values.cargoWeight} onChange={handleChange}
                  placeholder="700"
                  className={`input ${errors.cargoWeight || capacityExceeded ? 'input-error' : ''}`} />
              </div>

              <div>
                <label className="label">Planned Distance (km)</label>
                <input name="plannedDistance" type="number" value={values.plannedDistance} onChange={handleChange}
                  placeholder="35"
                  className={`input ${errors.plannedDistance ? 'input-error' : ''}`} />
                {errors.plannedDistance && <p className="text-xs text-red-400 mt-1">{errors.plannedDistance}</p>}
              </div>

              {/* Capacity Warning */}
              {selectedVehicle && values.cargoWeight && (
                <div className={`rounded-lg border p-3 text-xs space-y-1
                  ${capacityExceeded
                    ? 'border-red-500 bg-red-950/40 text-red-300'
                    : 'border-gray-600 bg-gray-800/40 text-gray-400'}`}>
                  <p>Vehicle Capacity: {selectedVehicle.maxLoadCapacity} kg</p>
                  <p>Cargo Weight: {values.cargoWeight} kg</p>
                  {capacityExceeded && (
                    <p className="font-semibold text-red-400">
                      ✕ Capacity exceeded by {Number(values.cargoWeight) - selectedVehicle.maxLoadCapacity} kg — dispatch blocked
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={handleDispatch} disabled={saving || capacityExceeded}
                  className="btn btn-primary flex-1 disabled:opacity-40">
                  {saving ? 'Dispatching...' : 'Dispatch (blocked)'}
                </button>
                <button onClick={() => reset(INITIAL)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        )} {/* end canWrite */}

        {/* RIGHT — Live Board */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Live Board</p>
            <span className="text-xs text-gray-600">{trips.length} trips</span>
          </div>

          {trips.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-8">No trips yet.</p>
          )}

          {trips.slice((boardPage - 1) * BOARD_PAGE_SIZE, boardPage * BOARD_PAGE_SIZE).map((trip) => {
            const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
            const driver = drivers.find((d) => d.id === trip.driverId);
            return (
              <div key={trip.id}
                className="rounded-lg border border-gray-700 dark:border-gray-700 bg-gray-900/50 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {trip.id?.toUpperCase?.() || 'TR—'}
                    </p>
                    <p className="text-sm font-semibold text-gray-100 mt-0.5">
                      {trip.source} → {trip.destination}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {vehicle ? `${vehicle.registrationNumber} / ${driver?.name || 'Unassigned'}` : 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-0.5 rounded text-xs font-semibold ${statusColor[trip.status] || 'bg-gray-700 text-gray-300'}`}>
                    {trip.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {trip.status === 'Dispatched' && trip.plannedDistance ? `${trip.plannedDistance} km` : ''}
                    {trip.status === 'Draft' && 'Awaiting driver'}
                    {trip.status === 'Cancelled' && 'Vehicle sent to Shop'}
                    {trip.status === 'Completed' && 'Trip completed'}
                  </span>
                </div>

                {/* Action buttons — full access only */}
                {canWrite && trip.status === 'Dispatched' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleAction('complete', trip)}
                      disabled={!!actionLoading}
                      className="btn btn-secondary text-xs py-1 px-3 text-green-400 hover:text-green-300">
                      Complete
                    </button>
                    <button onClick={() => handleAction('cancel', trip)}
                      disabled={!!actionLoading}
                      className="btn btn-secondary text-xs py-1 px-3 text-red-400 hover:text-red-300">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Footer note */}
          <p className="text-xs text-gray-600 dark:text-gray-600 pt-2">
            On Complete: odometer → fuel log → expenses → Vehicle &amp; Driver Available
          </p>

          {/* Live Board Pagination */}
          {trips.length > BOARD_PAGE_SIZE && (() => {
            const totalPages = Math.ceil(trips.length / BOARD_PAGE_SIZE);
            return (
              <div className="flex items-center justify-between pt-1 border-t border-gray-800">
                <span className="text-xs text-gray-600">
                  {(boardPage - 1) * BOARD_PAGE_SIZE + 1}–{Math.min(boardPage * BOARD_PAGE_SIZE, trips.length)} of {trips.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setBoardPage((p) => Math.max(1, p - 1))} disabled={boardPage === 1}
                    className="px-2.5 py-1 rounded text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 hover:bg-gray-800 transition-colors">
                    ‹ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setBoardPage(p)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        p === boardPage ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}>{p}</button>
                  ))}
                  <button onClick={() => setBoardPage((p) => Math.min(totalPages, p + 1))} disabled={boardPage === totalPages}
                    className="px-2.5 py-1 rounded text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 hover:bg-gray-800 transition-colors">
                    Next ›
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TripsPage;
