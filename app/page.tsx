'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import KpiCard from '@/components/ui/KpiCard';
import SalesChart from '@/components/ui/SalesChart';
import CategoryDonutChart from '@/components/ui/CategoryDonutChart';
import {
  DailyBarChart,
  StackedCategoryChart,
  PeakHoursHeatmap,
} from '@/components/ui/AdvanceChart';
import ExportButton from '@/components/ui/ExportButton';
import TransactionModal from '@/components/ui/TransactionModal';
import { AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const currentYear = new Date().getFullYear();

  // --- STATE ---
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [chartPeriod, setChartPeriod] = useState<'year' | 'month'>('year');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(
    null,
  );
  const [hiddenCategories, setHiddenCategories] = useState<number[]>([]);
  const [selectedTrxId, setSelectedTrxId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- GET PARAMS URL BUILDER ---
  const getQueryParams = (includeExclude = false) => {
    let q = `?year=${selectedYear}&period=${chartPeriod}`;
    if (selectedMonthIndex !== null) q += `&monthIndex=${selectedMonthIndex}`;
    if (includeExclude && hiddenCategories.length > 0)
      q += `&exclude=${hiddenCategories.join(',')}`;
    return q;
  };

  // --- FETCH QUERIES ---
  const { data: availableYears = [] } = useQuery({
    queryKey: ['availableYears'],
    queryFn: async () =>
      (await api.get('/dashboard/available-years')).data.data,
  });

  const { data: kpiData } = useQuery({
    queryKey: [
      'kpi',
      selectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/kpi${getQueryParams(true)}`)).data.data,
  });

  const { data: chartData, isLoading: loadChart } = useQuery({
    queryKey: ['chart', selectedYear, chartPeriod, selectedMonthIndex],
    queryFn: async () =>
      (await api.get(`/dashboard/charts${getQueryParams(false)}`)).data.data,
  });

  const { data: tableData } = useQuery({
    queryKey: [
      'tables',
      selectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
    ],
    queryFn: async () => {
      const [trx, top] = await Promise.all([
        api.get(`/dashboard/transactions${getQueryParams(true)}`),
        api.get(`/dashboard/top-products${getQueryParams(true)}`),
      ]);
      return { latestTrx: trx.data.data, topProducts: top.data.data };
    },
  });

  const { data: inventoryAlerts = [] } = useQuery({
    queryKey: ['inventoryAlerts'],
    queryFn: async () =>
      (await api.get('/dashboard/inventory-alerts')).data.data,
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

  const { data: advData } = useQuery({
    queryKey: [
      'advancedAnalytics',
      selectedYear,
      chartPeriod,
      selectedMonthIndex,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/advanced-analytics${getQueryParams(false)}`))
        .data.data,
  });

  // --- EFFECTS & HANDLERS ---
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears]);

  const handleBackToYear = () => {
    setChartPeriod('year');
    setSelectedMonthIndex(null);
  };

  const handleChartClick = (idx: number) => {
    if (chartPeriod === 'year') {
      setChartPeriod('month');
      setSelectedMonthIndex(idx);
    }
  };

  const formatRupiah = (number: any) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(number) || 0);

  const { data: donutData } = useQuery({
    queryKey: [
      'donut',
      selectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/donut-chart${getQueryParams(true)}`)).data
        .data,
  });

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto font-montserrat min-h-screen pb-20">
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
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">
            Central_Analytics
          </h1>
          <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1">
            DOM Social Hub Integrated System
          </p>
        </div>
        <div className="flex bg-white border-2 border-black shadow-[4px_4px_0px_#000000]">
          {availableYears.map((y: number) => (
            <button
              key={y}
              onClick={() => {
                setSelectedYear(y);
                handleBackToYear();
              }}
              className={`px-4 py-2 text-[10px] font-black uppercase transition-colors border-r-2 border-black last:border-r-0 ${selectedYear === y ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}
            >
              {y}
            </button>
          ))}
          <ExportButton />
        </div>
      </header>

      {/* KPI */}
      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
        {/* CARD 1: GROSS REVENUE (KOTOR) */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between">
          <h3 className="text-[10px] font-black italic tracking-[0.2em] uppercase text-gray-500 mb-2">
            // GROSS_REVENUE (
            {chartPeriod === 'year'
              ? selectedYear
              : chartData?.labels[0]?.split(' ')[1] || 'ALL'}
            )
          </h3>
          <div className="text-3xl lg:text-3xl font-black text-black break-words">
            {formatRupiah(kpiData?.revenue)}
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Total Struk: {kpiData?.transaction_count || 0} TRX
          </p>
        </div>

        {/* CARD 2: NET PROFIT (BERSIH) */}
        <div className="bg-red-600 border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between text-white">
          <h3 className="text-[10px] font-black italic tracking-[0.2em] uppercase text-white/70 mb-2">
            // NET_PROFIT (LABA BERSIH)
          </h3>
          <div className="text-3xl lg:text-3xl font-black break-words">
            {formatRupiah(kpiData?.net_profit)}
          </div>
          <p className="text-[10px] font-bold text-white/70 mt-2 uppercase tracking-widest">
            Uang yang bisa dicairkan
          </p>
        </div>

        {/* CARD 3: PROFIT MARGIN */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between">
          <h3 className="text-[10px] font-black italic tracking-[0.2em] uppercase text-gray-500 mb-2">
            // PROFIT_MARGIN (%)
          </h3>
          <div className="flex items-end gap-3">
            <div className="text-4xl lg:text-5xl font-black text-black">
              {kpiData?.profit_margin || 0}%
            </div>
            {/* Indikator Status Kesehatan Bisnis */}
            <div
              className={`px-3 py-1 mb-1 text-xs font-black uppercase border-2 border-black ${
                Number(kpiData?.profit_margin) >= 40
                  ? 'bg-green-400'
                  : Number(kpiData?.profit_margin) >= 20
                    ? 'bg-yellow-400 text-black'
                    : 'bg-red-400 text-white'
              }`}
            >
              {Number(kpiData?.profit_margin) >= 40
                ? 'HEALTHY'
                : Number(kpiData?.profit_margin) >= 20
                  ? 'WARNING'
                  : 'CRITICAL'}
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
            Modal/COGS: {formatRupiah(kpiData?.total_cogs)}
          </p>
        </div>
      </div>

      {/* CHART */}
      {/* <div className="p-4 md:p-6 mb-8 bg-white border-2 border-black shadow-[6px_6px_0px_#000000]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-black italic uppercase tracking-[0.2em] flex items-center gap-2">
              <Layers size={16} className="text-red-600" /> //{' '}
              {chartData?.title || 'SYNCING...'}
            </h3>
            {chartPeriod === 'month' && (
              <button
                onClick={handleBackToYear}
                className="flex items-center gap-1 bg-black text-white px-3 py-1 text-[9px] font-black uppercase hover:bg-red-600 shadow-[2px_2px_0px_#444]"
              >
                <ArrowLeft size={12} /> BACK
              </button>
            )}
          </div>
        </div>
        <div className="h-[300px] md:h-[400px] w-full relative">
          {loadChart ? (
            <div className="w-full h-full flex items-center justify-center font-black animate-pulse text-xs text-gray-400">
              SYNCING_DATA...
            </div>
          ) : (
            <SalesChart
              labels={chartData?.labels || []}
              datasets={chartData?.datasets || []}
              onPointClick={(idx) => {
                if (chartPeriod === 'year') {
                  setChartPeriod('month');
                  setSelectedMonthIndex(idx);
                }
              }}
              onLegendChange={setHiddenCategories}
            />
          )}
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        {/* LINE CHART (Kiri - 3 Kolom) */}
        <div className="lg:col-span-3 p-4 md:p-8 bg-white border-2 border-black shadow-[6px_6px_0px_#000000]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-black italic tracking-[0.2em] uppercase">
              // REVENUE_TREND
            </h3>
            {chartPeriod === 'month' && (
              <button
                onClick={handleBackToYear}
                className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_#444]"
              >
                BACK
              </button>
            )}
          </div>
          <div className="h-[350px]">
            <SalesChart
              labels={chartData?.labels || []}
              datasets={chartData?.datasets || []}
              onPointClick={handleChartClick}
              onLegendChange={setHiddenCategories}
            />
          </div>
        </div>

        {/* DONUT CHART (Kanan - 1 Kolom) */}
        {/* DONUT CHART (Kanan - 1 Kolom) */}
        <div className="p-4 md:p-8 bg-white border-2 border-black shadow-[6px_6px_0px_#000000] flex flex-col h-full">
          {/* UBAH JUDUL DI SINI */}
          <h3 className="text-xs font-black italic tracking-[0.2em] uppercase mb-8">
            VOLUME_COMPOSITION
          </h3>
          <div className="flex-grow">
            {donutData ? (
              <CategoryDonutChart data={donutData} />
            ) : (
              <div className="animate-pulse bg-gray-100 h-full w-full"></div>
            )}
          </div>
          {/* UBAH DESKRIPSI DI BAWAH DI SINI */}
          <p className="text-[8px] text-gray-400 font-bold mt-4 text-center leading-relaxed italic">
            *Berdasarkan jumlah unit produk terjual (PCS)
          </p>
        </div>
      </div>

      {/* ADVANCED ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* HEATMAP: PEAK HOURS */}
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col">
          <h3 className="text-xs font-black italic tracking-[0.2em] mb-4 uppercase">
            // PEAK_HOURS (Heatmap)
          </h3>
          <div className="flex-grow flex items-center">
            {advData?.peak_hours ? (
              <PeakHoursHeatmap data={advData.peak_hours} />
            ) : (
              <div className="animate-pulse h-full w-full bg-gray-100"></div>
            )}
          </div>
          <p className="text-[9px] text-gray-500 font-bold mt-4">
            Warna merah pekat menandakan antrean kasir tertinggi.
          </p>
        </div>

        {/* BAR CHART: DAILY REVENUE */}
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
          <h3 className="text-xs font-black italic tracking-[0.2em] mb-4 uppercase">
            // DAILY_REVENUE (Avg)
          </h3>
          <div className="h-[250px]">
            {advData?.daily_revenue && (
              <DailyBarChart data={advData.daily_revenue} />
            )}
          </div>
        </div>

        {/* STACKED BAR: CATEGORY TREND */}
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
          <h3 className="text-xs font-black italic tracking-[0.2em] mb-4 uppercase">
            // CATEGORY_STACK_TREND
          </h3>
          <div className="h-[250px]">
            {advData?.stacked_trend && chartData?.labels && (
              <StackedCategoryChart
                data={advData.stacked_trend}
                period={chartPeriod}
                labels={chartData.labels}
              />
            )}
          </div>
        </div>
      </div>

      {/* MARKET BASKET (BUNDLING RECOMMENDATIONS) */}
      <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] mb-8">
        <h3 className="text-xs font-black italic tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
          // BUNDLING_SUGGESTIONS{' '}
          <span className="bg-red-600 text-white px-2 py-0.5 text-[8px] not-italic">
            AI DRIVEN
          </span>
        </h3>
        <p className="text-[10px] text-gray-500 font-bold mb-6">
          Sistem mendeteksi pasangan produk yang paling sering dibeli dalam 1
          struk yang sama. Gunakan data ini untuk membuat Promo Paket.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {advData?.market_basket?.length > 0 ? (
            advData.market_basket.map((pair: any, idx: number) => (
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
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-gray-400 font-black italic text-xs">
              MENGUMPULKAN DATA KORELASI...
            </div>
          )}
        </div>
      </div>

      {/* 3-COLUMN GRID: RECENT TRX (2) & INVENTORY (1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT TRX & TOP PRODUCTS */}
        <div className="lg:col-span-2 space-y-8">
          {/* LATEST TRANSACTIONS */}
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <h3 className="text-xs font-black italic tracking-[0.2em] mb-6 uppercase">
              // Drill_Down_Logs (Recent 10)
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
                  {tableData?.latestTrx?.length > 0 ? (
                    tableData.latestTrx.map((trx: any) => (
                      <tr
                        key={trx.id}
                        onClick={() => {
                          setSelectedTrxId(trx.id);
                          setIsModalOpen(true);
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

          {/* TOP PRODUCTS */}
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <h3 className="text-xs font-black italic tracking-[0.2em] mb-6 uppercase">
              // Top_Selling_Items
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
                  {tableData?.topProducts?.length > 0 ? (
                    tableData.topProducts.map((item: any, i: number) => (
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
                    ))
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

        {/* INVENTORY ALERTS */}
        <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000] h-fit">
          <div className="flex items-center gap-2 mb-6 text-red-600">
            <AlertTriangle size={18} className="animate-pulse" />
            <h3 className="text-xs font-black italic uppercase tracking-[0.2em]">
              Inventory_Alerts
            </h3>
          </div>
          <div className="space-y-4">
            {inventoryAlerts.length > 0 ? (
              inventoryAlerts.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border-2 border-red-600/20 bg-red-50/50 hover:bg-red-100 transition-colors cursor-default"
                >
                  <span className="text-[10px] font-black truncate max-w-[120px]">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-black text-red-600 bg-white px-2 border-2 border-red-600">
                    {item.stock}{' '}
                    <span className="text-[8px] text-gray-500">
                      {item.unit || 'PCS'}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10 font-black text-[10px] text-gray-400 border-2 border-dashed border-gray-200">
                ALL_STOCK_SECURE
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
