'use client';

import { motion, type Variants } from 'framer-motion';
import { Suspense } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { formatRupiah } from '@/lib/utils';
import {
  MarketBasketPair,
  TopProduct,
  InventoryAlert,
  LatestTransaction,
} from '@/types/dashboard.types';
import type { ProductCategory } from '@/types/product.types';

import SalesChart from '@/components/ui/SalesChart';
import CategoryDonutChart from '@/components/ui/CategoryDonutChart';
import {
  DailyBarChart,
  StackedCategoryChart,
  PeakHoursHeatmap,
} from '@/components/ui/AdvanceChart';
import ExportButton from '@/components/ui/ExportButton';
import TransactionModal from '@/components/ui/TransactionModal';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function Dashboard() {
  // Panggil Custom Hook!
  const { state, setters, data, loaders, handlers, exportParams } =
    useDashboard();
  const latestTransactions = data.tableData?.latestTrx ?? [];
  const topProducts = data.tableData?.topProducts ?? [];

  // --- FRAMER MOTION VARIANTS ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
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

      {/* MODAL PEAK HOUR DRILL-DOWN */}
      {state.chartDrillThrough && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setters.setChartDrillThrough(null)}
          ></div>
          <div className="relative z-10 bg-white border-4 border-black w-full max-w-2xl shadow-[8px_8px_0px_#dc2626] p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-3">
              <div>
                <h2 className="font-black italic tracking-widest uppercase text-lg text-black">
                  Chart_Drill_Through
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                  {data.chartDrillData?.label || state.chartDrillThrough.label}
                </p>
              </div>
              <button
                onClick={() => setters.setChartDrillThrough(null)}
                className="text-black hover:text-red-600"
              >
                <X size={22} />
              </button>
            </div>
            {loaders.loadChartDrill ? (
              <div className="py-10 text-center font-black text-xs animate-pulse">
                LOADING_TRANSACTIONS...
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                {(data.chartDrillData?.transactions || []).length === 0 ? (
                  <div className="py-10 text-center font-black text-xs text-black/40">
                    NO_TRANSACTION_IN_THIS_POINT
                  </div>
                ) : (
                  <table className="w-full text-xs font-bold uppercase">
                    <thead className="bg-gray-50 border-b-2 border-black text-[10px] tracking-widest">
                      <tr>
                        <th className="p-3 text-left">Receipt</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Payment</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {data.chartDrillData?.transactions?.map(
                        (trx: LatestTransaction) => (
                          <tr
                            key={trx.id}
                            onClick={() => {
                              setters.setSelectedTrxId(trx.id);
                              setters.setIsModalOpen(true);
                            }}
                            className="cursor-pointer hover:bg-red-50"
                          >
                            <td className="p-3 font-black text-red-600">
                              {trx.receipt_no}
                            </td>
                            <td className="p-3 text-black/60">
                              {trx.trx_date || '-'}
                            </td>
                            <td className="p-3">{trx.payment_method || '-'}</td>
                            <td className="p-3 text-right font-black">
                              {formatRupiah(trx.total_amount)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {state.peakDrillDown && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setters.setPeakDrillDown(null)}
          ></div>
          <div className="relative z-10 bg-white border-4 border-black w-full max-w-md shadow-[8px_8px_0px_#dc2626] p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
              <h2 className="font-black italic tracking-widest uppercase text-lg text-black">
                {state.peakDrillDown.day} @ {state.peakDrillDown.hour}:00
              </h2>
              <button
                onClick={() => setters.setPeakDrillDown(null)}
                className="text-black hover:text-red-600 font-black"
              >
                X
              </button>
            </div>
            {loaders.loadPeakDetail ? (
              <div className="text-center py-10 font-black animate-pulse text-gray-400 text-xs">
                ANALYZING CORRELATION...
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">
                    Total Trafik:
                  </h3>
                  <div className="text-3xl font-black">
                    {data.peakDetailData?.total_trx}{' '}
                    <span className="text-sm">Struk</span>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 border-l-4 border-black">
                  <h3 className="text-[10px] font-black tracking-widest uppercase mb-3">
                    🔥 Menu Terlaris di Jam Ini:
                  </h3>
                  {data.peakDetailData?.top_items?.map(
                    (item: TopProduct, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs font-bold mb-1 border-b border-gray-300 pb-1"
                      >
                        <span className="uppercase">{item.name}</span>
                        <span className="text-red-600">
                          {item.total_qty} PCS
                        </span>
                      </div>
                    ),
                  )}
                </div>
                <div className="bg-red-50 p-4 border-2 border-red-600 shadow-[4px_4px_0px_#dc2626]">
                  <h3 className="text-[10px] font-black text-red-600 tracking-widest uppercase mb-3 flex items-center gap-2">
                    🤖 AI Bundling Suggestion:
                  </h3>
                  {data.peakDetailData?.market_basket?.length > 0 ? (
                    data.peakDetailData.market_basket.map(
                      (pair: MarketBasketPair, i: number) => (
                        <div
                          key={i}
                          className="text-xs font-bold uppercase mb-2 leading-relaxed"
                        >
                          Peluang Paket #{i + 1}: <br />
                          <span className="text-black font-black bg-white px-1 border border-black">
                            {pair.product_a}
                          </span>{' '}
                          +{' '}
                          <span className="text-black font-black bg-white px-1 border border-black">
                            {pair.product_b}
                          </span>
                          <div className="text-[9px] text-gray-500 mt-1 lowercase italic">
                            *(Dibeli bersamaan {pair.times_bought_together} kali
                            di jam ini)
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="text-xs font-bold italic text-gray-500">
                      Belum ada korelasi yang kuat.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            Central_Analytics
          </h1>
          <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1">
            DOM Social Hub Integrated System
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap justify-end gap-2">
            <input
              type="date"
              value={state.dateRange.start}
              onChange={(event) =>
                setters.setDateRange((current) => ({
                  ...current,
                  start: event.target.value,
                }))
              }
              className="bg-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase shadow-[4px_4px_0px_#000000] focus:outline-none"
            />
            <input
              type="date"
              value={state.dateRange.end}
              onChange={(event) =>
                setters.setDateRange((current) => ({
                  ...current,
                  end: event.target.value,
                }))
              }
              className="bg-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase shadow-[4px_4px_0px_#000000] focus:outline-none"
            />
            <select
              value={state.selectedCategoryId}
              onChange={(event) => setters.setSelectedCategoryId(event.target.value)}
              className="bg-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase shadow-[4px_4px_0px_#000000] focus:outline-none"
            >
              <option value="">ALL_CATEGORY</option>
              {data.categories.map((category: ProductCategory) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {(state.dateRange.start ||
              state.dateRange.end ||
              state.selectedCategoryId) && (
              <button
                onClick={() => {
                  setters.setDateRange({ start: '', end: '' });
                  setters.setSelectedCategoryId('');
                }}
                className="bg-red-600 text-white border-2 border-black px-3 py-2 text-[10px] font-black uppercase shadow-[4px_4px_0px_#000000]"
              >
                RESET_FILTER
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
          <div className="relative group">
            <select
              value={state.selectedYear}
              onChange={(e) => {
                setters.setSelectedYear(Number(e.target.value));
                handlers.handleBackToYear();
              }}
              className="appearance-none bg-white border-2 border-black px-4 py-2 pr-8 text-[10px] font-black uppercase text-black cursor-pointer shadow-[4px_4px_0px_#000000] focus:outline-none hover:bg-red-50 transition-colors"
            >
              {data.availableYears.map((y: number) => (
                <option key={y} value={y} className="font-bold">
                  THN {y}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <Suspense fallback={null}>
            <ExportButton queryString={exportParams} />
          </Suspense>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-700">
            <RefreshCw size={12} className="animate-spin" />
            Auto refresh {Math.round(state.autoRefreshMs / 1000)}s
            {state.lastRefreshedAt
              ? ` // Last ${state.lastRefreshedAt.toLocaleTimeString('id-ID')}`
              : ''}
          </div>
        </div>
      </header>

      {/* KPI SUMMARY CARDS */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between"
        >
          <h3 className="text-[10px] font-black italic tracking-[0.2em] uppercase text-gray-500 mb-2">
            {'// GROSS_REVENUE ('}
            {state.chartPeriod === 'year'
              ? state.selectedYear
              : data.chartData?.labels[0]?.split(' ')[1] || 'ALL'}
            )
          </h3>
          <div className="text-3xl lg:text-3xl font-black text-black break-words">
            {formatRupiah(data.kpiData?.revenue)}
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Total Struk: {data.kpiData?.transaction_count || 0} TRX
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-red-600 border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between text-white"
        >
          <h3 className="text-[10px] font-black italic tracking-[0.2em] uppercase text-white/70 mb-2">
            {'// NET_PROFIT (LABA BERSIH)'}
          </h3>
          <div className="text-3xl lg:text-3xl font-black break-words">
            {formatRupiah(data.kpiData?.net_profit)}
          </div>
          <p className="text-[10px] font-bold text-white/70 mt-2 uppercase tracking-widest">
            Uang yang bisa dicairkan
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between"
        >
          <h3 className="text-[10px] font-black italic tracking-[0.2em] uppercase text-gray-500 mb-2">
            {'// PROFIT_MARGIN (%)'}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-black">
              {data.kpiData?.profit_margin || 0}%
            </div>
            <div
              className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shrink-0 ${Number(data.kpiData?.profit_margin) >= 40 ? 'bg-green-400' : Number(data.kpiData?.profit_margin) >= 20 ? 'bg-yellow-400 text-black' : 'bg-red-400 text-white'}`}
            >
              {Number(data.kpiData?.profit_margin) >= 40
                ? 'HEALTHY'
                : Number(data.kpiData?.profit_margin) >= 20
                  ? 'WARNING'
                  : 'CRITICAL'}
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Modal/COGS: {formatRupiah(data.kpiData?.total_cogs)}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <div className="xl:col-span-3 p-4 md:p-8 bg-white border-2 border-black shadow-[6px_6px_0px_#000000]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black italic tracking-[0.2em] uppercase">
              {'// REVENUE_TREND'}
            </h3>
            {state.chartPeriod === 'month' && (
              <button
                onClick={handlers.handleBackToYear}
                className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_#444]"
              >
                BACK
              </button>
            )}
          </div>
          <div className="h-[350px]">
            <SalesChart
              key={`sales-chart-${data.chartData?.labels?.length || 0}-${JSON.stringify(data.chartData?.datasets || [])}`}
              labels={data.chartData?.labels || []}
              datasets={data.chartData?.datasets || []}
              onPointClick={handlers.handleChartClick}
              onLegendChange={setters.setHiddenCategories}
            />
          </div>
        </div>
        <div className="p-4 md:p-8 bg-white border-2 border-black shadow-[6px_6px_0px_#000000] flex flex-col h-full">
          <h3 className="text-xs font-black italic tracking-[0.2em] uppercase mb-8">
            VOLUME_COMPOSITION
          </h3>
          <div className="flex-grow">
            {data.donutData ? (
              <CategoryDonutChart
                key={`donut-chart-${JSON.stringify(data.donutData)}`}
                data={data.donutData}
              />
            ) : (
              <div className="animate-pulse bg-gray-100 h-full w-full"></div>
            )}
          </div>
          <p className="text-[8px] text-gray-400 font-bold mt-4 text-center leading-relaxed italic">
            *Berdasarkan jumlah unit produk terjual (PCS)
          </p>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col">
          <h3 className="text-xs font-black italic tracking-[0.2em] mb-4 uppercase">
            {'// PEAK_HOURS (Heatmap)'}
          </h3>
          <div className="flex-grow flex items-center">
            {data.advData?.peak_hours ? (
              <PeakHoursHeatmap
                data={data.advData.peak_hours}
                onCellClick={(day, hour) =>
                  setters.setPeakDrillDown({ day, hour })
                }
              />
            ) : (
              <div className="animate-pulse h-full w-full bg-gray-100"></div>
            )}
          </div>
          <p className="text-[9px] text-gray-500 font-bold mt-4">
            Warna merah pekat menandakan antrean kasir tertinggi.
          </p>
        </div>
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
          <h3 className="text-xs font-black italic tracking-[0.2em] mb-4 uppercase">
            {'// DAILY_REVENUE (Avg)'}
          </h3>
          <div className="h-[250px]">
            {data.advData?.daily_revenue && (
              <DailyBarChart
                key={`daily-chart-${JSON.stringify(data.advData.daily_revenue)}`}
                data={data.advData.daily_revenue}
              />
            )}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
          <h3 className="text-xs font-black italic tracking-[0.2em] mb-4 uppercase">
            {'// CATEGORY_STACK_TREND'}
          </h3>
          <div className="h-[250px]">
            {data.advData?.stacked_trend && data.chartData?.labels && (
              <StackedCategoryChart
                key={`stacked-chart-${JSON.stringify(data.advData.stacked_trend)}`}
                data={data.advData.stacked_trend}
                period={state.chartPeriod}
                labels={data.chartData.labels}
              />
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
      >
        <h3 className="text-xs font-black italic tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
          {'// BUNDLING_SUGGESTIONS'}{' '}
          <span className="bg-red-600 text-white px-2 py-0.5 text-[8px] not-italic">
            AI DRIVEN
          </span>
        </h3>
        <p className="text-[10px] text-gray-500 font-bold mb-6">
          Sistem mendeteksi pasangan produk yang paling sering dibeli dalam 1
          struk. Gunakan data ini untuk membuat Promo Paket.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {data.advData?.market_basket?.length > 0 ? (
            data.advData.market_basket.map(
              (pair: MarketBasketPair, idx: number) => (
                <div
                  key={idx}
                  className="border-2 border-gray-200 hover:border-black p-4 transition-colors group cursor-default flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] font-black uppercase text-red-600 mb-1">
                      Pasangan #{idx + 1}
                    </div>
                    <div className="font-black text-xs break-words">
                      {pair.product_a}
                    </div>
                    <div className="text-gray-400 font-black my-1 text-[10px]">
                      +
                    </div>
                    <div className="font-black text-xs break-words">
                      {pair.product_b}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-200 group-hover:border-black">
                    <div className="text-[20px] font-black">
                      {pair.times_bought_together}{' '}
                      <span className="text-[10px]">STRUK</span>
                    </div>
                  </div>
                </div>
              ),
            )
          ) : (
            <div className="col-span-full py-8 text-center text-gray-400 font-black italic text-xs">
              MENGUMPULKAN DATA KORELASI...
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <h3 className="text-xs font-black italic tracking-[0.2em] mb-6 uppercase">
              {'// Drill_Down_Logs (Recent 10)'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] uppercase font-bold tracking-wider">
                <thead className="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th className="p-3 text-left">RECEIPT_ID</th>
                    <th className="p-3 text-right">VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {latestTransactions.length > 0 ? (
                    latestTransactions.map((trx: LatestTransaction) => (
                      <tr
                        key={trx.id}
                        onClick={() => {
                          setters.setSelectedTrxId(trx.id);
                          setters.setIsModalOpen(true);
                        }}
                        className="hover:bg-red-50 cursor-pointer group"
                      >
                        <td className="p-3 group-hover:text-red-600 underline decoration-black/10">
                          {trx.receipt_no || `TRX-${trx.id}`}
                        </td>
                        <td className="p-3 text-right group-hover:text-red-600">
                          {formatRupiah(trx.total_amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="p-8 text-center italic text-gray-400"
                      >
                        NO_DATA
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <h3 className="text-xs font-black italic tracking-[0.2em] mb-6 uppercase">
              {'// Top_Selling_Items'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] uppercase font-bold tracking-wider">
                <thead className="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th className="p-3 text-left">PRODUCT</th>
                    <th className="p-3 text-center">QTY</th>
                    <th className="p-3 text-right">REVENUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {topProducts.length > 0 ? (
                    topProducts.map(
                      (item: TopProduct, i: number) => (
                        <tr key={i} className="hover:bg-red-50 group">
                          <td className="p-3 truncate max-w-[150px]">
                            {item.name}
                          </td>
                          <td className="p-3 text-center text-gray-500">
                            {item.total_qty} PCS
                          </td>
                          <td className="p-3 text-right">
                            {formatRupiah(item.total_revenue)}
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-8 text-center italic text-gray-400"
                      >
                        NO_DATA
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] h-fit">
          <div className="flex items-center gap-2 mb-6 text-red-600">
            <AlertTriangle size={18} className="animate-pulse" />
            <h3 className="text-xs font-black italic uppercase tracking-[0.2em]">
              Inventory_Alerts
            </h3>
          </div>
          <div className="space-y-4">
            {data.inventoryAlerts.length > 0 ? (
              data.inventoryAlerts.map((item: InventoryAlert, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border-2 border-red-600/20 bg-red-50/50 cursor-default"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black truncate max-w-[150px]">
                      {item.item_name}
                    </span>
                    {item.usage_per_trx !== undefined && (
                      <span className="text-[8px] text-gray-400 font-bold mt-0.5 uppercase">
                        Usage: {item.usage_per_trx} {item.unit || 'PCS'} / Trx
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0 ml-4">
                    <span className="text-[10px] font-black text-red-600 bg-white px-2 border-2 border-red-600">
                      {item.current_stock}{' '}
                      <span className="text-[8px] text-gray-500">
                        {item.unit || 'PCS'}
                      </span>
                    </span>
                    {item.min_stock !== undefined && (
                      <span className="text-[8px] text-gray-400 font-bold mt-1">
                        Min: {item.min_stock} {item.unit || 'PCS'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 font-black text-[10px] text-gray-400 border-2 border-dashed border-gray-200">
                ALL_STOCK_SECURE
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
