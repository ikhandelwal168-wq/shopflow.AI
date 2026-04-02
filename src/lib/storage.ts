import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, Invoice, UserProfile, InvoiceItem } from '@/types';

export const storage = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },
  saveProduct: async (product: Partial<Product>) => {
    if (product.id) {
      const docRef = doc(db, 'products', product.id);
      await setDoc(docRef, { ...product, updated_at: new Date().toISOString() }, { merge: true });
      return { id: product.id, ...product } as Product;
    } else {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      return { id: docRef.id, ...product } as Product;
    }
  },
  deleteProduct: async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    const q = query(collection(db, 'invoices'), orderBy('invoice_date', 'desc'));
    const querySnapshot = await getDocs(q);
    const invoices: Invoice[] = [];
    
    for (const invoiceDoc of querySnapshot.docs) {
      const invoiceData = invoiceDoc.data();
      // Fetch items for each invoice
      const itemsSnapshot = await getDocs(collection(db, 'invoices', invoiceDoc.id, 'items'));
      const items = itemsSnapshot.docs.map(itemDoc => ({ id: itemDoc.id, ...itemDoc.data() } as InvoiceItem));
      
      invoices.push({ 
        id: invoiceDoc.id, 
        ...invoiceData, 
        invoice_items: items 
      } as Invoice);
    }
    
    return invoices;
  },
  saveInvoice: async (invoice: any) => {
    const batch = writeBatch(db);
    const invoiceRef = doc(collection(db, 'invoices'));
    const { invoice_items, ...invoiceData } = invoice;
    
    batch.set(invoiceRef, {
      ...invoiceData,
      created_at: new Date().toISOString()
    });

    // Add items and update stock
    for (const item of invoice_items) {
      const itemRef = doc(collection(db, 'invoices', invoiceRef.id, 'items'));
      batch.set(itemRef, item);

      // Update product stock
      const productRef = doc(db, 'products', item.product_id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().current_stock;
        batch.update(productRef, {
          current_stock: currentStock - item.quantity,
          updated_at: new Date().toISOString()
        });
      }
    }

    await batch.commit();
    return { id: invoiceRef.id, ...invoiceData, invoice_items };
  },

  // User
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const docSnap = await getDoc(doc(db, 'user_profiles', userId));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  }
};
