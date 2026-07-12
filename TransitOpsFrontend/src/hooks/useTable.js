import { useState, useMemo } from 'react';
import { sortByKey, filterBySearch, paginate } from '../utils';
import { ITEMS_PER_PAGE } from '../constants';

export const useTable = (data = [], searchKeys = [], perPage = ITEMS_PER_PAGE) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const filtered = useMemo(() => {
    let result = filterBySearch(data, search, searchKeys);
    Object.entries(filters).forEach(([key, val]) => {
      if (val) result = result.filter((item) => item[key] === val);
    });
    if (sortKey) result = sortByKey(result, sortKey, sortDir);
    return result;
  }, [data, search, sortKey, sortDir, filters]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = useMemo(() => paginate(filtered, page, perPage), [filtered, page, perPage]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  return {
    rows: paginated,
    total: filtered.length,
    page,
    totalPages,
    setPage,
    search,
    handleSearch,
    sortKey,
    sortDir,
    handleSort,
    filters,
    handleFilter,
    clearFilters,
  };
};
