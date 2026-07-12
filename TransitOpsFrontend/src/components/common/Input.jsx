import { classNames } from '../../utils';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <input
        className={classNames('input', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
