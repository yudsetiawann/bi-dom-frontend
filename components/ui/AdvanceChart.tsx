'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CHART_COLORS, DAYS_ORDER } from '@/lib/constants'; // <-- Import dari constant

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function DailyBarChart({ data }: { data: any[] }) {
  const sortedData = DAYS_ORDER.map((day) => {
    const found = data?.find((d) => d.day_name === day);
    return found ? Number(found.total) : 0;
  });

  const chartData = {
    labels: ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'],
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: sortedData,
        backgroundColor: '#dc2626',
        borderWidth: 2,
        borderColor: '#000',
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{ responsive: true, maintainAspectRatio: false }}
    />
  );
}

export function StackedCategoryChart({
  data,
  period,
  labels,
}: {
  data: any[];
  period: string;
  labels: string[];
}) {
  const categories = Array.from(
    new Set(data?.map((d) => d.category_name) || []),
  );

  const datasets = categories.map((cat, i) => {
    const color = CHART_COLORS[i % CHART_COLORS.length]; // <-- Gunakan constant
    return {
      label: String(cat).toUpperCase(),
      backgroundColor: color,
      data: labels.map((_, idx) => {
        const timeUnit = idx + 1;
        const found = data?.find(
          (d) => d.category_name === cat && d.time_unit === timeUnit,
        );
        return found ? Number(found.total_revenue) : 0;
      }),
    };
  });

  return (
    <Bar
      data={{ labels, datasets }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true } },
      }}
    />
  );
}

export function PeakHoursHeatmap({
  data,
  onCellClick,
}: {
  data: any[];
  onCellClick?: (day: string, hour: number) => void;
}) {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const maxTrx = Math.max(...(data?.map((d) => d.total_trx) || [1]));

  return (
    <div className="w-full overflow-x-auto text-[10px] font-bold uppercase pb-4">
      <div className="flex mb-1">
        <div className="w-16 shrink-0"></div>
        {hours.map((h) => (
          <div key={h} className="flex-1 text-center min-w-[30px]">
            {h}:00
          </div>
        ))}
      </div>
      {DAYS_ORDER.map((day) => (
        <div key={day} className="flex mb-1 items-center">
          <div className="w-16 shrink-0 text-left pr-2">
            {day.substring(0, 3)}
          </div>
          {hours.map((h) => {
            const found = data?.find((d) => d.day_name === day && d.hour === h);
            const count = found ? found.total_trx : 0;
            const opacity = count > 0 ? Math.max(0.2, count / maxTrx) : 0.05;

            return (
              <div
                key={h}
                onClick={() => count > 0 && onCellClick && onCellClick(day, h)}
                className={`flex-1 h-8 min-w-[30px] border border-white relative group ${count > 0 ? 'cursor-pointer hover:border-black hover:z-20' : ''}`}
                style={{ backgroundColor: `rgba(220, 38, 38, ${opacity})` }}
              >
                {count > 0 && (
                  <div className="hidden group-hover:block absolute z-30 bg-black text-white p-2 text-[9px] -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-[4px_4px_0px_#dc2626]">
                    <span className="font-black text-red-500">
                      {count} STRUK
                    </span>
                    <br />
                    Klik untuk Analisis Promo
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
