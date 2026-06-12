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

export interface InventoryAlertItem {
  id: number;
  item_name: string;
  current_stock: number;
  unit: string;
  predicted_usage: number;
  usage_basis: 'RECIPE_SMA_30D' | 'NO_RECENT_USAGE' | 'TRX_AVG_FALLBACK';
  status: string;
}

export interface InventoryAlertsResponse {
  forecast_next_week_trx: number;
  forecast_window_start?: string;
  forecast_window_end?: string;
  inventory_alerts: InventoryAlertItem[];
}

export interface StockUpdateStatus {
  type: 'success' | 'error';
  msg: string;
}
