import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Fuel } from 'lucide-react';
import { toast } from 'react-toastify';
import { fuelApi } from '../../api/fuelApi';
import { vehicleApi } from '../../api/vehicleApi';
import { useTable } from '../../hooks/useTable';
import { useModal } from '../../hooks/useModal';
import { useForm } from '../../hooks/useForm';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/Loader';
import { formatCurrency, formatDate, formatNumber } from '../../utils';

const INITIAL = { vehicleId: '', date: '', liters: '', pricePerLiter: '', vendor: '', odometer: '', notes: '' };

const validate = (v) => {
  const e = {};
  if (!v.vehicleId) e.vehicleId = 'Required';
  if (!v.date) e.date = 'Required';
  if (!v.liters || v.liters <= 0) e.liters = 'Must be > 0';
  if (!v.pricePerLiter || v.pricePerLiter <= 0) e.pricePerLiter = 'Must be > 0';
  return e;
};

const FuelPage = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formModal = useModal();
  const deleteModal = useModal();
  const { values, errors, handleChange, runValidation, reset } = useForm(INITIAL, validate);

  const { rows, total, page, totalPages, setPage, search, handleSearch, sortKey, sortDir, handleSort } = useTable(logs, ['vendor']);

  useEffect(() => {
    Promise.all([fuelApi.getFuelLogs(), vehicleApi.getVehicles()])
      .then(([f, v]) => { setLogs(f.data); setVehicles(v.data); })
      .catch(() => toast.error('Failed to load fuel logs.'))
      .finally(() => setLoading(false));
  }, []);

  const vehicleOptions = vehicles.map((v) => ({ value: v.id, label: `${v.registrationNumber} — ${v.name}` }));
  const computedCost = values.liters && values.pricePerLiter ? (values.liters * values.pricePerLiter).toFixed(2) : '—';

  const openCreate = () => { reset(INITIAL); formModal.open(null); };
  const openEdit = (l) => { reset(l); formModal.open(l); };

  const handleSave = async () => {
    if (!runValidation()) return;
    setSaving(true);
    try {
      if (formModal.data) {
        const updated = await fuelApi.updateFuelLog(formModal.data.id, values);
        setLogs((prev) => prev.map((l) => l.id === formModal.data.id ? updated.data : l));
        toast.success('Fuel log updated.');
      } else {
        const created = await fuelApi.createFuelLog(values);
        setLogs((prev) => [...prev, created.data]);
        toast.success('Fuel log added.');
      }
      formModal.close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fuelApi.deleteFuelLog(deleteModal.data.id);
      setLogs((prev) => prev.filter((l) => l.id !== deleteModal.data.id));
      toast.success('Fuel log deleted.');
      deleteModal.close();
    } catch { toast.error('Delete failed.'); }
  };

  const getVehicleName = (id) => vehicles.find((v) => v.id === id)?.registrationNumber || id;
  const totalFuel = logs.reduce((s, l) => s + l.totalCost, 0);

  const columns = [
    { key: 'vehicleId', label: 'Vehicle', render: (v) => getVehicleName(v) },
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'liters', label: 'Liters', sortable: true, render: (v) => `${v}L` },
    { key: 'pricePerLiter', label: 'Price/L', render: (v) => `₹${v}` },
    { key: 'totalCost', label: 'Total Cost', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'vendor', label: 'Vendor' },
    { key: 'odometer', label: 'Odometer', render: (v) => v ? `${formatNumber(v)} km` : '—' },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Pencil size={13} /></button>
          <button onClick={() => deleteModal.open(row)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="page-container"><SkeletonTable rows={5} cols={7} /></div>;

  return (
    <div className="page-container">
      <PageHeader title="Fuel Logs" subtitle={`Total fuel cost: ${formatCurrency(totalFuel)}`} breadcrumbs={[{ label: 'Fuel Logs' }]}
        actions={<Button icon={Plus} onClick={openCreate}>Add Log</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search by vendor..." className="w-full sm:w-64" />
      </div>

      <DataTable columns={columns} rows={rows} total={total} page={page} totalPages={totalPages} onPageChange={setPage} sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        emptyState={<EmptyState title="No fuel logs" icon={Fuel} />}
      />

      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Edit Fuel Log' : 'Add Fuel Log'} size="md"
        footer={<><Button variant="secondary" onClick={formModal.close}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}
      >
        <div className="space-y-4">
          <Select label="Vehicle" name="vehicleId" value={values.vehicleId} onChange={handleChange} error={errors.vehicleId} options={vehicleOptions} placeholder="Select vehicle" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" name="date" type="date" value={values.date} onChange={handleChange} error={errors.date} />
            <Input label="Vendor" name="vendor" value={values.vendor} onChange={handleChange} placeholder="Shell Station" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Liters" name="liters" type="number" step="0.1" value={values.liters} onChange={handleChange} error={errors.liters} />
            <Input label="Price per Liter (₹)" name="pricePerLiter" type="number" step="0.01" value={values.pricePerLiter} onChange={handleChange} error={errors.pricePerLiter} />
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">Calculated Total Cost</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{computedCost !== '—' ? `₹${computedCost}` : '—'}</p>
          </div>
          <Input label="Odometer (km)" name="odometer" type="number" value={values.odometer} onChange={handleChange} />
          <Input label="Notes" name="notes" value={values.notes} onChange={handleChange} placeholder="Optional notes..." />
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete} title="Delete Fuel Log" message="Delete this fuel log?" />
    </div>
  );
};

export default FuelPage;
