import { STATUS_COLORS } from '../constants';

export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);

export const formatNumber = (num) =>
  new Intl.NumberFormat('en-US').format(num ?? 0);

export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const isLicenseExpired = (expiryDate) => {
  if (!expiryDate) return true;
  return new Date(expiryDate) < new Date();
};

export const isLicenseExpiringSoon = (expiryDate, days = 30) => {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + days);
  return expiry > new Date() && expiry <= threshold;
};

export const getStatusColor = (status) => {
  const color = STATUS_COLORS[status] || 'gray';
  const map = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return map[color] || map.gray;
};

export const getStatusDot = (status) => {
  const color = STATUS_COLORS[status] || 'gray';
  const map = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };
  return map[color] || map.gray;
};

export const truncate = (str, length = 30) => {
  if (!str) return '';
  return str.length > length ? `${str.slice(0, length)}...` : str;
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const sortByKey = (arr, key, direction = 'asc') => {
  return [...arr].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (valA == null) return 1;
    if (valB == null) return -1;
    const cmp = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
    return direction === 'asc' ? cmp : -cmp;
  });
};

export const filterBySearch = (arr, query, keys) => {
  if (!query) return arr;
  const q = query.toLowerCase();
  return arr.filter((item) =>
    keys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
  );
};

export const paginate = (arr, page, perPage) => {
  const start = (page - 1) * perPage;
  return arr.slice(start, start + perPage);
};

export const calcFuelEfficiency = (distance, liters) => {
  if (!liters || liters === 0) return 0;
  return (distance / liters).toFixed(2);
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');
