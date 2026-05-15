// hooks/useImport.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { uploadTransactionCsv } from '@/lib/api/importApi';
import { toast } from 'sonner';

export function useImport() {
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: uploadTransactionCsv,
    onSuccess: () => {
      setFile(null);
      toast.success('DATA_INJECTED', {
        description: 'File CSV berhasil diproses server.',
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error('UPLOAD_FAILED', {
        description: error.response?.data?.message || 'Gagal mengunggah file.',
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    importMutation.mutate(file);
  };

  return {
    state: { file },
    setters: { setFile },
    mutations: { importMutation },
    handlers: { handleUpload },
  };
}
