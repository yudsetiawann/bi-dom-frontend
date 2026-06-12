// hooks/useDashboard.ts
import { useMemo, useState } from 'react';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // --- MODAL STATES ---
  const [selectedTrxId, setSelectedTrxId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peakDrillDown, setPeakDrillDown] = useState<{
    day: string;
    hour: number;
  } | null>(null);
  const [chartDrillThrough, setChartDrillThrough] = useState<{
    label: string;
    pointIndex: number;
    categoryId?: number;
  } | null>(null);

  const autoRefreshMs = 60000;

  const getQueryParams = (includeExclude = false) => {
    let q = `?year=${effectiveSelectedYear}&period=${chartPeriod}`;
    if (selectedMonthIndex !== null) q += `&monthIndex=${selectedMonthIndex}`;
    if (includeExclude && hiddenCategories.length > 0)
      q += `&exclude=${hiddenCategories.join(',')}`;
    if (dateRange.start && dateRange.end) {
      q += `&start_date=${dateRange.start}&end_date=${dateRange.end}`;
    }
    if (selectedCategoryId) q += `&category_id=${selectedCategoryId}`;
    return q;
  };

  const queryOptions = { refetchInterval: autoRefreshMs };

  // --- DATA FETCHING ---
  const { data: availableYears = [] } = useQuery({
    queryKey: ['availableYears'],
    queryFn: async () =>
      (await api.get('/dashboard/available-years')).data.data,
    ...queryOptions,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () =>
      (await api.get('/dashboard/categories-list')).data.data,
    ...queryOptions,
  });

  const effectiveSelectedYear =
    availableYears.length > 0 && !availableYears.includes(selectedYear)
      ? availableYears[0]
      : selectedYear;

  const { data: kpiData, dataUpdatedAt: kpiUpdatedAt } = useQuery({
    queryKey: [
      'kpi',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
      dateRange,
      selectedCategoryId,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/kpi${getQueryParams(true)}`)).data.data,
    ...queryOptions,
  });

  const { data: chartData, isLoading: loadChart } = useQuery({
    queryKey: [
      'chart',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      dateRange,
      selectedCategoryId,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/charts${getQueryParams(false)}`)).data.data,
    ...queryOptions,
  });

  const { data: tableData } = useQuery({
    queryKey: [
      'tables',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
      dateRange,
      selectedCategoryId,
    ],
    queryFn: async () => {
      const [trx, top] = await Promise.all([
        api.get(`/dashboard/transactions${getQueryParams(true)}`),
        api.get(`/dashboard/top-products${getQueryParams(true)}`),
      ]);
      return { latestTrx: trx.data.data, topProducts: top.data.data };
    },
    ...queryOptions,
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

  const { data: chartDrillData, isLoading: loadChartDrill } = useQuery({
    queryKey: [
      'chartDrill',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      dateRange,
      selectedCategoryId,
      chartDrillThrough?.pointIndex,
      chartDrillThrough?.categoryId,
    ],
    queryFn: async () => {
      if (!chartDrillThrough) return null;
      const categoryParam = chartDrillThrough.categoryId
        ? `&clickedCategoryId=${chartDrillThrough.categoryId}`
        : '';
      return (
        await api.get(
          `/dashboard/chart-transactions${getQueryParams(false)}&pointIndex=${chartDrillThrough.pointIndex}${categoryParam}`,
        )
      ).data.data;
    },
    enabled: !!chartDrillThrough,
  });

  const { data: advData } = useQuery({
    queryKey: [
      'advancedAnalytics',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      dateRange,
      selectedCategoryId,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/advanced-analytics${getQueryParams(false)}`))
        .data.data,
    ...queryOptions,
  });

  const { data: peakDetailData, isLoading: loadPeakDetail } = useQuery({
    queryKey: [
      'peakDetail',
      effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      peakDrillDown?.day,
      peakDrillDown?.hour,
      dateRange,
      selectedCategoryId,
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
      dateRange,
      selectedCategoryId,
    ],
    queryFn: async () =>
      (await api.get(`/dashboard/donut-chart${getQueryParams(true)}`)).data
        .data,
    ...queryOptions,
  });

  const handleBackToYear = () => {
    setChartPeriod('year');
    setSelectedMonthIndex(null);
    setChartDrillThrough(null);
  };

  const handleChartClick = (idx: number, datasetIndex: number) => {
    const clickedDataset = chartData?.datasets?.[datasetIndex];
    const categoryId =
      typeof clickedDataset?.categoryId === 'number'
        ? clickedDataset.categoryId
        : undefined;

    if (chartPeriod === 'year') {
      setChartPeriod('month');
      setSelectedMonthIndex(idx);
      setChartDrillThrough(null);
      return;
    }

    setChartDrillThrough({
      label: chartData?.labels?.[idx] || 'Selected Period',
      pointIndex: idx,
      categoryId,
    });
  };

  const exportParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('year', String(effectiveSelectedYear));
    params.set('period', chartPeriod);
    if (selectedMonthIndex !== null)
      params.set('monthIndex', String(selectedMonthIndex));
    if (dateRange.start && dateRange.end) {
      params.set('start_date', dateRange.start);
      params.set('end_date', dateRange.end);
    }
    if (selectedCategoryId) params.set('category_id', selectedCategoryId);
    return params.toString();
  }, [
    effectiveSelectedYear,
    chartPeriod,
    selectedMonthIndex,
    dateRange,
    selectedCategoryId,
  ]);

  // Export semua yang dibutuhkan oleh View (UI)
  return {
    state: {
      selectedYear: effectiveSelectedYear,
      chartPeriod,
      selectedMonthIndex,
      hiddenCategories,
      selectedCategoryId,
      dateRange,
      selectedTrxId,
      isModalOpen,
      peakDrillDown,
      chartDrillThrough,
      lastRefreshedAt: kpiUpdatedAt ? new Date(kpiUpdatedAt) : null,
      autoRefreshMs,
    },
    setters: {
      setSelectedYear,
      setHiddenCategories,
      setSelectedCategoryId,
      setDateRange,
      setSelectedTrxId,
      setIsModalOpen,
      setPeakDrillDown,
      setChartDrillThrough,
    },
    data: {
      availableYears,
      categories,
      kpiData,
      chartData,
      tableData,
      inventoryAlerts,
      detailData,
      chartDrillData,
      advData,
      peakDetailData,
      donutData,
    },
    loaders: { loadChart, loadDetail, loadPeakDetail, loadChartDrill },
    handlers: { handleBackToYear, handleChartClick },
    exportParams,
  };
}
