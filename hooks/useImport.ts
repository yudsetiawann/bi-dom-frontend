// hooks/useImport.ts
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { uploadTransactionCsv } from '@/lib/api/importApi';
import { toast } from 'sonner';

export function useImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const importMutation = useMutation({
    mutationFn: uploadTransactionCsv,
    onSuccess: (response: any) => {
      setFile(null);
      const data = response?.data;
      if (data?.skipped_count > 0) {
        toast.success('DATA_INJECTED', {
          description: `${data.transactions} transaksi diproses, ${data.skipped_count} di-skip (sudah ada).`,
        });
      } else {
        toast.success('DATA_INJECTED', {
          description: `${data?.transactions ?? 0} transaksi berhasil diproses.`,
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
    state: { file, isDragging },
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
