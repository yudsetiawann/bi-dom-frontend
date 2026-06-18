'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type {
  ActiveElement,
  Chart as ChartInstance,
  ChartEvent,
  LegendItem,
} from 'chart.js';
import type { SalesDataset } from '@/types/dashboard.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface SalesChartProps {
  labels: string[];
  datasets: SalesDataset[];
  onPointClick?: (index: number) => void;
  onLegendChange?: (hiddenCategoryIds: number[]) => void;
}

export default function SalesChart({
  labels,
  datasets,
  onPointClick,
  onLegendChange,
}: SalesChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements.length > 0 && onPointClick) onPointClick(elements[0].index);
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          font: { family: 'Montserrat', weight: 'bold' as const, size: 10 },
          usePointStyle: true,
          padding: 20,
        },
        onClick: (
          _event: ChartEvent,
          legendItem: LegendItem,
          legend: { chart: ChartInstance<'line'> },
        ) => {
          const index = legendItem.datasetIndex;
          if (typeof index !== 'number') return;

          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);

          // 1. Logika Toggle Animasi Default Chart.js
          meta.hidden = !meta.hidden;
          ci.update();

          // 2. Kumpulkan Array ID yang sedang disembunyikan
          const hiddenIds: number[] = [];
          ci.data.datasets.forEach((ds, i: number) => {
            const isHidden = ci.getDatasetMeta(i).hidden;
            const categoryId = (ds as SalesDataset).categoryId;
            if (isHidden && typeof categoryId === 'number') {
              hiddenIds.push(categoryId);
            }
          });

          // 3. Kirim ke Dashboard Page (Parent)
          if (onLegendChange) {
            onLegendChange(hiddenIds);
          }
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#000',
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return <Line data={chartData} options={options} />;
}
