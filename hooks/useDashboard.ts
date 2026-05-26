// hooks/useDashboard.ts
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { InventoryAlert } from '@/types/dashboard.types';

export function useDashboard() {
  const currentYear = new Date().getFullYear();

  // --- GLOBAL STATES ---
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [chartPeriod, setChartPeriod] = useState<'year' | 'month'>('year');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(
    null,
  );
  const [hiddenCategories, setHiddenCategories] = useState<number[]>([]);

  // --- MODAL STATES ---
  const [selectedTrxId, setSelectedTrxId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peakDrillDown, setPeakDrillDown] = useState<{
    day: string;
    hour: number;
  } | null>(null);

  const getQueryParams = (includeExclude = false) => {
    let q = `?year=${effectiveSelectedYear}&period=${chartPeriod}`;
    if (selectedMonthIndex !== null) q += `&monthIndex=${selectedMonthIndex}`;
    if (includeExclude && hiddenCategories.length > 0)
      q += `&exclude=${hiddenCategories.join(',')}`;
    return q;
  };

  // --- DATA FETCHING ---
  const { data: availableYears = [] } = useQuery({
    queryKey: ['availableYears'],
    queryFn: async () =>
      (await api.get('/dashboard/available-years')).data.data,
  });

  const effectiveSelectedYear =
    availableYears.length > 0 && !availableYears.includes(selectedYear)
      ? availableYears[0]
      : selectedYear;

  const { data: kpiData } = useQuery({
    queryKey: [
      'kpi',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/kpi${getQueryParams(true)}`)).data.data,
  });

  const { data: chartData, isLoading: loadChart } = useQuery({
    queryKey: ['chart', effectiveSelectedYear, chartPeriod, selectedMonthIndex],
    queryFn: async () =>
      (await api.get(`/dashboard/charts${getQueryParams(false)}`)).data.data,
  });

  const { data: tableData } = useQuery({
    queryKey: [
      'tables',
      effectiveSelectedYear,
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
    queryKey: ['inventoryAlerts'], // Menggunakan cache yang sama dengan halaman Inventory
    queryFn: async () => (await api.get('/inventory/alerts')).data.data,
    // Gunakan fungsi SELECT untuk mem-filter data dari cache TANPA merusak struktur aslinya
    select: (data) => {
      const alerts = data?.inventory_alerts || [];
      return alerts.filter((item: InventoryAlert) => item.status === 'Kritis');
    },
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
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/advanced-analytics${getQueryParams(false)}`))
        .data.data,
  });

  const { data: peakDetailData, isLoading: loadPeakDetail } = useQuery({
    queryKey: [
      'peakDetail',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      peakDrillDown?.day,
      peakDrillDown?.hour,
    ],
    queryFn: async () => {
      if (!peakDrillDown) return null;
      return (
        await api.get(
          `/dashboard/peak-hour-detail${getQueryParams(false)}&day=${peakDrillDown.day}&hour=${peakDrillDown.hour}`,
        )
      ).data.data;
    },
    enabled: !!peakDrillDown,
  });

  const { data: donutData } = useQuery({
    queryKey: [
      'donut',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/donut-chart${getQueryParams(true)}`)).data
        .data,
  });

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

  // Export semua yang dibutuhkan oleh View (UI)
  return {
    state: {
      selectedYear: effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
      selectedTrxId,
      isModalOpen,
      peakDrillDown,
    },
    setters: {
      setSelectedYear,
      setHiddenCategories,
      setSelectedTrxId,
      setIsModalOpen,
      setPeakDrillDown,
    },
    data: {
      availableYears,
      kpiData,
      chartData,
      tableData,
      inventoryAlerts,
      detailData,
      advData,
      peakDetailData,
      donutData,
    },
    loaders: { loadChart, loadDetail, loadPeakDetail },
    handlers: { handleBackToYear, handleChartClick },
  };
}
