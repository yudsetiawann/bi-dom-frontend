'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil nilai 'days' dari URL, default ke '30' jika kosong
  const currentDays = searchParams.get('days') || '30';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    // Mengubah URL tanpa reload halaman penuh (shallow routing)
    router.push(`/?days=${value}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="filter" className="text-sm font-medium text-gray-600">
        Rentang Waktu:
      </label>
      <select
        id="filter"
        value={currentDays}
        onChange={handleChange}
        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm cursor-pointer outline-none"
      >
        <option value="7">7 Hari Terakhir</option>
        <option value="30">30 Hari Terakhir (Bulanan)</option>
        <option value="all">Semua Waktu</option>
      </select>
    </div>
  );
}
