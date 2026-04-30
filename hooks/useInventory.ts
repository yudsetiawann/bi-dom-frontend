// hooks/useInventory.ts

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { NewItemPayload, UpdateStockPayload } from '@/types/inventory.types';

export function useInventory() {
  const queryClient = useQueryClient();

  // --- STATES ---
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addedStock, setAddedStock] = useState<string>('');
  const [newItem, setNewItem] = useState<NewItemPayload>({
    item_name: '',
    unit: '',
    current_stock: '', // Biasanya default ke 0 di backend jika kosong
    min_stock: '',
    usage_per_trx: '',
  });

  // --- FETCH QUERIES ---
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventoryAlerts'],
    queryFn: async () => (await api.get('/inventory/alerts')).data.data,
  });

  // --- MUTATIONS ---
  const updateStockMutation = useMutation({
    mutationFn: async (payload: UpdateStockPayload) =>
      (await api.post('/inventory/update-stock', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      setAddedStock('');
      setSelectedId(null);
      toast.success('STOCK_REPLENISHED', {
        description: 'Persediaan berhasil ditambahkan ke dalam sistem.',
      });
    },
    onError: () => {
      toast.error('UPDATE_FAILED', { description: 'Gagal memperbarui stok.' });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (payload: NewItemPayload) =>
      (await api.post('/inventory/items', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      setNewItem({
        item_name: '',
        unit: '',
        current_stock: '',
        min_stock: '',
        usage_per_trx: '',
      });
      toast.success('MASTER_DATA_CREATED', {
        description: 'Bahan baku baru telah terdaftar di database.',
      });
    },
    onError: () => {
      toast.error('CREATION_FAILED', {
        description: 'Gagal mendaftarkan bahan baku.',
      });
    },
  });

  // --- HANDLERS ---
  const handleUpdateStock = () => {
    if (!selectedId || !addedStock) return;
    updateStockMutation.mutate({
      inventory_id: selectedId,
      added_stock: parseFloat(addedStock),
    });
  };

  const handleAddItem = () => {
    if (!newItem.item_name) return;
    addItemMutation.mutate(newItem);
  };

  return {
    state: { selectedId, addedStock, newItem },
    setters: { setSelectedId, setAddedStock, setNewItem },
    data: { inventoryData, isLoading },
    mutations: { updateStockMutation, addItemMutation },
    handlers: { handleUpdateStock, handleAddItem },
  };
}
