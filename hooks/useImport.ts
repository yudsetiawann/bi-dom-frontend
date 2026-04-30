// hooks/useImport.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';

export function useImport() {
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      setFile(null);
      toast.success('DATA_INJECTED', {
        description: 'File CSV berhasil masuk ke antrean server.',
      });
    },
    onError: (error: any) => {
      toast.error('UPLOAD_FAILED', {
        description: error.response?.data?.message || 'Gagal mengunggah file.',
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('csv_file', file);
    importMutation.mutate(formData);
  };

  return {
    state: { file },
    setters: { setFile },
    mutations: { importMutation },
    handlers: { handleUpload },
  };
}
