export interface InvoiceRow {
  id: number;
  receipt_no: string;
  created_at: string;
  payment_method?: string | null;
  total_amount: number;
}

export interface InvoicePagination {
  data: InvoiceRow[];
  current_page: number;
  last_page: number;
}
