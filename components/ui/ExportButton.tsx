'use client';

import api from '@/lib/axios';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function ExportButton() {
  const searchParams = useSearchParams();
  const days = searchParams.get('days') || '30';
  const handleExport = async () => {
    // 1. Simpan ID dari toast loading ke dalam variabel
    const loadingToastId = toast.loading('GENERATING_ENCRYPTED_PDF...');

    try {
      const response = await api.get(`/reports/export-pdf?days=${days}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DOM_Report_${new Date().getTime()}.pdf`);

      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 2. Gunakan ID tadi untuk MENIMPA toast loading menjadi success
      toast.success('REPORT_DOWNLOADED_SUCCESSFULLY', {
        id: loadingToastId,
      });
    } catch (error) {
      console.error(error);

      // 3. Jangan lupa, timpa juga toast-nya kalau terjadi error!
      toast.error('DOWNLOAD_FAILED', {
        id: loadingToastId,
        description: 'Check server logs or connection.',
      });
    }
  };

  return (
    <button
      onClick={handleExport}
      className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex items-center gap-2"
    >
      <span>📄</span> EXPORT_PDF
    </button>
  );
}
