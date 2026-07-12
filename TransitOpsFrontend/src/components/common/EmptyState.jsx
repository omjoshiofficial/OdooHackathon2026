import { PackageOpen, AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({ title = 'No data found', description, action, icon: Icon = PackageOpen }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
      <Icon size={24} className="text-gray-400" />
    </div>
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
    {description && <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">{description}</p>}
    {action}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
      <AlertCircle size={24} className="text-red-500" />
    </div>
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Failed to load</h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-4">{message}</p>
    {onRetry && (
      <Button variant="secondary" size="sm" icon={RefreshCw} onClick={onRetry}>
        Try Again
      </Button>
    )}
  </div>
);
