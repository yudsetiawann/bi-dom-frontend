'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  UploadCloud,
  FileType,
  CheckCircle,
  Info,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ImportData() {
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

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto pb-20 font-montserrat flex flex-col min-h-screen">
      {/* BAGIAN ATAS: UPLOAD BOX */}
      <div className="bg-white border-4 border-black p-6 md:p-12 shadow-[8px_8px_0px_#000000] relative overflow-hidden mb-8 md:mb-12 mt-4 md:mt-8">
        {/* Background Decor */}
        <div className="absolute top-[-5%] right-[-5%] text-[15vw] font-black text-black/5 pointer-events-none select-none">
          CSV
        </div>

        <div className="relative z-10 text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white mb-6 shadow-[4px_4px_0px_#000000]">
            <UploadCloud size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-2">
            Data_Injection
          </h1>
          <p className="text-[10px] md:text-xs font-bold tracking-widest text-black/50 uppercase">
            // Upload Griyo POS Raw Data
          </p>
        </div>

        <form
          onSubmit={handleUpload}
          className="relative z-10 max-w-md mx-auto space-y-6"
        >
          <div className="border-2 border-dashed border-black bg-gray-50 p-8 text-center hover:bg-gray-100 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="text-green-600" size={32} />
                <p className="font-black text-xs md:text-sm break-all px-4">
                  {file.name}
                </p>
                <p className="text-[10px] font-bold text-black/50">
                  {(file.size / 1024).toFixed(2)} KB READY
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <FileType size={32} />
                <p className="font-black text-xs md:text-sm uppercase tracking-widest">
                  Select_CSV_File
                </p>
                <p className="text-[9px] font-bold">
                  CLICK OR DRAG & DROP HERE
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || importMutation.isPending}
            className="w-full bg-black text-white font-black uppercase tracking-[0.2em] p-4 text-xs hover:bg-red-600 hover:shadow-[4px_4px_0px_#000000] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {importMutation.isPending ? 'PROCESSING_DATA...' : 'EXECUTE_UPLOAD'}
          </button>
        </form>
      </div>

      {/* BAGIAN BAWAH: SYSTEM DATA PROTOCOL (TUTORIAL & FORMAT) */}
      <div className="bg-black text-white p-6 md:p-8 border-2 border-black shadow-[8px_8px_0px_#dc2626]">
        <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
          <Info className="text-red-600" size={24} />
          <h2 className="text-lg md:text-xl font-black italic tracking-widest uppercase">
            // System_Data_Protocol
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-sm">
          {/* Kolom 1: Cara Upload */}
          <div className="space-y-4">
            <h3 className="font-bold text-red-500 tracking-widest uppercase flex items-center gap-2">
              <UploadCloud size={16} /> 1. Upload Procedure
            </h3>
            <ul className="space-y-3 text-gray-300 font-medium list-disc list-inside text-xs md:text-sm">
              <li>
                Export data riwayat transaksi dari sistem{' '}
                <span className="text-white font-bold">Griyo POS</span>.
              </li>
              <li>
                Pastikan file disimpan dengan format/ekstensi{' '}
                <span className="bg-red-900/50 text-red-400 px-1 font-mono border border-red-900">
                  .csv
                </span>
                .
              </li>
              <li>
                Pastikan susunan kolom (*header*) pada baris pertama sesuai
                dengan standar tabel di samping.
              </li>
              <li>
                Pilih file CSV, lalu klik tombol{' '}
                <span className="text-white font-bold uppercase text-[10px] tracking-wider">
                  Execute_Upload
                </span>
                .
              </li>
            </ul>
          </div>

          {/* Kolom 2: Format Data */}
          <div className="space-y-4">
            <h3 className="font-bold text-red-500 tracking-widest uppercase flex items-center gap-2">
              <FileText size={16} /> 2. Required CSV Structure
            </h3>
            <p className="text-gray-300 font-medium text-xs md:text-sm">
              Baris pertama (*header*) wajib menggunakan penamaan bahasa Inggris
              berikut (huruf kecil):
            </p>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-[10px] md:text-xs text-left border border-white/20 min-w-[300px]">
                <thead className="bg-white/10 text-white font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-r border-white/20">receipt_no</th>
                    <th className="p-3 border-r border-white/20">trx_date</th>
                    <th className="p-3">total_amount</th>
                  </tr>
                </thead>
                <tbody className="text-gray-400 font-mono">
                  <tr className="border-t border-white/20 bg-white/5">
                    <td className="p-3 border-r border-white/20 text-white">
                      INV-001
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      2026-04-28 10:30
                    </td>
                    <td className="p-3 text-red-400 font-bold">25000</td>
                  </tr>
                  <tr className="border-t border-white/20">
                    <td className="p-3 border-r border-white/20 text-white">
                      INV-002
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      2026-04-28 11:15
                    </td>
                    <td className="p-3 text-red-400 font-bold">48500</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-red-900/20 border-l-4 border-red-600 p-4 mt-4 flex gap-3 items-start text-xs text-gray-300">
              <AlertTriangle
                className="text-red-500 shrink-0 mt-0.5"
                size={16}
              />
              <div className="space-y-1">
                <p>
                  <strong className="text-white uppercase tracking-wider text-[10px]">
                    Critical Rule:
                  </strong>
                </p>
                <p>
                  Kolom{' '}
                  <code className="text-red-400 bg-black px-1">
                    total_amount
                  </code>{' '}
                  **tidak boleh** menggunakan titik ( . ) atau koma ( , )
                  sebagai pemisah ribuan. Cukup tulis angkanya saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
