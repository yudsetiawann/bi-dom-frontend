// types/dashboard.types.ts

export interface KpiData {
  revenue: number;
  net_profit: number;
  profit_margin: number;
  total_cogs: number;
  transaction_count: number;
}

export interface MarketBasketPair {
  product_a: string;
  product_b: string;
  times_bought_together: number;
}

export interface PeakHourData {
  day_name: string;
  hour: number;
  total_trx: number;
}

export interface InventoryAlert {
  id: number;
  item_name: string;
  current_stock: number;
  unit: string;
  predicted_usage: number;
  status: string;
}

export interface TopProduct {
  name: string;
  total_qty: number;
  total_revenue: number;
}
