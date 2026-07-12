import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { VEHICLE_TYPES, VEHICLE_STATUS } from '../../constants';

const statusOptions = Object.values(VEHICLE_STATUS);
const typeOptions = VEHICLE_TYPES;

const VehicleForm = ({ values, errors, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Input label="Registration Number" name="registrationNumber" value={values.registrationNumber} onChange={onChange} error={errors.registrationNumber} placeholder="TRK-001" />
    <Input label="Vehicle Name" name="name" value={values.name} onChange={onChange} error={errors.name} placeholder="Freightliner Alpha" />
    <Input label="Model" name="model" value={values.model} onChange={onChange} error={errors.model} placeholder="Cascadia 2022" />
    <Select label="Type" name="type" value={values.type} onChange={onChange} error={errors.type} options={typeOptions} placeholder="Select type" />
    <Input label="Max Load Capacity (kg)" name="maxLoadCapacity" type="number" value={values.maxLoadCapacity} onChange={onChange} error={errors.maxLoadCapacity} placeholder="20000" />
    <Input label="Current Odometer (km)" name="currentOdometer" type="number" value={values.currentOdometer} onChange={onChange} error={errors.currentOdometer} placeholder="0" />
    <Input label="Acquisition Cost ($)" name="acquisitionCost" type="number" value={values.acquisitionCost} onChange={onChange} error={errors.acquisitionCost} placeholder="150000" />
    <Select label="Status" name="status" value={values.status} onChange={onChange} error={errors.status} options={statusOptions} placeholder="Select status" />
  </div>
);

export default VehicleForm;
