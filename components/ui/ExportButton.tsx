'use client';

import api from '@/lib/axios';
import { FileDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface ExportButtonProps {
  queryString?: string;
}

export default function ExportButton({ queryString }: ExportButtonProps) {
  const searchParams = useSearchParams();
  const days = searchParams.get('days') || '30';

  const handleExport = async () => {
    const loadingToastId = toast.loading('GENERATING_DASHBOARD_PDF...');

    try {
      const params = new URLSearchParams(queryString || '');
      params.set('days', days);

      const response = await api.get(`/reports/export-pdf?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `DOM_Dashboard_Report_${Date.now()}.pdf`);

      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('DASHBOARD_REPORT_DOWNLOADED', {
        id: loadingToastId,
      });
    } catch (error) {
      console.error(error);
      toast.error('DOWNLOAD_FAILED', {
        id: loadingToastId,
        description: 'Check server logs or connection.',
      });
    }
  };

  return (
    <button
      onClick={handleExport}
      title={
        queryString
          ? `Current dashboard filters: ${queryString}`
          : 'Export dashboard report PDF'
      }
      className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all border border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex items-center gap-2"
    >
      <FileDown size={14} /> EXPORT_DASHBOARD_PDF
    </button>
  );
}
