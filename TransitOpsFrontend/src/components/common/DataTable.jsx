import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';
import { ITEMS_PER_PAGE } from '../../constants';

const SortIcon = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <ChevronsUpDown size={12} className="text-gray-400" />;
  return sortDir === 'asc'
    ? <ChevronUp size={12} className="text-primary-500" />
    : <ChevronDown size={12} className="text-primary-500" />;
};

const DataTable = ({
  columns,
  rows,
  total,
  page,
  totalPages,
  onPageChange,
  sortKey,
  sortDir,
  onSort,
  perPage = ITEMS_PER_PAGE,
  loading = false,
  emptyState,
}) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-header whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}
                  style={col.width ? { width: col.width } : {}}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState || <div className="py-12 text-center text-sm text-gray-400">No records found.</div>}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id || i} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} perPage={perPage} onPageChange={onPageChange} />
    </div>
  );
};

export default DataTable;
