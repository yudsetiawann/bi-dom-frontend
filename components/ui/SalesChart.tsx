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
  datasets: any[];
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
    onClick: (event: any, elements: any[]) => {
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
        onClick: (e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);

          // 1. Logika Toggle Animasi Default Chart.js
          meta.hidden =
            meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();

          // 2. Kumpulkan Array ID yang sedang disembunyikan
          const hiddenIds: number[] = [];
          ci.data.datasets.forEach((ds: any, i: number) => {
            const isHidden = ci.getDatasetMeta(i).hidden;
            if (isHidden) hiddenIds.push(ds.categoryId);
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
