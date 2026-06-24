'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { AlertTriangle, Trash2, Scale, History, Loader2, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface InventoryItem {
  id: number;
  item_name: string;
  current_stock: number;
  unit: string;
}

interface WasteLog {
  id: number;
  inventory_id: number;
  qty_wasted: number;
  cost_per_unit: number;
  total_loss: number;
  reason: string;
  logged_at: string;
  inventory?: {
    item_name: string;
    unit: string;
  };
}

interface StockOpname {
  id: number;
  inventory_id: number;
  system_qty: number;
  physical_qty: number;
  discrepancy: number;
  cost_per_unit: number;
  total_adjustment_value: number;
  adjusted_at: string;
  inventory?: {
    item_name: string;
    unit: string;
  };
}

export default function StockAdjustment() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'waste' | 'opname'>('waste');

  // --- WASTE FORM STATE ---
  const [wasteInventoryId, setWasteInventoryId] = useState('');
  const [qtyWasted, setQtyWasted] = useState('');
  const [wasteReason, setWasteReason] = useState('EXPIRED');
  const [wasteLoggedAt, setWasteLoggedAt] = useState('');

  // --- OPNAME FORM STATE ---
  const [opnameInventoryId, setOpnameInventoryId] = useState('');
  const [physicalQty, setPhysicalQty] = useState('');
  const [opnameAdjustedAt, setOpnameAdjustedAt] = useState('');

  // --- FETCH INVENTORY ITEMS ---
  const { data: inventoryData, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['inventoryList'],
    queryFn: async () => (await api.get('/inventory/list')).data.data as InventoryItem[],
  });

  // --- FETCH WASTE HISTORY ---
  const { data: wasteLogs = [], isLoading: isLoadingWaste } = useQuery({
    queryKey: ['wasteLogs'],
    queryFn: async () => (await api.get('/inventory/waste')).data.data as WasteLog[],
  });

  // --- FETCH OPNAME HISTORY ---
  const { data: opnameLogs = [], isLoading: isLoadingOpname } = useQuery({
    queryKey: ['opnameLogs'],
    queryFn: async () => (await api.get('/inventory/opname')).data.data as StockOpname[],
  });

  // --- MUTATIONS ---
  const logWasteMutation = useMutation({
    mutationFn: async (payload: {
      inventory_id: number;
      qty_wasted: number;
      reason: string;
      logged_at?: string;
    }) => (await api.post('/inventory/waste', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['wasteLogs'] });
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
      setWasteInventoryId('');
      setQtyWasted('');
      setWasteLoggedAt('');
      toast.success('WASTE_LOGGED', {
        description: 'Kerusakan/bahan terbuang berhasil dicatat.',
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data pembuangan.';
      toast.error('ERROR', { description: msg });
    },
  });

  const logOpnameMutation = useMutation({
    mutationFn: async (payload: {
      inventory_id: number;
      physical_qty: number;
      adjusted_at?: string;
    }) => (await api.post('/inventory/opname', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryList'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['opnameLogs'] });
      queryClient.invalidateQueries({ queryKey: ['kpi'] });
      setOpnameInventoryId('');
      setPhysicalQty('');
      setOpnameAdjustedAt('');
      toast.success('OPNAME_LOGGED', {
        description: 'Rekonsiliasi stok fisik berhasil dicatat.',
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal menyimpan data penyesuaian opname.';
      toast.error('ERROR', { description: msg });
    },
  });

  // --- HANDLERS ---
  const handleWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteInventoryId || !qtyWasted) {
      toast.warning('INPUT_REQUIRED', { description: 'Harap lengkapi semua kolom wajib.' });
      return;
    }
    logWasteMutation.mutate({
      inventory_id: parseInt(wasteInventoryId),
      qty_wasted: parseFloat(qtyWasted),
      reason: wasteReason,
      logged_at: wasteLoggedAt || undefined,
    });
  };

  const handleOpnameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opnameInventoryId || !physicalQty) {
      toast.warning('INPUT_REQUIRED', { description: 'Harap lengkapi semua kolom wajib.' });
      return;
    }
    logOpnameMutation.mutate({
      inventory_id: parseInt(opnameInventoryId),
      physical_qty: parseFloat(physicalQty),
      adjusted_at: opnameAdjustedAt || undefined,
    });
  };

  // Find selected items details
  const selectedWasteItem = inventoryData?.find(item => item.id === parseInt(wasteInventoryId));
  const selectedOpnameItem = inventoryData?.find(item => item.id === parseInt(opnameInventoryId));

  // Opname calculations
  const theoreticalStock = selectedOpnameItem?.current_stock ?? 0;
  const difference = physicalQty ? parseFloat(physicalQty) - theoreticalStock : 0;

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto pb-20 font-montserrat min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-black uppercase">
          Stock_Adjustment
        </h1>
        <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1 underline decoration-2 underline-offset-4">
          Waste & Stock Opname Control
        </p>
      </header>

      {/* TAB TOGGLE */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('waste')}
          className={`flex-1 md:flex-none px-6 py-3 font-black text-xs uppercase border-2 border-black transition-all ${
            activeTab === 'waste'
              ? 'bg-red-600 text-white shadow-[4px_4px_0px_#000000]'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Trash2 size={16} />
            <span>Log Waste (Basi/Tumpah)</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('opname')}
          className={`flex-1 md:flex-none px-6 py-3 font-black text-xs uppercase border-2 border-black transition-all ${
            activeTab === 'opname'
              ? 'bg-red-600 text-white shadow-[4px_4px_0px_#000000]'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Scale size={16} />
            <span>Stock Opname (Fisik)</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* LEFT COLUMN: THE ACTIVE FORM */}
        <div className="lg:col-span-1 bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000] h-fit">
          {activeTab === 'waste' ? (
            <form onSubmit={handleWasteSubmit} className="space-y-4">
              <h3 className="text-xs font-black italic tracking-widest uppercase mb-4 text-red-600 flex items-center gap-2">
                <Trash2 size={16} />
                {'// RECORD_WASTE_INCIDENT'}
              </h3>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Bahan Baku / Item *</label>
                <select
                  value={wasteInventoryId}
                  onChange={(e) => setWasteInventoryId(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                  required
                >
                  <option value="">SELECT_MATERIAL</option>
                  {inventoryData?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedWasteItem && (
                <div className="bg-gray-50 border-l-4 border-black p-3 text-[10px] font-bold uppercase tracking-wider">
                  Stok Sistem Saat Ini: {selectedWasteItem.current_stock} {selectedWasteItem.unit}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Jumlah Dibuang *</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="E.g., 2.5"
                    value={qtyWasted}
                    onChange={(e) => setQtyWasted(e.target.value)}
                    className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                    required
                  />
                  {selectedWasteItem && (
                    <span className="border-2 border-l-0 border-black p-3 bg-gray-100 font-black text-xs">
                      {selectedWasteItem.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Alasan Pembuangan</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                >
                  <option value="EXPIRED">EXPIRED / BASI</option>
                  <option value="SPILLED">SPILLED / TUMPAH</option>
                  <option value="REMAKE_ORDER">REMAKE_ORDER / SALAH BIKIN</option>
                  <option value="OTHER">LAINNYA</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Tanggal Kejadian (Opsional)</label>
                <input
                  type="datetime-local"
                  value={wasteLoggedAt}
                  onChange={(e) => setWasteLoggedAt(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={logWasteMutation.isPending}
                className="w-full bg-black text-white hover:bg-red-600 transition-colors p-3 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                {logWasteMutation.isPending ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <span>LOG_WASTE_Kerugian</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOpnameSubmit} className="space-y-4">
              <h3 className="text-xs font-black italic tracking-widest uppercase mb-4 text-red-600 flex items-center gap-2">
                <Scale size={16} />
                {'// PHYSICAL_STOCK_OPNAME'}
              </h3>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Bahan Baku / Item *</label>
                <select
                  value={opnameInventoryId}
                  onChange={(e) => setOpnameInventoryId(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                  required
                >
                  <option value="">SELECT_MATERIAL</option>
                  {inventoryData?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedOpnameItem && (
                <div className="bg-gray-50 border-l-4 border-black p-3 space-y-1 text-[10px] font-bold uppercase tracking-wider">
                  <div>Stok Sistem: {theoreticalStock} {selectedOpnameItem.unit}</div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Stok Fisik Nyata *</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Timbang/hitung fisik riil"
                    value={physicalQty}
                    onChange={(e) => setPhysicalQty(e.target.value)}
                    className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                    required
                  />
                  {selectedOpnameItem && (
                    <span className="border-2 border-l-0 border-black p-3 bg-gray-100 font-black text-xs">
                      {selectedOpnameItem.unit}
                    </span>
                  )}
                </div>
              </div>

              {selectedOpnameItem && physicalQty && (
                <div className={`p-3 border-2 border-black text-xs font-black uppercase flex justify-between ${
                  difference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800 border-red-600'
                }`}>
                  <span>Selisih:</span>
                  <span>
                    {difference > 0 ? '+' : ''}{difference} {selectedOpnameItem.unit}
                    {difference < 0 && ' (Penyusutan)'}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Tanggal Penyesuaian (Opsional)</label>
                <input
                  type="datetime-local"
                  value={opnameAdjustedAt}
                  onChange={(e) => setOpnameAdjustedAt(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xs bg-white outline-none focus:bg-gray-50"
                />
              </div>

              <button
                type="submit"
                disabled={logOpnameMutation.isPending}
                className="w-full bg-black text-white hover:bg-red-600 transition-colors p-3 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                {logOpnameMutation.isPending ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <span>SUBMIT_ADJUSTMENT</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: HISTORY TABLE */}
        <div className="lg:col-span-2 bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#000000]">
          <h3 className="text-xs font-black italic tracking-widest uppercase mb-6 flex items-center gap-2">
            <History size={16} />
            {activeTab === 'waste' ? '// RECENT_WASTE_INCIDENTS' : '// RECENT_STOCK_OPNAMES'}
          </h3>

          <div className="overflow-x-auto">
            {activeTab === 'waste' ? (
              <table className="w-full text-left text-xs uppercase font-bold tracking-wider">
                <thead className="bg-gray-50 border-b-2 border-black text-[10px]">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-right">Jumlah</th>
                    <th className="p-3 text-center">Alasan</th>
                    <th className="p-3 text-right">Kerugian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 text-black/75">
                  {isLoadingWaste ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center animate-pulse text-gray-400 font-bold">LOADING_HISTORY...</td>
                    </tr>
                  ) : wasteLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-bold italic">NO_WASTE_RECORDED</td>
                    </tr>
                  ) : (
                    wasteLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap text-gray-500">
                          {new Date(log.logged_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3 text-black font-black">{log.inventory?.item_name || 'N/A'}</td>
                        <td className="p-3 text-right">
                          {log.qty_wasted} <span className="text-[10px] text-gray-500 font-normal">{log.inventory?.unit || 'PCS'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-red-50 text-red-700 text-[8px] font-black border border-red-200 px-2 py-0.5 rounded-sm">
                            {log.reason}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-red-600">{formatRupiah(log.total_loss)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs uppercase font-bold tracking-wider">
                <thead className="bg-gray-50 border-b-2 border-black text-[10px]">
                  <tr>
                    <th className="p-3">Waktu</th>
                    <th className="p-3">Item</th>
                    <th className="p-3 text-right">Sistem</th>
                    <th className="p-3 text-right">Fisik</th>
                    <th className="p-3 text-right">Selisih</th>
                    <th className="p-3 text-right">Nilai Adj.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 text-black/75">
                  {isLoadingOpname ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center animate-pulse text-gray-400 font-bold">LOADING_HISTORY...</td>
                    </tr>
                  ) : opnameLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 font-bold italic">NO_OPNAME_RECORDED</td>
                    </tr>
                  ) : (
                    opnameLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap text-gray-500">
                          {new Date(log.adjusted_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="p-3 text-black font-black">{log.inventory?.item_name || 'N/A'}</td>
                        <td className="p-3 text-right">{log.system_qty}</td>
                        <td className="p-3 text-right">{log.physical_qty}</td>
                        <td className={`p-3 text-right font-bold ${log.discrepancy >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {log.discrepancy > 0 ? '+' : ''}{log.discrepancy}
                        </td>
                        <td className={`p-3 text-right font-black ${log.total_adjustment_value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatRupiah(log.total_adjustment_value)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
