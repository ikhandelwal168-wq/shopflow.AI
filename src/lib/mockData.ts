import { Product, Invoice, UserProfile } from '@/types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic White T-Shirt',
    brand: 'Essential',
    category: 'Clothing',
    sku: 'TS-WHT-01',
    barcode: '1234567890123',
    hsn_code: '6109',
    mrp: 499,
    cost_price: 250,
    current_stock: 50,
    reorder_level: 10,
    unit: 'pcs',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    size_variant: 'M',
    tax_rate: 5,
    supplier_name: 'Essential Apparels',
    image_url: null
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    brand: 'TechPro',
    category: 'Electronics',
    sku: 'MS-WRL-02',
    barcode: '2345678901234',
    hsn_code: '8471',
    mrp: 999,
    cost_price: 600,
    current_stock: 5,
    reorder_level: 15,
    unit: 'pcs',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    size_variant: null,
    tax_rate: 18,
    supplier_name: 'TechPro Solutions',
    image_url: null
  },
  {
    id: '3',
    name: 'Organic Green Tea',
    brand: 'NatureLeaf',
    category: 'Groceries',
    sku: 'GT-ORG-03',
    barcode: '3456789012345',
    hsn_code: '0902',
    mrp: 299,
    cost_price: 180,
    current_stock: 100,
    reorder_level: 20,
    unit: 'box',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    size_variant: '250g',
    tax_rate: 5,
    supplier_name: 'NatureLeaf Organics',
    image_url: null
  }
];

export const MOCK_USER: UserProfile = {
  id: 'user_1',
  full_name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  created_at: new Date().toISOString()
};
