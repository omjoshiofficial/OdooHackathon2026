import { classNames } from '../../utils';

const Textarea = ({ label, error, className = '', rows = 3, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <textarea
        rows={rows}
        className={classNames('input resize-none', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Textarea;
