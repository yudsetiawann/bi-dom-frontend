'use client';

import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { Plus, Trash2, Save, Coffee, Edit2, X, Search } from 'lucide-react';
import type {
  InventoryMaterial,
  ProductCategory,
  ProductItem,
  ProductMaterial,
} from '@/types/product.types';

export default function MasterProduct() {
  const { state, setters, data, mutations, handlers } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const products = data.products || [];
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product: ProductItem) => {
      const materials = product.materials
        ?.map((material: ProductMaterial) => material.item_name)
        .join(' ');

      return [
        product.name,
        product.category?.name,
        String(product.category_id),
        materials,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [data.products, searchQuery]);

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
      <div className="p-8 font-black animate-pulse uppercase">
        Syncing_Catalog...
      </div>
    );
  }

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

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* FORM KIRI (ADD / EDIT) */}
        <motion.div
          variants={itemVariants}
          className={`border-2 border-black p-6 transition-all ${state.editingId ? 'bg-red-50 shadow-[8px_8px_0px_#dc2626]' : 'bg-white shadow-[8px_8px_0px_#000000]'}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black italic tracking-widest uppercase flex items-center gap-2">
              {state.editingId ? (
                <>
                  <Edit2 size={16} className="text-red-600" />{' '}
                  {'// EDIT_MENU_MODE'}
                </>
              ) : (
                <>
                  <Plus size={16} /> {'// ADD_NEW_MENU'}
                </>
              )}
            </h3>
            {state.editingId && (
              <button
                onClick={handlers.resetForm}
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
              value={state.name}
              onChange={(e) => setters.setName(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="w-1/3 border-2 border-black p-3 font-bold text-sm bg-white focus:bg-gray-50 outline-none"
                value={state.categoryId}
                onChange={(e) => setters.setCategoryId(e.target.value)}
              >
                <option value="">CATEGORY</option>
                {data.categories?.map((category: ProductCategory) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="PRICE (Rp)"
                className="flex-1 border-2 border-black p-3 font-bold text-sm bg-white focus:bg-gray-50 outline-none"
                value={state.price}
                onChange={(e) => setters.setPrice(e.target.value)}
              />
            </div>
            <input
              type="number"
              placeholder="COGS / MODAL (Rp)"
              className="w-full border-2 border-black p-3 font-bold text-sm bg-white focus:bg-gray-50 outline-none"
              value={state.cogs}
              onChange={(e) => setters.setCogs(e.target.value)}
            />

            {/* RECIPE INGREDIENTS */}
            <div className="pt-4 border-t-2 border-black/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 text-red-600">
                Recipe_Ingredients:
              </h4>
              {state.recipe.map((row, index) => (
                <div key={index} className="flex gap-2 mb-3 items-center">
                  <select
                    className="flex-1 border border-black p-2 text-[10px] font-bold bg-white outline-none"
                    value={row.inventory_id}
                    onChange={(e) =>
                      handlers.updateRecipeRow(
                        index,
                        'inventory_id',
                        e.target.value,
                      )
                    }
                  >
                    <option value="">SELECT_MATERIAL</option>
                    {data.inventoryItems?.map((item: InventoryMaterial) => (
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
                      handlers.updateRecipeRow(
                        index,
                        'usage_qty',
                        e.target.value,
                      )
                    }
                  />
                  <button
                    onClick={() => handlers.removeIngredientRow(index)}
                    className="text-red-600 hover:bg-red-50 p-2 border border-transparent hover:border-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={handlers.addIngredientRow}
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <Plus size={12} /> Add_Ingredient
              </button>
            </div>

            <button
              onClick={handlers.handleSave}
              disabled={
                mutations.saveProductMutation.isPending ||
                !state.name ||
                !state.categoryId ||
                !state.price ||
                !state.cogs
              }
              className={`w-full text-white p-4 font-black uppercase text-xs tracking-widest mt-6 shadow-[4px_4px_0px_#444] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${state.editingId ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'}`}
            >
              <Save size={16} />{' '}
              {mutations.saveProductMutation.isPending
                ? 'PROCESSING...'
                : state.editingId
                  ? 'UPDATE_CATALOG'
                  : 'REGISTER_PRODUCT'}
            </button>
          </div>
        </motion.div>

        {/* LIST KANAN (EXISTING MENU) */}
        <motion.div
          variants={itemVariants}
          className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#dc2626]"
        >
          <h3 className="text-xs font-black italic tracking-widest uppercase mb-6 flex items-center gap-2">
            <Coffee size={16} /> {'// Existing_Menu'}
          </h3>
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              type="search"
              placeholder="SEARCH_MENU / CATEGORY / MATERIAL"
              className="w-full border-2 border-black pl-10 pr-3 py-3 font-black text-[10px] tracking-widest uppercase outline-none focus:bg-gray-50"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredProducts.map((prod: ProductItem) => (
              <div
                key={prod.id}
                className={`border-b-2 border-black/5 pb-4 group relative cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded transition-colors ${state.editingId === prod.id ? 'bg-red-50' : ''}`}
                onClick={() => handlers.handleEditClick(prod)}
              >
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button className="text-[9px] bg-black text-white px-2 py-1 font-black uppercase tracking-widest flex items-center gap-1">
                    <Edit2 size={10} /> Edit
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handlers.handleDelete(prod.id);
                    }}
                    disabled={mutations.deleteProductMutation.isPending}
                    className="text-[9px] bg-red-600 text-white px-2 py-1 font-black uppercase tracking-widest flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={10} /> Delete
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
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  COGS: Rp {Number(prod.cogs || 0).toLocaleString('id-ID')}
                </p>
                {prod.materials && prod.materials.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prod.materials.map((m: ProductMaterial) => (
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
            {filteredProducts.length === 0 && (
              <div className="border-2 border-dashed border-black/20 p-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                  NO_MENU_MATCH
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
