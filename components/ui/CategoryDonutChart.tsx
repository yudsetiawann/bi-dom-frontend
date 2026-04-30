'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Plugin,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutProps {
  data: { label: string; value: number }[];
}

export default function CategoryDonutChart({ data }: DonutProps) {
  const totalQty = data.reduce((sum, item) => sum + Number(item.value), 0);
  const colorPalette = [
    '#dc2626',
    '#2563eb',
    '#16a34a',
    '#ca8a04',
    '#7c3aed',
    '#db2777',
  ];

  const chartData = {
    labels: data.map((d) => d.label.toUpperCase()),
    datasets: [
      {
        data: data.map((d) => Number(d.value)),
        backgroundColor: colorPalette,
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
          label: (context: any) => {
            const val = context.raw;
            const percentage =
              totalQty > 0 ? ((val / totalQty) * 100).toFixed(1) : '0';
            return ` ${val.toLocaleString('id-ID')} PCS (${percentage}%)`;
          },
        },
      },
    },
    cutout: '70%', // Diperbesar sedikit agar lubang lega untuk teks
  };

  // --- PLUGIN KANVAS (DIGABUNG) ---
  const customCanvasDrawings: Plugin<'doughnut'> = {
    id: 'customCanvasDrawings',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const meta = chart.getDatasetMeta(0);

      // Ambil kordinat X dan Y tepat di titik poros tengah Donut Chart
      const centerX = meta.data[0]?.x;
      const centerY = meta.data[0]?.y;

      // 1. GAMBAR TEKS TOTAL DI TENGAH LUBANG
      if (centerX && centerY && totalQty > 0) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Teks "TOTAL VOLUME"
        ctx.font = '900 9px Montserrat, sans-serif';
        ctx.fillStyle = '#9ca3af'; // Warna abu-abu
        ctx.fillText('TOTAL VOLUME', centerX, centerY - 10);

        // Teks Angka "XXX PCS"
        ctx.font = '900 14px Montserrat, sans-serif';
        ctx.fillStyle = '#000000'; // Warna hitam
        ctx.fillText(
          `${totalQty.toLocaleString('id-ID')} PCS`,
          centerX,
          centerY + 10,
        );
      }

      // 2. GAMBAR PERSENTASE DI ATAS POTONGAN WARNA
      chart.data.datasets.forEach((dataset, i) => {
        const currentMeta = chart.getDatasetMeta(i);
        currentMeta.data.forEach((element: any, index) => {
          const value = dataset.data[index] as number;

          if (value > 0 && totalQty > 0) {
            const percentage = (value / totalQty) * 100;
            if (percentage > 4) {
              // Jangan gambar kalau persentase terlalu kecil
              const { x, y } = element.tooltipPosition();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 11px Montserrat, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.shadowColor = 'rgba(0,0,0,0.5)';
              ctx.shadowBlur = 3;
              ctx.fillText(`${percentage.toFixed(0)}%`, x, y);
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }
          }
        });
      });
    },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center pb-2">
      {/* HTML Absolute DIV sudah dibuang sepenuhnya agar bersih */}
      <Doughnut
        data={chartData}
        options={options}
        plugins={[customCanvasDrawings]}
      />
    </div>
  );
}
