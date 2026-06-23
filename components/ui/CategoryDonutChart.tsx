'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Plugin,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '@/lib/constants'; // <-- Gunakan constant global
import type { TooltipItem } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutProps {
  data: { label: string; value: number }[];
}

export default function CategoryDonutChart({ data }: DonutProps) {
  const totalQty = data.reduce((sum, item) => sum + Number(item.value), 0);

  const chartData = {
    labels: data.map((d) => d.label.toUpperCase()),
    datasets: [
      {
        data: data.map((d) => Number(d.value)),
        backgroundColor: CHART_COLORS, // <-- Otomatis memanggil warna dari constant
        borderColor: '#fff',
        borderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { family: 'Montserrat', weight: 'bold' as const, size: 9 },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#000',
        callbacks: {
          label: (context: TooltipItem<'doughnut'>) => {
            const val = context.raw;
            const percentage =
              totalQty > 0 ? ((Number(val) / totalQty) * 100).toFixed(1) : '0';
            return ` ${Number(val).toLocaleString('id-ID')} PCS (${percentage}%)`;
          },
        },
      },
    },
    cutout: '65%',
  };

  const customCanvasDrawings: Plugin<'doughnut'> = {
    id: 'customCanvasDrawings',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);
      const centerX = meta.data[0]?.x;
      const centerY = meta.data[0]?.y;

      const isMobile = chart.width < 250;
      const titleFontSize = isMobile ? 8 : 9;
      const numberFontSize = isMobile ? 12 : 16;
      const percentFontSize = isMobile ? 9 : 12;

      if (centerX && centerY && totalQty > 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${titleFontSize}px Montserrat, sans-serif`;
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('TOTAL VOLUME', centerX, centerY - (isMobile ? 8 : 12));
        ctx.font = `900 ${numberFontSize}px Montserrat, sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.fillText(
          `${totalQty.toLocaleString('id-ID')} PCS`,
          centerX,
          centerY + (isMobile ? 8 : 12),
        );
      }

      chart.data.datasets.forEach((dataset, i) => {
        const currentMeta = chart.getDatasetMeta(i);
        currentMeta.data.forEach((element, index) => {
          const value = dataset.data[index] as number;
          if (value > 0 && totalQty > 0) {
            const percentage = (value / totalQty) * 100;
            if (percentage > 5) {
              const { x, y } = element.tooltipPosition(true);
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${percentFontSize}px Montserrat, sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0,0,0,0.5)';
              ctx.shadowBlur = 3;
              if (x !== null && y !== null) {
                // Gunakan 1 desimal untuk menghindari error pembulatan (misal total jadi 99%)
                ctx.fillText(`${percentage.toFixed(1)}%`, x, y);
              }
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }
          }
        });
      });
    },
  };

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center pb-2">
      <Doughnut
        data={chartData}
        options={options}
        plugins={[customCanvasDrawings]}
      />
    </div>
  );
}
