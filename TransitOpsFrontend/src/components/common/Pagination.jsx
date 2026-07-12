import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, total, perPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  const pages = [];
  const delta = 1;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
        >
          <ChevronLeft size={15} />
        </button>
        {page > 2 && (
          <>
            <PageBtn n={1} current={page} onClick={onPageChange} />
            {page > 3 && <span className="px-1 text-gray-400 text-xs">…</span>}
          </>
        )}
        {pages.map((n) => <PageBtn key={n} n={n} current={page} onClick={onPageChange} />)}
        {page < totalPages - 1 && (
          <>
            {page < totalPages - 2 && <span className="px-1 text-gray-400 text-xs">…</span>}
            <PageBtn n={totalPages} current={page} onClick={onPageChange} />
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

const PageBtn = ({ n, current, onClick }) => (
  <button
    onClick={() => onClick(n)}
    className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
      n === current
        ? 'bg-primary-600 text-white'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
    }`}
  >
    {n}
  </button>
);

export default Pagination;
