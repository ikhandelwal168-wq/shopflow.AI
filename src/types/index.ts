export type UserRole = 'admin' | 'staff' | 'viewer';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string;
  size_variant: string | null;
  barcode: string | null;
  mrp: number;
  cost_price: number;
  current_stock: number;
  reorder_level: number;
  hsn_code: string | null;
  tax_rate: number;
  unit: string;
  supplier_name: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_gstin: string | null;
  subtotal: number;
  total_tax: number;
  discount: number;
  grand_total: number;
  payment_method: 'cash' | 'card' | 'upi';
  amount_tendered: number | null;
  created_by: string;
  created_at: string;
  invoice_items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}

export interface StockAdjustment {
  id: string;
  product_id: string;
  adjustment_type: 'damage' | 'return_supplier' | 'return_customer' | 'correction';
  quantity_change: number;
  reason: string;
  adjusted_by: string;
  adjusted_at: string;
}
