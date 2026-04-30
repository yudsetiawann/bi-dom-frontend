'use client';
import { X, Receipt, FileText } from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  isLoading: boolean;
}

export default function TransactionModal({
  isOpen,
  onClose,
  data,
  isLoading,
}: TransactionModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 font-montserrat"
      onClick={handleOverlayClick}
    >
      <div className="bg-white border-4 border-black w-full max-w-lg shadow-[12px_12px_0px_#dc2626] relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-black text-white p-4 flex justify-between items-center border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-red-600" />
            <h2 className="font-black italic tracking-widest uppercase text-sm">
              Receipt_Log
            </h2>
          </div>
          <button
            onClick={onClose}
            className="hover:text-red-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8">
          {isLoading ? (
            <div className="py-12 text-center text-black font-black tracking-widest text-xs animate-pulse">
              DECRYPTING_DATA_STREAM...
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-red-600 font-black tracking-widest text-xs">
              ERROR: DATA_NOT_FOUND
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-end border-b-2 border-black/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Receipt Number
                  </p>
                  <p className="text-xl font-black uppercase text-black">
                    {data.transaction?.receipt_no}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Timestamp
                  </p>
                  {/* UBAH BARIS DI BAWAH INI 👇 */}
                  <p className="text-xs font-bold text-black">
                    {data.transaction?.created_at
                      ? formatDate(data.transaction.created_at)
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-[10px] font-black italic tracking-widest uppercase text-red-600 mb-3 flex items-center gap-2">
                  <FileText size={12} /> // Itemized_Details
                </h3>
                <div className="max-h-[250px] overflow-y-auto border-2 border-black/10 bg-gray-50 p-2">
                  <table className="w-full text-xs font-bold">
                    <tbody>
                      {data.items?.map((item: any, idx: number) => (
                        <tr
                          key={idx}
                          className="border-b border-black/5 last:border-0"
                        >
                          <td className="py-3 px-2 w-full text-black">
                            <span className="uppercase">{item.name}</span>
                            <div className="text-[10px] text-gray-500 mt-1">
                              {item.qty} x {formatRupiah(item.price)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right text-black font-black whitespace-nowrap">
                            {formatRupiah(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-black text-white p-4 flex justify-between items-center shadow-[4px_4px_0px_#dc2626]">
                <span className="font-black text-xs uppercase tracking-widest text-red-500">
                  Net_Total
                </span>
                <span className="font-black text-xl">
                  {formatRupiah(data.transaction?.total_amount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
