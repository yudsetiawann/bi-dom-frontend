'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, Trash2, Save, Coffee, Tag, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MasterProduct() {
  const queryClient = useQueryClient();

  // State form
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recipe, setRecipe] = useState([{ inventory_id: '', usage_qty: '' }]);

  const { data: inventoryItems } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: async () =>
      (await api.get('/inventory/alerts')).data.data.inventory_alerts,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data.data,
  });

  // Reset Form
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategoryId('');
    setRecipe([{ inventory_id: '', usage_qty: '' }]);
  };

  // Handler Klik Tombol Edit di Kanan
  const handleEditClick = (prod: any) => {
    setEditingId(prod.id);
    setName(prod.name);
    setPrice(prod.price);
    setCategoryId(prod.category_id);

    // Tarik resep lama jika ada, jika tidak, beri 1 baris kosong
    if (prod.materials && prod.materials.length > 0) {
      const existingRecipe = prod.materials.map((m: any) => ({
        inventory_id: m.id.toString(),
        usage_qty: m.pivot.usage_qty,
      }));
      setRecipe(existingRecipe);
    } else {
      setRecipe([{ inventory_id: '', usage_qty: '' }]);
    }

    // Scroll otomatis ke atas (opsional tapi bagus untuk UX mobile)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mutasi untuk Save (Bisa POST untuk baru, PUT untuk update)
  const saveProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingId) {
        return (await api.put(`/products/${editingId}`, payload)).data;
      } else {
        return (await api.post('/products', payload)).data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      toast.success(editingId ? 'PRODUCT_UPDATED' : 'PRODUCT_REGISTERED');
    },
    onError: (err: any) => {
      toast.error('FAILED', {
        description: err.response?.data?.message || 'Check your inputs',
      });
    },
  });

  const addIngredientRow = () =>
    setRecipe([...recipe, { inventory_id: '', usage_qty: '' }]);
  const removeIngredientRow = (index: number) =>
    setRecipe(recipe.filter((_, i) => i !== index));
  const updateRecipeRow = (index: number, field: string, value: string) => {
    const newRecipe = [...recipe];
    (newRecipe[index] as any)[field] = value;
    setRecipe(newRecipe);
  };

  if (isLoading)
    return (
      <div className="p-8 font-black animate-pulse uppercase">
        Syncing_Catalog...
      </div>
    );

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto pb-20 font-montserrat">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-black uppercase">
          Master_Catalog
        </h1>
        <p className="text-[10px] text-red-600 font-bold tracking-[0.4em] uppercase mt-1 underline decoration-2 underline-offset-4">
          Product & Recipe Management
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FORM KIRI (ADD / EDIT) */}
        <div
          className={`border-2 border-black p-6 transition-all ${editingId ? 'bg-red-50 shadow-[8px_8px_0px_#dc2626]' : 'bg-white shadow-[8px_8px_0px_#000000]'}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black italic tracking-widest uppercase flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit2 size={16} className="text-red-600" /> // EDIT_MENU_MODE
                </>
              ) : (
                <>
                  <Plus size={16} /> // ADD_NEW_MENU
                </>
              )}
            </h3>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-[10px] font-black text-gray-500 hover:text-red-600 uppercase flex items-center gap-1"
              >
                <X size={12} /> Cancel_Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <input
              placeholder="PRODUCT_NAME (e.g. Aren Latte)"
              className="w-full border-2 border-black p-3 font-bold text-sm bg-white focus:bg-gray-50 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex gap-2">
              <div className="w-1/3 relative">
                <Tag
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50"
                />
                <input
                  type="number"
                  placeholder="CAT_ID"
                  className="w-full border-2 border-black p-3 pl-8 font-bold text-sm bg-white focus:bg-gray-50 outline-none"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                />
              </div>
              <input
                type="number"
                placeholder="PRICE (Rp)"
                className="flex-1 border-2 border-black p-3 font-bold text-sm bg-white focus:bg-gray-50 outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t-2 border-black/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-red-600">
                Recipe_Ingredients:
              </h4>

              {recipe.map((row, index) => (
                <div key={index} className="flex gap-2 mb-3 items-center">
                  <select
                    className="flex-1 border border-black p-2 text-[10px] font-bold bg-white outline-none"
                    value={row.inventory_id}
                    onChange={(e) =>
                      updateRecipeRow(index, 'inventory_id', e.target.value)
                    }
                  >
                    <option value="">SELECT_MATERIAL</option>
                    {inventoryItems?.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} ({item.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="QTY"
                    className="w-20 border border-black p-2 text-[10px] font-bold outline-none"
                    value={row.usage_qty}
                    onChange={(e) =>
                      updateRecipeRow(index, 'usage_qty', e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeIngredientRow(index)}
                    className="text-red-600 hover:bg-red-50 p-2 border border-transparent hover:border-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                onClick={addIngredientRow}
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <Plus size={12} /> Add_Ingredient
              </button>
            </div>

            <button
              onClick={() =>
                saveProductMutation.mutate({
                  name,
                  category_id: categoryId,
                  price,
                  materials: recipe,
                })
              }
              disabled={
                saveProductMutation.isPending || !name || !categoryId || !price
              }
              className={`w-full text-white p-4 font-black uppercase text-xs tracking-widest mt-6 shadow-[4px_4px_0px_#444] transition-all flex items-center justify-center gap-2 disabled:opacity-50 
                ${editingId ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}`}
            >
              <Save size={16} />{' '}
              {saveProductMutation.isPending
                ? 'PROCESSING...'
                : editingId
                  ? 'UPDATE_CATALOG'
                  : 'REGISTER_PRODUCT'}
            </button>
          </div>
        </div>

        {/* LIST KANAN (EXISTING MENU) */}
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#dc2626]">
          <h3 className="text-xs font-black italic tracking-widest uppercase mb-6 flex items-center gap-2">
            <Coffee size={16} /> // Existing_Menu
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {products?.map((prod: any) => (
              <div
                key={prod.id}
                className={`border-b-2 border-black/5 pb-4 group relative cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded transition-colors ${editingId === prod.id ? 'bg-red-50' : ''}`}
                onClick={() => handleEditClick(prod)} // <-- KLIK DISINI UNTUK EDIT
              >
                {/* Tombol Edit Hover (Indikator visual bahwa ini bisa diklik) */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-[9px] bg-black text-white px-2 py-1 font-black uppercase tracking-widest flex items-center gap-1">
                    <Edit2 size={10} /> Edit
                  </button>
                </div>

                <div className="flex justify-between items-start mb-2 pr-16">
                  <div>
                    <p className="font-black uppercase text-sm group-hover:text-red-600 transition-colors">
                      {prod.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      Category ID: {prod.category_id}{' '}
                      {prod.category ? `(${prod.category.name})` : ''}
                    </p>
                  </div>
                  <p className="font-black text-xs text-black">
                    Rp {Number(prod.price || 0).toLocaleString('id-ID')}
                  </p>
                </div>

                {prod.materials && prod.materials.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prod.materials.map((m: any) => (
                      <span
                        key={m.id}
                        className="text-[9px] bg-gray-100 border border-black/10 px-2 py-1 font-bold text-gray-700"
                      >
                        {m.item_name}: {Number(m.pivot.usage_qty)} {m.unit}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[9px] text-red-500/70 font-bold italic mt-2 uppercase flex items-center gap-1">
                    <X size={10} /> No_Recipe_Configured
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
