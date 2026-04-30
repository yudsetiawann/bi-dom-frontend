// types/inventory.types.ts

export interface NewItemPayload {
  item_name: string;
  unit: string;
  current_stock: number | string;
  min_stock: number | string;
  usage_per_trx: number | string;
}

export interface UpdateStockPayload {
  inventory_id: number;
  added_stock: number;
}
