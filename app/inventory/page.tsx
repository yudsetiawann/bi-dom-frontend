'use client';

import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useInventory } from '@/hooks/useInventory';
import type { InventoryAlertItem } from '@/types/inventory.types';
import {
  AlertTriangle,
  CheckCircle,
  Package,
  PlusSquare,
  Info,
  Search,
} from 'lucide-react';

export default function InventoryAlert() {
  const { state, setters, data, mutations, handlers } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const usageBasisLabel = {
    RECIPE_SMA_30D: 'SMA_30D',
    NO_RECENT_USAGE: 'NO_USAGE_HISTORY',
    TRX_AVG_FALLBACK: 'TRX_AVG_FALLBACK',
  } as const;
  const {
    forecast_next_week_trx,
    forecast_window_start,
    forecast_window_end,
    inventory_alerts,
  } = data.inventoryData || {};
  const filteredInventoryAlerts = useMemo(() => {
    const alerts = inventory_alerts || [];
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return alerts;
    }

    return alerts.filter((item: InventoryAlertItem) =>
      [item.item_name, item.unit, item.status, item.usage_basis]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [inventory_alerts, searchQuery]);

  // --- FRAMER MOTION VARIANTS ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-black animate-pulse uppercase tracking-[0.5em] text-sm">
        Scanning_Resources...
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto pb-20">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-black uppercase">
          Inventory_Control
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 bg-red-600 animate-pulse"></span>
          <p className="text-[9px] md:text-[10px] text-red-600 font-bold tracking-[0.2em] md:tracking-[0.4em] uppercase underline decoration-2 underline-offset-4">
            SMA Forecast Active {'//'} Est. {forecast_next_week_trx || 0} TRX Next
            Week
          </p>
        </div>
        {forecast_window_start && forecast_window_end && (
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-black/40">
            Data_Window {forecast_window_start} {'->'} {forecast_window_end}
          </p>
        )}
      </header>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* TABEL STOK (KIRI) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white border-2 border-black p-4 md:p-8 shadow-[6px_6px_0px_#000000]"
        >
          <h3 className="text-[10px] md:text-xs font-black italic tracking-[0.2em] md:tracking-[0.3em] uppercase mb-6 md:mb-8">
            {'// Material_Live_Monitoring'}
          </h3>
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              type="search"
              placeholder="SEARCH_MATERIAL / UNIT / STATUS"
              className="w-full border-2 border-black pl-10 pr-3 py-3 font-black text-[10px] tracking-widest uppercase outline-none focus:bg-gray-50"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
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
                {filteredInventoryAlerts.map((item: InventoryAlertItem) => (
                  <tr
                    key={item.id}
                    className="hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => setters.setSelectedId(item.id)}
                  >
                    <td className="p-3 font-black text-black">
                      {item.item_name}
                    </td>
                    <td className="p-3 text-center">
                      {item.current_stock}{' '}
                      <span className="text-[8px] opacity-40">{item.unit}</span>
                    </td>
                    <td className="p-3 text-center font-black text-black/40">
                      <div>
                        {item.predicted_usage}{' '}
                        <span className="text-[8px]">{item.unit}</span>
                      </div>
                      <span
                        className={`mt-1 inline-block text-[7px] font-black tracking-widest ${item.usage_basis === 'NO_RECENT_USAGE' ? 'text-gray-400' : 'text-red-600'}`}
                        title={
                          item.usage_basis === 'NO_RECENT_USAGE'
                            ? 'Belum ada transaksi itemized 30 hari terakhir yang memakai bahan ini.'
                            : item.usage_basis === 'RECIPE_SMA_30D'
                              ? 'Forecast dari SMA pemakaian recipe bahan 30 hari terakhir.'
                              : 'Fallback dari usage_per_trx karena belum ada histori recipe.'
                        }
                      >
                        {usageBasisLabel[item.usage_basis]}
                      </span>
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
                {filteredInventoryAlerts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-black/40"
                    >
                      NO_MATERIAL_MATCH
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* SIDEBAR FORMS (KANAN) */}
        <motion.div variants={itemVariants} className="space-y-6 md:space-y-8">
          {/* FORM: INBOUND STOCK */}
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center gap-2 mb-6">
              <Package size={16} />
              <h3 className="text-[10px] font-black italic tracking-widest uppercase">
                {'// Inbound_Stock'}
              </h3>
            </div>
            <div className="space-y-4">
              <select
                className="w-full border-2 border-black p-3 font-bold text-xs md:text-sm bg-gray-50 focus:outline-none cursor-pointer"
                value={state.selectedId || ''}
                onChange={(e) => setters.setSelectedId(Number(e.target.value))}
              >
                <option value="">SELECT_MATERIAL</option>
                {filteredInventoryAlerts.map((item: InventoryAlertItem) => (
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
                value={state.addedStock}
                onChange={(e) => setters.setAddedStock(e.target.value)}
              />
              <button
                onClick={handlers.handleUpdateStock}
                disabled={
                  !state.selectedId ||
                  !state.addedStock ||
                  mutations.updateStockMutation.isPending
                }
                className="w-full bg-black text-white p-3 md:p-4 font-black uppercase text-xs tracking-widest hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors shadow-[4px_4px_0px_#444]"
              >
                {mutations.updateStockMutation.isPending
                  ? 'PROCESSING...'
                  : 'ADD_STOCK'}
              </button>
            </div>
          </div>

          {/* FORM: ADD MASTER ITEM */}
          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_#dc2626]">
            <div className="flex items-center gap-2 mb-6">
              <PlusSquare size={16} className="text-red-600" />
              <h3 className="text-[10px] font-black italic tracking-widest uppercase text-red-600">
                {'// Add_Master_Item'}
              </h3>
            </div>
            <div className="space-y-4">
              <input
                placeholder="ITEM_NAME"
                className="w-full border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                value={state.newItem.item_name}
                onChange={(e) =>
                  setters.setNewItem({
                    ...state.newItem,
                    item_name: e.target.value,
                  })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="UNIT (GR/KG)"
                  className="border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                  value={state.newItem.unit}
                  onChange={(e) =>
                    setters.setNewItem({
                      ...state.newItem,
                      unit: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="CURRENT_STOCK"
                  className="border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                  value={state.newItem.current_stock}
                  onChange={(e) =>
                    setters.setNewItem({
                      ...state.newItem,
                      current_stock:
                        e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="MIN_STOCK"
                  className="border border-black/20 p-2 text-xs font-bold outline-none focus:border-black"
                  value={state.newItem.min_stock}
                  onChange={(e) =>
                    setters.setNewItem({
                      ...state.newItem,
                      min_stock:
                        e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <div className="bg-gray-100 p-3 border-l-4 border-black relative">
                <div className="flex items-center gap-2 mb-2 text-black/50 w-fit cursor-help group">
                  <Info size={12} />
                  <span className="text-[9px] font-black uppercase border-b border-dashed border-black/30">
                    SMA Config
                  </span>
                  {/* TOOLTIP POPUP (Muncul saat di-hover) */}
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-black text-white p-4 text-[10px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-[4px_4px_0px_#dc2626] pointer-events-none">
                    <p className="text-red-500 font-black mb-1 tracking-widest uppercase text-xs">
                      Simple Moving Average
                    </p>
                    <p className="font-medium leading-relaxed text-gray-300">
                      Angka ini dipakai sebagai fallback saat belum ada histori
                      transaksi itemized yang terhubung ke recipe produk. <br />
                      <br />
                      <span className="text-white font-bold">
                        AI Sistem
                      </span>{' '}
                      akan lebih mengutamakan SMA pemakaian bahan aktual dari
                      recipe produk selama 30 hari terakhir.
                    </p>
                    <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.001"
                  placeholder="USAGE PER TRX"
                  className="w-full p-2 text-xs font-bold border border-black/10 outline-none focus:border-black"
                  value={state.newItem.usage_per_trx}
                  onChange={(e) =>
                    setters.setNewItem({
                      ...state.newItem,
                      usage_per_trx:
                        e.target.value === '' ? '' : parseFloat(e.target.value),
                    })
                  }
                />
              </div>
              <button
                onClick={handlers.handleAddItem}
                disabled={
                  !state.newItem.item_name ||
                  !state.newItem.unit ||
                  state.newItem.current_stock === '' ||
                  state.newItem.min_stock === '' ||
                  state.newItem.usage_per_trx === '' ||
                  mutations.addItemMutation.isPending
                }
                className="w-full bg-red-600 text-white p-3 font-black uppercase tracking-widest text-[10px] hover:bg-black transition-colors disabled:opacity-50"
              >
                {mutations.addItemMutation.isPending
                  ? 'CREATING...'
                  : 'REGISTER_ITEM'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
