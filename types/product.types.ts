// types/product.types.ts

export interface RecipeIngredient {
  inventory_id: string;
  usage_qty: string;
}

export interface ProductPayload {
  name: string;
  category_id: string | number;
  price: string | number;
  cogs: string | number;
  materials: RecipeIngredient[];
}

export interface InventoryMaterial {
  id: number;
  item_name: string;
  unit: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}

export interface ProductMaterial extends InventoryMaterial {
  pivot: {
    usage_qty: string | number;
  };
}

export interface ProductItem {
  id: number;
  name: string;
  category_id: string | number;
  category?: {
    name: string;
  } | null;
  price: string | number;
  cogs: string | number;
  materials?: ProductMaterial[];
}
