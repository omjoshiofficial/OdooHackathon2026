import { TrendingUp, TrendingDown } from 'lucide-react';
import { classNames } from '../../utils';

const colorMap = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, trendLabel }) => {
  return (
    <div className="card p-5 hover:shadow-card-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1 break-all leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          {trend !== undefined && (
            <div className={classNames('flex items-center gap-1 mt-2 text-xs font-medium', trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400')}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={classNames('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3', colorMap[color] || colorMap.blue)}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
