import { Product, Invoice, UserProfile } from '@/types';
import { MOCK_PRODUCTS, MOCK_USER } from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'shopflow_products',
  INVOICES: 'shopflow_invoices',
  USER: 'shopflow_user',
  SETTINGS: 'shopflow_settings'
};

export const storage = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
      return MOCK_PRODUCTS;
    }
    return JSON.parse(data);
  },
  saveProduct: (product: Product) => {
    const products = storage.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...product, updated_at: new Date().toISOString() };
    } else {
      products.push({ ...product, id: Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return product;
  },
  deleteProduct: (id: string) => {
    const products = storage.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return data ? JSON.parse(data) : [];
  },
  saveInvoice: (invoice: Invoice) => {
    const invoices = storage.getInvoices();
    const newInvoice = {
      ...invoice,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    invoices.push(newInvoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    
    // Update stock levels
    const products = storage.getProducts();
    invoice.invoice_items.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        product.current_stock -= item.quantity;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    
    return newInvoice;
  },

  // User
  getUser: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : MOCK_USER;
  },
  saveUser: (user: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  clearUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};
