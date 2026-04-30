'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function UpdateStockPage() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [newStock, setNewStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const router = useRouter();

  // Load daftar bahan saat halaman dibuka
  useEffect(() => {
    api.get('/inventory/list').then((res) => setItems(res.data.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/inventory/update-stock', {
        inventory_id: selectedItem,
        new_stock: newStock,
      });
      setStatus({
        type: 'success',
        msg: 'DATABASE_UPDATED // STOCK_SYNC_COMPLETE',
      });
      setTimeout(() => router.push('/inventory'), 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'EXECUTION_FAILED // CHECK_INPUT_DATA' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto font-montserrat min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter text-black uppercase">
          Manual_Stock_Entry
        </h1>
        <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1">
          Inventory_Module // DOM Social Hub
        </p>
      </header>

      <div className="bg-white border-2 border-black p-10 shadow-[10px_10px_0px_#000000] relative overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-3">
              Target_Material
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full border-2 border-black p-4 font-bold bg-white focus:bg-red-50 outline-none appearance-none cursor-pointer"
              required
            >
              <option value="">SELECT_ITEM_FROM_BUFFER...</option>
              {items.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.item_name} ({item.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest mb-3">
              Actual_Physical_Qty
            </label>
            <input
              type="number"
              step="0.01"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="0.00"
              className="w-full border-2 border-black p-4 font-black text-2xl outline-none focus:bg-red-50 placeholder:text-gray-200"
              required
            />
          </div>

          {status && (
            <div
              className={`p-4 text-[10px] font-black border-2 ${status.type === 'success' ? 'border-green-600 text-green-600 bg-green-50' : 'border-red-600 text-red-600 bg-red-50'}`}
            >
              {`> ${status.msg}`}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-black py-5 text-xs tracking-[0.3em] uppercase hover:bg-red-600 transition-all shadow-[4px_4px_0px_rgba(220,38,38,0.5)] active:translate-y-1 active:shadow-none"
          >
            {loading ? 'SYNCING_DATA...' : 'EXECUTE_UPDATE_SEQUENCE'}
          </button>
        </form>
      </div>
    </main>
  );
}
