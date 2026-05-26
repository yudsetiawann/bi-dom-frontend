'use client';

interface KpiCardProps {
  title: string;
  value?: string | number | null;
  subtitle?: string;
}

export default function KpiCard({ title, value, subtitle }: KpiCardProps) {
  // Pastikan value tidak kosong, jika kosong tampilkan 0
  const displayValue = value || '0';

  return (
    <div className="bg-white border-2 border-black p-6 relative overflow-hidden shadow-[4px_4px_0px_#000000] group">
      {/* Ornamen sudut industrial */}
      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-black/10"></div>

      {/* Judul KPI - Merah DOM */}
      <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">
        {`// ${title}`}
      </p>

      {/* Angka Utama - Diubah ke HITAM agar terlihat jelas */}
      <div className="flex items-baseline gap-2">
        <h2 className="text-4xl font-black text-black tracking-tighter uppercase">
          {displayValue}
        </h2>

        {/* Subtitle / Unit */}
        {subtitle && (
          <span className="text-black/40 text-[10px] font-bold uppercase tracking-widest italic">
            {subtitle}
          </span>
        )}
      </div>

      {/* Dekorasi garis bawah khas industrial */}
      <div className="mt-4 h-[1px] w-full bg-black/10"></div>
      <div className="mt-1 h-[3px] w-12 bg-red-600"></div>
    </div>
  );
}
