import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { driverApi } from '../../api/driverApi';
import { useTable } from '../../hooks/useTable';
import { useModal } from '../../hooks/useModal';
import { useForm } from '../../hooks/useForm';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/Loader';
import { formatDate, isLicenseExpired, isLicenseExpiringSoon } from '../../utils';
import { DRIVER_STATUS, LICENSE_CATEGORIES } from '../../constants';

const INITIAL = { name: '', licenseNumber: '', licenseCategory: '', licenseExpiry: '', phone: '', safetyScore: '', status: 'Available' };

const validate = (v) => {
  const e = {};
  if (!v.name) e.name = 'Required';
  if (!v.licenseNumber) e.licenseNumber = 'Required';
  if (!v.licenseCategory) e.licenseCategory = 'Required';
  if (!v.licenseExpiry) e.licenseExpiry = 'Required';
  if (!v.phone) e.phone = 'Required';
  if (!v.safetyScore || v.safetyScore < 0 || v.safetyScore > 100) e.safetyScore = 'Must be 0–100';
  return e;
};

const SafetyScore = ({ score }) => {
  const color = score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-500';
  return <span className={`font-semibold text-sm ${color}`}>{score}</span>;
};

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formModal = useModal();
  const deleteModal = useModal();
  const { values, errors, handleChange, runValidation, reset } = useForm(INITIAL, validate);

  const { rows, total, page, totalPages, setPage, search, handleSearch, sortKey, sortDir, handleSort, filters, handleFilter } = useTable(drivers, ['name', 'licenseNumber', 'phone']);

  useEffect(() => {
    driverApi.getDrivers().then((r) => setDrivers(r.data)).catch(() => toast.error('Failed to load drivers.')).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { reset(INITIAL); formModal.open(null); };
  const openEdit = (d) => { reset(d); formModal.open(d); };

  const handleSave = async () => {
    if (!runValidation()) return;
    setSaving(true);
    try {
      if (formModal.data) {
        const updated = await driverApi.updateDriver(formModal.data.id, values);
        setDrivers((prev) => prev.map((d) => d.id === formModal.data.id ? updated.data : d));
        toast.success('Driver updated.');
      } else {
        const created = await driverApi.createDriver(values);
        setDrivers((prev) => [...prev, created.data]);
        toast.success('Driver added.');
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
      await driverApi.deleteDriver(deleteModal.data.id);
      setDrivers((prev) => prev.filter((d) => d.id !== deleteModal.data.id));
      toast.success('Driver deleted.');
      deleteModal.close();
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'licenseNumber', label: 'License No.' },
    { key: 'licenseCategory', label: 'Category' },
    {
      key: 'licenseExpiry', label: 'Expiry', sortable: true, render: (v) => (
        <span className={`flex items-center gap-1 text-sm ${isLicenseExpired(v) ? 'text-red-500' : isLicenseExpiringSoon(v) ? 'text-yellow-600' : ''}`}>
          {isLicenseExpired(v) || isLicenseExpiringSoon(v) ? <AlertTriangle size={12} /> : null}
          {formatDate(v)}
        </span>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'safetyScore', label: 'Safety Score', sortable: true, render: (v) => <SafetyScore score={v} /> },
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

  if (loading) return <div className="page-container"><SkeletonTable rows={6} cols={7} /></div>;

  return (
    <div className="page-container">
      <PageHeader
        title="Drivers"
        subtitle={`${drivers.length} registered drivers`}
        breadcrumbs={[{ label: 'Drivers' }]}
        actions={<Button icon={Plus} onClick={openCreate}>Add Driver</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search drivers..." className="w-full sm:w-64" />
        <Select value={filters.status || ''} onChange={(e) => handleFilter('status', e.target.value)} options={Object.values(DRIVER_STATUS)} placeholder="All Status" className="w-36" />
      </div>

      <DataTable columns={columns} rows={rows} total={total} page={page} totalPages={totalPages} onPageChange={setPage} sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        emptyState={<EmptyState title="No drivers found" icon={Users} />}
      />

      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Edit Driver' : 'Add Driver'} size="lg"
        footer={<><Button variant="secondary" onClick={formModal.close}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" name="name" value={values.name} onChange={handleChange} error={errors.name} placeholder="Carlos Mendez" />
          <Input label="License Number" name="licenseNumber" value={values.licenseNumber} onChange={handleChange} error={errors.licenseNumber} placeholder="DL-TX-001234" />
          <Select label="License Category" name="licenseCategory" value={values.licenseCategory} onChange={handleChange} error={errors.licenseCategory} options={LICENSE_CATEGORIES} placeholder="Select category" />
          <Input label="License Expiry" name="licenseExpiry" type="date" value={values.licenseExpiry} onChange={handleChange} error={errors.licenseExpiry} />
          <Input label="Phone" name="phone" value={values.phone} onChange={handleChange} error={errors.phone} placeholder="+1 (555) 000-0000" />
          <Input label="Safety Score (0–100)" name="safetyScore" type="number" min="0" max="100" value={values.safetyScore} onChange={handleChange} error={errors.safetyScore} />
          <Select label="Status" name="status" value={values.status} onChange={handleChange} options={Object.values(DRIVER_STATUS)} placeholder="Select status" />
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete} title="Delete Driver"
        message={`Are you sure you want to delete "${deleteModal.data?.name}"?`} loading={deleting}
      />
    </div>
  );
};

export default DriversPage;
