// hooks/useImport.ts
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { uploadTransactionCsv } from '@/lib/api/importApi';
import { toast } from 'sonner';

interface ImportCsvResponse {
  data?: {
    details?: number;
    transactions?: number;
    skipped_count?: number;
    rejected_count?: number;
    rejected_receipts?: Array<{
      receipt_no: string;
      reason: string;
      products: string[];
    }>;
  };
}

export function useImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastResult, setLastResult] = useState<ImportCsvResponse['data'] | null>(
    null,
  );

  const selectFile = (selectedFile?: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isCsv =
      selectedFile.name.toLowerCase().endsWith('.csv') ||
      selectedFile.type === 'text/csv' ||
      selectedFile.type === 'application/vnd.ms-excel';

    if (!isCsv) {
      setFile(null);
      toast.error('INVALID_FILE_TYPE', {
        description: 'Gunakan file CSV dengan ekstensi .csv.',
      });
      return;
    }

    setFile(selectedFile);
  };

  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: uploadTransactionCsv,
    onSuccess: (response: ImportCsvResponse) => {
      setFile(null);
      setLastResult(response?.data ?? null);

      // Invalidate semua query dashboard & invoice agar data langsung muncul
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
      queryClient.invalidateQueries({ queryKey: ['chart'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['donut'] });
      queryClient.invalidateQueries({ queryKey: ['advancedAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['availableYears'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });

      const data = response?.data;
      const skippedCount = data?.skipped_count ?? 0;
      const rejectedCount = data?.rejected_count ?? 0;
      const transactionCount = data?.transactions ?? 0;
      if (skippedCount > 0 || rejectedCount > 0) {
        toast.success('DATA_INJECTED', {
          description: `${transactionCount} transaksi masuk, ${skippedCount} duplicate, ${rejectedCount} ditolak.`,
        });
      } else {
        toast.success('DATA_INJECTED', {
          description: `${transactionCount} transaksi berhasil diproses.`,
        });
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error('UPLOAD_FAILED', {
        description: error.response?.data?.message || 'Gagal mengunggah file.',
      });
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files?.[0] ?? null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    selectFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    importMutation.mutate(file);
  };

  return {
    state: { file, isDragging, lastResult },
    setters: { setFile: selectFile },
    mutations: { importMutation },
    handlers: {
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      handleUpload,
    },
  };
}
