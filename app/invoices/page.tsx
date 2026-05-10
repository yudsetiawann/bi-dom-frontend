'use client';

import { motion } from 'framer-motion';
import { useInvoices } from '@/hooks/useInvoices';
import { formatRupiah, formatDate } from '@/lib/utils';
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
  const { state, setters, data, loaders, handlers } = useInvoices();

  // --- FRAMER MOTION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (state.sortBy !== column)
      return <ChevronDown size={14} className="opacity-20 inline-block ml-1" />;
    return state.sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-red-600 inline-block ml-1" />
    ) : (
      <ChevronDown size={14} className="text-red-600 inline-block ml-1" />
    );
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto font-montserrat min-h-screen pb-20">
      <TransactionModal
        isOpen={state.isModalOpen}
        onClose={() => {
          setters.setIsModalOpen(false);
          setters.setSelectedTrxId(null);
        }}
        data={data.detailData}
        isLoading={loaders.loadDetail}
      />

      <header className="mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
          <FileText className="text-red-600" size={36} /> INVOICE_RECEIPTS
        </h1>
        <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1">
          Master Transaction Ledger
        </p>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]"
        >
          <form
            onSubmit={handlers.handleSearchSubmit}
            className="flex w-full md:w-auto"
          >
            <input
              type="text"
              placeholder="CARI RECEIPT NO..."
              value={state.searchInput}
              onChange={(e) => setters.setSearchInput(e.target.value)}
              className="border-2 border-black border-r-0 px-4 py-2 text-xs font-bold uppercase w-full md:w-64 outline-none focus:bg-gray-50"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 border-2 border-black hover:bg-red-600 transition-colors"
            >
              <Search size={16} />
            </button>
          </form>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="hidden md:block" />
            <select
              value={state.dateFilter}
              onChange={(e) => {
                setters.setDateFilter(e.target.value);
                setters.setPage(1);
              }}
              className="border-2 border-black px-4 py-2 text-xs font-black uppercase cursor-pointer outline-none hover:bg-gray-50 w-full md:w-auto"
            >
              <option value="all">ALL_TIME</option>
              <option value="today">HARI_INI</option>
              <option value="this_month">BULAN_INI</option>
              <option value="this_year">TAHUN_INI</option>
            </select>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white border-2 border-black shadow-[8px_8px_0px_#000000] overflow-hidden relative"
        >
          {data.isFetching && (
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
                    onClick={() => handlers.handleSort('receipt_no')}
                  >
                    RECEIPT_NO <SortIcon column="receipt_no" />
                  </th>
                  <th
                    className="p-4 text-left cursor-pointer hover:bg-gray-900 select-none hidden md:table-cell"
                    onClick={() => handlers.handleSort('created_at')}
                  >
                    DATE_TIME <SortIcon column="created_at" />
                  </th>
                  <th
                    className="p-4 text-center cursor-pointer hover:bg-gray-900 select-none hidden sm:table-cell"
                    onClick={() => handlers.handleSort('payment_method')}
                  >
                    PAYMENT <SortIcon column="payment_method" />
                  </th>
                  <th
                    className="p-4 text-right cursor-pointer hover:bg-gray-900 select-none"
                    onClick={() => handlers.handleSort('total_amount')}
                  >
                    TOTAL_VALUE <SortIcon column="total_amount" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20 text-black">
                {data.isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-12 text-center text-gray-400 font-black italic"
                    >
                      LOADING_DATA...
                    </td>
                  </tr>
                ) : data.invoiceData?.data?.length > 0 ? (
                  data.invoiceData.data.map((trx: any) => (
                    <tr
                      key={trx.id}
                      onClick={() => {
                        setters.setSelectedTrxId(trx.id);
                        setters.setIsModalOpen(true);
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
          {data.invoiceData?.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t-2 border-black bg-gray-50">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                PAGE {data.invoiceData.current_page} OF{' '}
                {data.invoiceData.last_page}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={data.invoiceData.current_page === 1}
                  onClick={() =>
                    setters.setPage((p: number) => Math.max(1, p - 1))
                  }
                  className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={
                    data.invoiceData.current_page === data.invoiceData.last_page
                  }
                  onClick={() => setters.setPage((p: number) => p + 1)}
                  className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
