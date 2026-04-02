import { create } from 'zustand';
import { Product } from '@/types';

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface BillingState {
  cart: CartItem[];
  customerName: string;
  customerPhone: string;
  customerGSTIN: string;
  paymentMethod: 'cash' | 'card' | 'upi';
  amountTendered: number;
  
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number) => void;
  setCustomerInfo: (info: { name?: string; phone?: string; gstin?: string }) => void;
  setPaymentMethod: (method: 'cash' | 'card' | 'upi') => void;
  setAmountTendered: (amount: number) => void;
  clearCart: () => void;
  
  calculateTotals: () => {
    subtotal: number;
    tax: number;
    total: number;
    discount: number;
  };
}

export const useBillingStore = create<BillingState>((set, get) => ({
  cart: [],
  customerName: '',
  customerPhone: '',
  customerGSTIN: '',
  paymentMethod: 'cash',
  amountTendered: 0,

  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, quantity: 1, discount: 0 }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) return;
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  updateDiscount: (productId, discount) => {
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, discount } : item
      ),
    });
  },

  setCustomerInfo: (info) => {
    set((state) => ({
      customerName: info.name ?? state.customerName,
      customerPhone: info.phone ?? state.customerPhone,
      customerGSTIN: info.gstin ?? state.customerGSTIN,
    }));
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setAmountTendered: (amount) => set({ amountTendered: amount }),
  clearCart: () => set({ cart: [], customerName: '', customerPhone: '', customerGSTIN: '', amountTendered: 0 }),

  calculateTotals: () => {
    const { cart } = get();
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    cart.forEach((item) => {
      const itemTotal = item.product.mrp * item.quantity;
      const itemDiscount = item.discount;
      const taxableAmount = (itemTotal - itemDiscount) / (1 + item.product.tax_rate / 100);
      const itemTax = (itemTotal - itemDiscount) - taxableAmount;

      subtotal += taxableAmount;
      tax += itemTax;
      discount += itemDiscount;
    });

    return {
      subtotal,
      tax,
      discount,
      total: subtotal + tax,
    };
  },
}));
