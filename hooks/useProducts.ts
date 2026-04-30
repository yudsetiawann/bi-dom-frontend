// hooks/useProducts.ts

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { RecipeIngredient, ProductPayload } from '@/types/product.types';

export function useProducts() {
  const queryClient = useQueryClient();

  // --- FORM STATES ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([
    { inventory_id: '', usage_qty: '' },
  ]);

  // --- QUERIES ---
  const { data: inventoryItems } = useQuery({
    queryKey: ['inventoryItems'],
    queryFn: async () =>
      (await api.get('/inventory/alerts')).data.data.inventory_alerts,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data.data,
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
    onError: (err: any) => {
      toast.error('FAILED', {
        description: err.response?.data?.message || 'Check your inputs',
      });
    },
  });

  // --- FORM HANDLERS ---
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategoryId('');
    setRecipe([{ inventory_id: '', usage_qty: '' }]);
  };

  const handleEditClick = (prod: any) => {
    setEditingId(prod.id);
    setName(prod.name);
    setPrice(prod.price);
    setCategoryId(prod.category_id);

    if (prod.materials && prod.materials.length > 0) {
      const existingRecipe = prod.materials.map((m: any) => ({
        inventory_id: m.id.toString(),
        usage_qty: m.pivot.usage_qty,
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
      materials: recipe,
    });
  };

  // Kembalikan semua data dan fungsi ke UI
  return {
    state: { editingId, name, price, categoryId, recipe },
    setters: { setName, setPrice, setCategoryId },
    data: { inventoryItems, products, isLoading },
    mutations: { saveProductMutation },
    handlers: {
      resetForm,
      handleEditClick,
      handleSave,
      addIngredientRow,
      removeIngredientRow,
      updateRecipeRow,
    },
  };
}
