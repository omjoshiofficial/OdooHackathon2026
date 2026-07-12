import { classNames } from '../../utils';

const Select = ({ label, error, options = [], placeholder, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <select
        className={classNames('input', error && 'input-error', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Select;
