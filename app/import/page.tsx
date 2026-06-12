'use client';

import { useImport } from '@/hooks/useImport';
import {
  UploadCloud,
  FileType,
  CheckCircle,
  Info,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function ImportData() {
  const { state, mutations, handlers } = useImport();

  return (
    <main className="p-4 md:p-8 max-w-5xl mx-auto pb-20 font-montserrat flex flex-col min-h-screen">
      {/* KOTAK UPLOAD */}
      <div className="bg-white border-4 border-black p-6 md:p-12 shadow-[8px_8px_0px_#000000] relative overflow-hidden mb-8 md:mb-12 mt-4 md:mt-8">
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
            {'// Upload Griyo POS Raw Data'}
          </p>
        </div>
        <form
          onSubmit={handlers.handleUpload}
          className="relative z-10 max-w-md mx-auto space-y-6"
        >
          <div
            onDragOver={handlers.handleDragOver}
            onDragLeave={handlers.handleDragLeave}
            onDrop={handlers.handleDrop}
            className={`border-2 border-dashed border-black p-8 text-center transition-colors relative cursor-pointer group ${
              state.isDragging ? 'bg-red-50' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handlers.handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {state.file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="text-green-600" size={32} />
                <p className="font-black text-xs md:text-sm break-all px-4">
                  {state.file.name}
                </p>
                <p className="text-[10px] font-bold text-black/50">
                  {(state.file.size / 1024).toFixed(2)} KB READY
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
            disabled={!state.file || mutations.importMutation.isPending}
            className="w-full bg-black text-white font-black uppercase tracking-[0.2em] p-4 text-xs hover:bg-red-600 hover:shadow-[4px_4px_0px_#000000] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {mutations.importMutation.isPending
              ? 'PROCESSING_DATA...'
              : 'EXECUTE_UPLOAD'}
          </button>
        </form>
        {state.lastResult && (
          <div className="relative z-10 mt-8 max-w-2xl mx-auto border-2 border-black bg-gray-50 text-left shadow-[4px_4px_0px_#dc2626]">
            <div className="grid grid-cols-3 divide-x-2 divide-black border-b-2 border-black">
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
                  Imported
                </p>
                <p className="text-xl font-black">
                  {state.lastResult.transactions ?? 0}
                </p>
              </div>
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
                  Duplicate
                </p>
                <p className="text-xl font-black">
                  {state.lastResult.skipped_count ?? 0}
                </p>
              </div>
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-black/40">
                  Rejected
                </p>
                <p className="text-xl font-black text-red-600">
                  {state.lastResult.rejected_count ?? 0}
                </p>
              </div>
            </div>
            {(state.lastResult.rejected_receipts?.length ?? 0) > 0 && (
              <div className="p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-red-600">
                  Receipt ditolak karena product tidak cocok Master Product:
                </p>
                <div className="space-y-2">
                  {state.lastResult.rejected_receipts?.map((receipt) => (
                    <div
                      key={receipt.receipt_no}
                      className="border border-red-200 bg-red-50 p-3 text-[10px] font-bold uppercase"
                    >
                      <p className="font-black text-red-600">
                        {receipt.receipt_no}
                      </p>
                      <p className="text-black/60">{receipt.reason}</p>
                      <p className="text-black">
                        {receipt.products.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SYSTEM DATA PROTOCOL (PANDUAN UNTUK PAK HARIS) */}
      <div className="bg-black text-white p-6 md:p-8 border-2 border-black shadow-[8px_8px_0px_#dc2626]">
        <div className="flex items-center gap-3 mb-6 border-b border-white/20 pb-4">
          <Info className="text-red-600" size={24} />
          <h2 className="text-lg md:text-xl font-black italic tracking-widest uppercase">
            {'// System_Data_Protocol'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-sm">
          {/* KOLOM KIRI: CARA KERJA SISTEM */}
          <div className="space-y-4">
            <h3 className="font-bold text-red-500 tracking-widest uppercase flex items-center gap-2">
              <UploadCloud size={16} /> 1. Upload Procedure
            </h3>
            <div className="space-y-3 text-gray-300 font-medium text-xs md:text-sm">
              <p>
                Ekspor data riwayat transaksi dari sistem{' '}
                <span className="text-white font-bold">Griyo POS</span> dalam
                format{' '}
                <span className="bg-red-900/50 text-red-400 px-1 font-mono border border-red-900">
                  .csv
                </span>
                .
              </p>

              <div className="bg-white/10 p-4 border-l-2 border-white/50 mt-4">
                <p className="font-bold text-white uppercase text-[10px] mb-2 tracking-widest">
                  Penjelasan Konsep (Penting):
                </p>
                <p className="italic">
                  Agar AI bisa menganalisa Menu Terlaris dan Promo Paket, data
                  CSV harus dipecah <strong>per menu (itemized)</strong>.
                </p>
                <p className="mt-2 text-red-300 font-bold">
                  Jika 1 struk berisi 3 macam pesanan, maka di dalam CSV harus
                  ditulis menjadi 3 baris dengan nomor struk yang sama (lihat
                  contoh tabel di kanan).
                </p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: CONTOH TABEL & FORMAT */}
          <div className="space-y-4">
            <h3 className="font-bold text-red-500 tracking-widest uppercase flex items-center gap-2">
              <FileText size={16} /> 2. Required CSV Structure
            </h3>
            <p className="text-gray-300 font-medium text-xs md:text-sm">
              Pastikan baris pertama (*header*) minimal memakai kolom wajib
              berikut. Kolom payment_method opsional; jika kosong sistem memakai
              CASH.
            </p>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-[10px] md:text-[11px] text-left border border-white/20 min-w-[500px]">
                <thead className="bg-white/10 text-white font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-r border-white/20">receipt_no</th>
                    <th className="p-3 border-r border-white/20">trx_date</th>
                    <th className="p-3 border-r border-white/20 text-red-400">
                      product_name
                    </th>
                    <th className="p-3 border-r border-white/20">qty</th>
                    <th className="p-3 border-r border-white/20">subtotal</th>
                    <th className="p-3">payment_method</th>
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
                    <td className="p-3 border-r border-white/20 text-red-400 font-bold">
                      Aren Latte
                    </td>
                    <td className="p-3 border-r border-white/20 text-white text-center">
                      2
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      40000
                    </td>
                    <td className="p-3 text-white">QRIS</td>
                  </tr>
                  <tr className="border-t border-white/20 bg-white/5">
                    <td className="p-3 border-r border-white/20 text-white">
                      INV-001
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      2026-04-28 10:30
                    </td>
                    <td className="p-3 border-r border-white/20 text-red-400 font-bold">
                      Mix Platter
                    </td>
                    <td className="p-3 border-r border-white/20 text-white text-center">
                      1
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      35000
                    </td>
                    <td className="p-3 text-white">QRIS</td>
                  </tr>
                  <tr className="border-t border-white/20">
                    <td className="p-3 border-r border-white/20 text-white">
                      INV-002
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      2026-04-28 11:15
                    </td>
                    <td className="p-3 border-r border-white/20 text-red-400 font-bold">
                      Lychee Tea
                    </td>
                    <td className="p-3 border-r border-white/20 text-white text-center">
                      1
                    </td>
                    <td className="p-3 border-r border-white/20 text-white">
                      20000
                    </td>
                    <td className="p-3 text-white">CASH</td>
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
                  <code className="text-red-400 bg-black px-1">subtotal</code>{' '}
                  adalah total harga per item (harga satuan dikali qty).{' '}
                  <strong>DILARANG</strong> menggunakan titik ( . ) atau koma (
                  , ) sebagai pemisah ribuan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
