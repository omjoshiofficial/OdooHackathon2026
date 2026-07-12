import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';
import { expenseApi } from '../../api/expenseApi';
import { vehicleApi } from '../../api/vehicleApi';
import { tripApi } from '../../api/tripApi';
import { useTable } from '../../hooks/useTable';
import { useModal } from '../../hooks/useModal';
import { useForm } from '../../hooks/useForm';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils';
import { EXPENSE_TYPES } from '../../constants';

const INITIAL = { vehicleId: '', tripId: '', type: '', amount: '', description: '', date: '' };

const validate = (v) => {
  const e = {};
  if (!v.vehicleId) e.vehicleId = 'Required';
  if (!v.type) e.type = 'Required';
  if (!v.amount || v.amount <= 0) e.amount = 'Must be > 0';
  if (!v.date) e.date = 'Required';
  return e;
};

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formModal = useModal();
  const deleteModal = useModal();
  const { values, errors, handleChange, runValidation, reset } = useForm(INITIAL, validate);

  const { rows, total, page, totalPages, setPage, search, handleSearch, sortKey, sortDir, handleSort, filters, handleFilter } = useTable(expenses, ['description', 'type']);

  useEffect(() => {
    Promise.all([expenseApi.getExpenses(), vehicleApi.getVehicles(), tripApi.getTrips()])
      .then(([e, v, t]) => { setExpenses(e.data); setVehicles(v.data); setTrips(t.data); })
      .catch(() => toast.error('Failed to load expenses.'))
      .finally(() => setLoading(false));
  }, []);

  const vehicleOptions = vehicles.map((v) => ({ value: v.id, label: `${v.registrationNumber} — ${v.name}` }));
  const tripOptions = [{ value: '', label: 'None' }, ...trips.map((t) => ({ value: t.id, label: `${t.source} → ${t.destination}` }))];

  const openCreate = () => { reset(INITIAL); formModal.open(null); };
  const openEdit = (e) => { reset(e); formModal.open(e); };

  const handleSave = async () => {
    if (!runValidation()) return;
    setSaving(true);
    try {
      if (formModal.data) {
        const updated = await expenseApi.updateExpense(formModal.data.id, values);
        setExpenses((prev) => prev.map((e) => e.id === formModal.data.id ? updated.data : e));
        toast.success('Expense updated.');
      } else {
        const created = await expenseApi.createExpense(values);
        setExpenses((prev) => [...prev, created.data]);
        toast.success('Expense added.');
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
      await expenseApi.deleteExpense(deleteModal.data.id);
      setExpenses((prev) => prev.filter((e) => e.id !== deleteModal.data.id));
      toast.success('Expense deleted.');
      deleteModal.close();
    } catch { toast.error('Delete failed.'); }
  };

  const getVehicleName = (id) => vehicles.find((v) => v.id === id)?.registrationNumber || id;
  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const columns = [
    { key: 'vehicleId', label: 'Vehicle', render: (v) => getVehicleName(v) },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'description', label: 'Description', render: (v) => <span className="text-xs text-gray-500 dark:text-gray-400">{v || '—'}</span> },
    { key: 'amount', label: 'Amount', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    {
      key: 'actions', label: '', render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><Pencil size={13} /></button>
          <button onClick={() => deleteModal.open(row)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="page-container"><SkeletonTable rows={5} cols={5} /></div>;

  return (
    <div className="page-container">
      <PageHeader title="Expenses" subtitle={`Total: ${formatCurrency(totalAmount)}`} breadcrumbs={[{ label: 'Expenses' }]}
        actions={<Button icon={Plus} onClick={openCreate}>Add Expense</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <SearchBar value={search} onChange={handleSearch} placeholder="Search expenses..." className="w-full sm:w-64" />
        <Select value={filters.type || ''} onChange={(e) => handleFilter('type', e.target.value)} options={EXPENSE_TYPES} placeholder="All Types" className="w-36" />
      </div>

      <DataTable columns={columns} rows={rows} total={total} page={page} totalPages={totalPages} onPageChange={setPage} sortKey={sortKey} sortDir={sortDir} onSort={handleSort}
        emptyState={<EmptyState title="No expenses found" icon={Receipt} />}
      />

      <Modal isOpen={formModal.isOpen} onClose={formModal.close} title={formModal.data ? 'Edit Expense' : 'Add Expense'} size="md"
        footer={<><Button variant="secondary" onClick={formModal.close}>Cancel</Button><Button onClick={handleSave} loading={saving}>Save</Button></>}
      >
        <div className="space-y-4">
          <Select label="Vehicle" name="vehicleId" value={values.vehicleId} onChange={handleChange} error={errors.vehicleId} options={vehicleOptions} placeholder="Select vehicle" />
          <Select label="Trip (Optional)" name="tripId" value={values.tripId} onChange={handleChange} options={tripOptions} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Expense Type" name="type" value={values.type} onChange={handleChange} error={errors.type} options={EXPENSE_TYPES} placeholder="Select type" />
            <Input label="Amount ($)" name="amount" type="number" step="0.01" value={values.amount} onChange={handleChange} error={errors.amount} />
          </div>
          <Input label="Date" name="date" type="date" value={values.date} onChange={handleChange} error={errors.date} />
          <Textarea label="Description" name="description" value={values.description} onChange={handleChange} placeholder="Describe the expense..." />
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteModal.isOpen} onClose={deleteModal.close} onConfirm={handleDelete} title="Delete Expense" message="Delete this expense record?" />
    </div>
  );
};

export default ExpensesPage;
