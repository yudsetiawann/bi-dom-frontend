// types/product.types.ts

export interface RecipeIngredient {
  inventory_id: string;
  usage_qty: string;
}

export interface ProductPayload {
  name: string;
  category_id: string | number;
  price: string | number;
  materials: RecipeIngredient[];
}
