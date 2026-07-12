import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { vehicleApi } from '../../api/vehicleApi';
import { useTable } from '../../hooks/useTable';
import { useModal } from '../../hooks/useModal';
import { useForm } from '../../hooks/useForm';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/Loader';
import VehicleForm from './VehicleForm';
import { formatCurrency, formatNumber } from '../../utils';
import { VEHICLE_TYPES, VEHICLE_STATUS } from '../../constants';
import { useAppData } from '../../context/AppDataContext';

const INITIAL = { registrationNumber: '', name: '', model: '', type: '', maxLoadCapacity: '', currentOdometer: '', acquisitionCost: '', status: 'Available' };

const validate = (v) => {
  const e = {};
  if (!v.registrationNumber) e.registrationNumber = 'Required';
  if (!v.name) e.name = 'Required';
  if (!v.model) e.model = 'Required';
  if (!v.type) e.type = 'Required';
  if (!v.maxLoadCapacity || v.maxLoadCapacity <= 0) e.maxLoadCapacity = 'Must be > 0';
  if (!v.status) e.status = 'Required';
  return e;
};

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { refreshVehicles } = useAppData();
  const formModal = useModal();
  const deleteModal = useModal();
  const { values, errors, handleChange, runValidation, reset, setValues } = useForm(INITIAL, validate);

  const { rows, total, page, totalPages, setPage, search, handleSearch, sortKey, sortDir, handleSort, filters, handleFilter } = useTable(vehicles, ['registrationNumber', 'name', 'model', 'type']);

  useEffect(() => {
    vehicleApi.getVehicles().then((r) => setVehicles(r.data)).catch(() => toast.error('Failed to load vehicles.')).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { reset(INITIAL); formModal.open(null); };
  const openEdit = (v) => { reset(v); formModal.open(v); };

  const handleSave = async () => {
    if (!runValidation()) return;
    setSaving(true);
    try {
      if (formModal.data) {
        const updated = await vehicleApi.updateVehicle(formModal.data.id, values);
        setVehicles((prev) => prev.map((v) => v.id === formModal.data.id ? updated.data : v));
        refreshVehicles(vehicleApi.getVehiclesSync());
        toast.success('Vehicle updated.');
      } else {
        const created = await vehicleApi.createVehicle(values);
        setVehicles((prev) => [...prev, created.data]);
        refreshVehicles(vehicleApi.getVehiclesSync());
        toast.success('Vehicle added.');
      }
      formModal.close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await vehicleApi.deleteVehicle(deleteModal.data.id);
      setVehicles((prev) => prev.filter((v) => v.id !== deleteModal.data.id));
      refreshVehicles(vehicleApi.getVehiclesSync());
      toast.success('Vehicle deleted.');
      deleteModal.close();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'registrationNumber', label: 'Reg. No.', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'model', label: 'Model' },
    { key: 'maxLoadCapacity', label: 'Capacity', sortable: true, render: (v) => `${formatNumber(v)} kg` },
    { key: 'currentOdometer', label: 'Odometer', render: (v) => `${formatNumber(v)} km` },
    { key: 'acquisitionCost', label: 'Cost', render: (v) => formatCurrency(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Pencil size={13} /></button>
          <button onClick={() => deleteModal.open(row)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="page-container"><SkeletonTable rows={6} cols={8} /></div>;

  return (
    <div className="page-container">
      <PageHeader
        title="Vehicles"
        subtitle={`${vehicles.length} vehicles in fleet`}
        breadcrumbs={[{ label: 'Vehicles' }]}
        actions={<Button icon={Plus} onClick={openCreate}>Add Vehicle</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search vehicles..." className="w-full sm:w-64" />
        <Select value={filters.type || ''} onChange={(e) => handleFilter('type', e.target.value)} options={VEHICLE_TYPES} placeholder="All Types" className="w-36" />
        <Select value={filters.status || ''} onChange={(e) => handleFilter('status', e.target.value)} options={Object.values(VEHICLE_STATUS)} placeholder="All Status" className="w-36" />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        emptyState={<EmptyState title="No vehicles found" description="Add your first vehicle to get started." icon={Truck} />}
      />

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={formModal.data ? 'Edit Vehicle' : 'Add Vehicle'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={formModal.close}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </>
        }
      >
        <VehicleForm values={values} errors={errors} onChange={handleChange} />
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete "${deleteModal.data?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
};

export default VehiclesPage;
