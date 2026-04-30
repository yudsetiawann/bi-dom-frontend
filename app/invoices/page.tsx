'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import TransactionModal from '@/components/ui/TransactionModal';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  CalendarDays,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function InvoiceReceiptPage() {
  // --- STATES UNTUK FILTER, SORT, SEARCH, & PAGINATION ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Untuk nahan text sebelum tekan Enter
  const [dateFilter, setDateFilter] = useState('all'); // all, today, this_month, this_year
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // --- STATES UNTUK MODAL ---
  const [selectedTrxId, setSelectedTrxId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FETCH ALL INVOICES ---
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
      return res.data.data; // Mengembalikan object pagination Laravel
    },
    keepPreviousData: true, // Biar tabel gak kedip saat ganti halaman
  });

  // --- FETCH DETAIL (REUSE DARI DASHBOARD) ---
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
    setPage(1); // Reset ke halaman 1 tiap kali sort
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const formatRupiah = (num: any) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(num) || 0);
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  // Komponen Helper untuk Icon Sort
  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column)
      return <ChevronDown size={14} className="opacity-20 inline-block ml-1" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-red-600 inline-block ml-1" />
    ) : (
      <ChevronDown size={14} className="text-red-600 inline-block ml-1" />
    );
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto font-montserrat min-h-screen pb-20">
      {/* DAUR ULANG MODAL DARI DASHBOARD */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTrxId(null);
        }}
        data={detailData}
        isLoading={loadDetail}
      />

      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <FileText className="text-red-600" size={36} /> INVOICE_RECEIPTS
        </h1>
        <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1">
          Master Transaction Ledger
        </p>
      </header>

      {/* TOOLBAR: SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
        {/* SEARCH FORM */}
        <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto">
          <input
            type="text"
            placeholder="CARI RECEIPT NO..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border-2 border-black border-r-0 px-4 py-2 text-xs font-bold uppercase w-full md:w-64 outline-none focus:bg-gray-50"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-red-600 transition-colors"
          >
            <Search size={16} />
          </button>
        </form>

        {/* DATE FILTER DROPDOWN */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="hidden md:block" />
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="border-2 border-black px-4 py-2 text-xs font-black uppercase cursor-pointer outline-none hover:bg-gray-50 w-full md:w-auto"
          >
            <option value="all">ALL_TIME</option>
            <option value="today">HARI_INI</option>
            <option value="this_month">BULAN_INI</option>
            <option value="this_year">TAHUN_INI</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_#000000] overflow-hidden relative">
        {/* Loading Overlay */}
        {isFetching && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="bg-black text-white px-4 py-2 text-xs font-black tracking-widest animate-pulse">
              UPDATING_LEDGER...
            </span>
          </div>
        )}

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs uppercase font-bold tracking-wider">
            <thead className="bg-black text-white">
              <tr>
                <th
                  className="p-4 text-left cursor-pointer hover:bg-gray-900 select-none"
                  onClick={() => handleSort('receipt_no')}
                >
                  RECEIPT_NO <SortIcon column="receipt_no" />
                </th>
                <th
                  className="p-4 text-left cursor-pointer hover:bg-gray-900 select-none hidden md:table-cell"
                  onClick={() => handleSort('created_at')}
                >
                  DATE_TIME <SortIcon column="created_at" />
                </th>
                <th
                  className="p-4 text-center cursor-pointer hover:bg-gray-900 select-none hidden sm:table-cell"
                  onClick={() => handleSort('payment_method')}
                >
                  PAYMENT <SortIcon column="payment_method" />
                </th>
                <th
                  className="p-4 text-right cursor-pointer hover:bg-gray-900 select-none"
                  onClick={() => handleSort('total_amount')}
                >
                  TOTAL_VALUE <SortIcon column="total_amount" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/20 text-black">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-400 font-black italic"
                  >
                    LOADING_DATA...
                  </td>
                </tr>
              ) : invoiceData?.data?.length > 0 ? (
                invoiceData.data.map((trx: any) => (
                  <tr
                    key={trx.id}
                    onClick={() => {
                      setSelectedTrxId(trx.id);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-red-50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 font-black group-hover:text-red-600 underline decoration-black/10 underline-offset-4">
                      {trx.receipt_no}
                    </td>
                    <td className="p-4 hidden md:table-cell flex items-center gap-2">
                      <CalendarDays
                        size={14}
                        className="inline mr-2 text-gray-400"
                      />
                      {formatDate(trx.created_at)}
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      <span className="bg-gray-100 px-2 py-1 border border-black/20 text-[10px]">
                        {trx.payment_method || 'CASH'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black group-hover:text-red-600">
                      {formatRupiah(trx.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-gray-400 font-black italic"
                  >
                    NO_INVOICES_FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {invoiceData?.last_page > 1 && (
          <div className="flex items-center justify-between p-4 border-t-2 border-black bg-gray-50">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              PAGE {invoiceData.current_page} OF {invoiceData.last_page}
            </span>
            <div className="flex gap-2">
              <button
                disabled={invoiceData.current_page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={invoiceData.current_page === invoiceData.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
