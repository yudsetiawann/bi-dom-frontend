import api from '@/lib/axios';

export async function uploadTransactionCsv(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}
