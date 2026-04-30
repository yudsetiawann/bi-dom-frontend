// hooks/useInvoices.ts
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useInvoices() {
  // --- STATES ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [selectedTrxId, setSelectedTrxId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- QUERIES ---
  const {
    data: invoiceData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['invoices', page, search, dateFilter, sortBy, sortDir],
    queryFn: async () => {
      const res = await api.get(
        `/invoices?page=${page}&search=${search}&filter_date=${dateFilter}&sort_by=${sortBy}&sort_dir=${sortDir}&per_page=15`,
      );
      return res.data.data;
    },
    placeholderData: (previousData) => previousData, // Pengganti keepPreviousData di React Query v5
  });

  const { data: detailData, isLoading: loadDetail } = useQuery({
    queryKey: ['transactionDetail', selectedTrxId],
    queryFn: async () => {
      if (!selectedTrxId) return null;
      return (await api.get(`/dashboard/transactions/${selectedTrxId}`)).data
        .data;
    },
    enabled: !!selectedTrxId,
  });

  // --- HANDLERS ---
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return {
    state: {
      page,
      searchInput,
      dateFilter,
      sortBy,
      sortDir,
      selectedTrxId,
      isModalOpen,
    },
    setters: {
      setPage,
      setSearchInput,
      setDateFilter,
      setSelectedTrxId,
      setIsModalOpen,
    },
    data: { invoiceData, isLoading, isFetching, detailData },
    loaders: { loadDetail },
    handlers: { handleSort, handleSearchSubmit },
  };
}
