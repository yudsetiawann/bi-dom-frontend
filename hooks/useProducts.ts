// hooks/useProducts.ts

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  InventoryMaterial,
  ProductItem,
  ProductCategory,
  ProductMaterial,
  RecipeIngredient,
  ProductPayload,
} from '@/types/product.types';

export function useProducts() {
  const queryClient = useQueryClient();

  // --- FORM STATES ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cogs, setCogs] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([
    { inventory_id: '', usage_qty: '' },
  ]);

  // --- QUERIES ---
  const { data: inventoryItems } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: async (): Promise<InventoryMaterial[]> =>
      (await api.get('/inventory/alerts')).data.data.inventory_alerts,
  });

  const { data: categories } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async (): Promise<ProductCategory[]> =>
      (await api.get('/dashboard/categories-list')).data.data,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<ProductItem[]> =>
      (await api.get('/products')).data.data,
  });

  // --- MUTATIONS ---
  const saveProductMutation = useMutation({
    mutationFn: async (payload: ProductPayload) => {
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
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error('FAILED', {
        description: err.response?.data?.message || 'Check your inputs',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/products/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
      toast.success('PRODUCT_DELETED');
    },
    onError: (err: AxiosError<{ message?: string }>) => {
      toast.error('DELETE_FAILED', {
        description: err.response?.data?.message || 'Product could not be deleted',
      });
    },
  });

  // --- FORM HANDLERS ---
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCogs('');
    setCategoryId('');
    setRecipe([{ inventory_id: '', usage_qty: '' }]);
  };

  const handleEditClick = (prod: ProductItem) => {
    setEditingId(prod.id);
    setName(prod.name);
    setPrice(String(prod.price));
    setCogs(String(prod.cogs ?? 0));
    setCategoryId(String(prod.category_id));

    if (prod.materials && prod.materials.length > 0) {
      const existingRecipe = prod.materials.map((m: ProductMaterial) => ({
        inventory_id: m.id.toString(),
        usage_qty: String(m.pivot.usage_qty),
      }));
      setRecipe(existingRecipe);
    } else {
      setRecipe([{ inventory_id: '', usage_qty: '' }]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- RECIPE ARRAY HANDLERS ---
  const addIngredientRow = () =>
    setRecipe([...recipe, { inventory_id: '', usage_qty: '' }]);

  const removeIngredientRow = (index: number) =>
    setRecipe(recipe.filter((_, i) => i !== index));

  const updateRecipeRow = (
    index: number,
    field: keyof RecipeIngredient,
    value: string,
  ) => {
    const newRecipe = [...recipe];
    newRecipe[index][field] = value;
    setRecipe(newRecipe);
  };

  const handleSave = () => {
    saveProductMutation.mutate({
      name,
      category_id: categoryId,
      price,
      cogs,
      materials: recipe,
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    deleteProductMutation.mutate(id);
  };

  // Kembalikan semua data dan fungsi ke UI
  return {
    state: { editingId, name, price, cogs, categoryId, recipe },
    setters: { setName, setPrice, setCogs, setCategoryId },
    data: { inventoryItems, categories, products, isLoading },
    mutations: { saveProductMutation, deleteProductMutation },
    handlers: {
      resetForm,
      handleEditClick,
      handleSave,
      handleDelete,
      addIngredientRow,
      removeIngredientRow,
      updateRecipeRow,
    },
  };
}
