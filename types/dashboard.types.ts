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

export interface LatestTransaction {
  id: number;
  receipt_no: string;
  total_amount: number;
}

export interface DailyRevenuePoint {
  day_name: string;
  total: number | string;
}

export interface StackedCategoryTrendPoint {
  category_name: string;
  time_unit: number;
  total_revenue: number | string;
}

export interface DonutChartPoint {
  label: string;
  value: number;
}

export interface SalesDataset {
  categoryId: number;
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  hidden?: boolean;
}

export interface TransactionDetailItem {
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface TransactionDetailResponse {
  transaction?: {
    receipt_no?: string;
    created_at?: string;
    trx_date?: string;
    total_amount?: number;
  };
  items?: TransactionDetailItem[];
}
