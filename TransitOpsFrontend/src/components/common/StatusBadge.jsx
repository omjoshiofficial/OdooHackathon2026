import { getStatusColor } from '../../utils';

const StatusBadge = ({ status, size = 'sm' }) => {
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClass} ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
