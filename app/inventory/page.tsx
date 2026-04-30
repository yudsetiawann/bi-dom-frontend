'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
  AlertTriangle,
  CheckCircle,
  Package,
  PlusSquare,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryAlert() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addedStock, setAddedStock] = useState<string>('');

  const [newItem, setNewItem] = useState({
    item_name: '',
    unit: '',
    current_stock: '',
    min_stock: '',
    usage_per_trx: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['inventoryAlerts'],
    queryFn: async () => (await api.get('/inventory/alerts')).data.data,
  });

  const updateStockMutation = useMutation({
    mutationFn: async (payload: {
      inventory_id: number;
      added_stock: number;
    }) => (await api.post('/inventory/update-stock', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      setAddedStock('');
      toast.success('STOCK_REPLENISHED', {
        description: 'Persediaan berhasil ditambahkan.',
      });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (payload: typeof newItem) =>
      (await api.post('/inventory/items', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      setNewItem({
        item_name: '',
        unit: '',
        current_stock: 0,
        min_stock: 0,
        usage_per_trx: 0,
      });
      toast.success('MASTER_DATA_CREATED', {
        description: 'Bahan baku baru terdaftar.',
      });
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen font-black animate-pulse uppercase tracking-[0.5em] text-sm">
        Scanning_Resources...
      </div>
    );

  const { forecast_next_week_trx, inventory_alerts } = data || {};

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-black uppercase">
          Inventory_Control
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
          <p className="text-[9px] md:text-[10px] text-red-600 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase underline decoration-2 underline-offset-4">
            SMA Forecast Active // Est. {forecast_next_week_trx} TRX Next Week
          </p>
        </div>
      </header>

      {/* Grid: 1 Kolom di HP, 3 Kolom di Laptop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* TABEL STOK (Responsive) */}
        <div className="lg:col-span-2 bg-white border-2 border-black p-4 md:p-8 shadow-[6px_6px_0px_#000000]">
          <h3 className="text-[10px] md:text-xs font-black italic tracking-[0.2em] md:tracking-[0.3em] uppercase mb-6 md:mb-8">
            // Material_Live_Monitoring
          </h3>

          <div className="w-full overflow-x-auto border border-black/10">
            <table className="w-full min-w-[600px] text-[10px] md:text-[11px] uppercase font-bold tracking-wider text-left">
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="p-3">ITEM_NAME</th>
                  <th className="p-3 text-center">CURRENT</th>
                  <th className="p-3 text-center text-red-600">EST_USAGE</th>
                  <th className="p-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 text-black/70">
                {inventory_alerts?.map((item: any) => (
                  <tr
                    key={item.id}
                    className="hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="p-3 font-black text-black">
                      {item.item_name}
                    </td>
                    <td className="p-3 text-center">
                      {item.current_stock}{' '}
                      <span className="text-[8px] opacity-40">{item.unit}</span>
                    </td>
                    <td className="p-3 text-center font-black text-black/40">
                      {item.predicted_usage}{' '}
                      <span className="text-[8px]">{item.unit}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 border font-black text-[9px] ${item.status === 'Kritis' ? 'text-red-600 bg-red-100 border-red-600' : 'text-green-700 bg-green-100 border-green-700'}`}
                      >
                        {item.status === 'Kritis' ? (
                          <AlertTriangle size={10} />
                        ) : (
                          <CheckCircle size={10} />
                        )}{' '}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR FORMS */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center gap-2 mb-6">
              <Package size={16} />
              <h3 className="text-[10px] font-black italic tracking-widest uppercase">
                // Inbound_Stock
              </h3>
            </div>
            <div className="space-y-4">
              <select
                className="w-full border-2 border-black p-3 font-bold text-xs md:text-sm bg-gray-50 focus:outline-none"
                value={selectedId || ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                <option value="">SELECT_MATERIAL</option>
                {inventory_alerts?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.item_name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="QTY_TO_ADD"
                className="w-full border-2 border-black p-3 font-bold text-sm md:text-lg bg-gray-50 focus:outline-none"
                value={addedStock}
                onChange={(e) => setAddedStock(e.target.value)}
              />
              <button
                onClick={() =>
                  updateStockMutation.mutate({
                    inventory_id: selectedId!,
                    added_stock: parseFloat(addedStock),
                  })
                }
                disabled={
                  !selectedId || !addedStock || updateStockMutation.isPending
                }
                className="w-full bg-black text-white p-3 md:p-4 font-black uppercase text-xs tracking-widest hover:bg-red-600 disabled:bg-gray-200"
              >
                {updateStockMutation.isPending ? 'PROCESSING...' : 'ADD_STOCK'}
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#dc2626]">
            <div className="flex items-center gap-2 mb-6">
              <PlusSquare size={16} className="text-red-600" />
              <h3 className="text-[10px] font-black italic tracking-widest uppercase text-red-600">
                // Add_Master_Item
              </h3>
            </div>
            <div className="space-y-4">
              <input
                placeholder="ITEM_NAME"
                className="w-full border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                value={newItem.item_name}
                onChange={(e) =>
                  setNewItem({ ...newItem, item_name: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="UNIT (GR/KG)"
                  className="border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                />

                {/* FIX: MIN_STOCK */}
                <input
                  type="number"
                  placeholder="MIN_STOCK"
                  className="border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                  value={newItem.min_stock}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      min_stock:
                        e.target.value === ''
                          ? ''
                          : (parseFloat(e.target.value) as any),
                    })
                  }
                />
              </div>

              <div className="bg-gray-100 p-3 border-l-4 border-black">
                <div className="flex items-center gap-2 mb-2 text-black/50">
                  <Info size={12} />{' '}
                  <span className="text-[9px] font-black uppercase">
                    SMA Config
                  </span>
                </div>

                {/* FIX: USAGE PER TRX */}
                <input
                  type="number"
                  step="0.001"
                  placeholder="USAGE PER TRX"
                  className="w-full p-2 text-xs font-bold border border-black/10 outline-none focus:border-black"
                  value={newItem.usage_per_trx}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      usage_per_trx:
                        e.target.value === ''
                          ? ''
                          : (parseFloat(e.target.value) as any),
                    })
                  }
                />
              </div>

              <button
                onClick={() => addItemMutation.mutate(newItem as any)}
                disabled={!newItem.item_name || addItemMutation.isPending}
                className="w-full bg-red-600 text-white p-3 font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors"
              >
                {addItemMutation.isPending ? 'CREATING...' : 'REGISTER_ITEM'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
