import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Receipt, 
  User, 
  CreditCard, 
  Smartphone, 
  Banknote,
  Printer,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { storage } from '@/lib/storage';
import { Product } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useBillingStore } from '@/hooks/useBilling';
import { useAuth } from '@/hooks/useAuth';

export default function Billing() {
  const { user } = useAuth();
  const { 
    cart, 
    customerName, 
    customerPhone, 
    customerGSTIN, 
    paymentMethod, 
    amountTendered,
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    updateDiscount,
    setCustomerInfo,
    setPaymentMethod,
    setAmountTendered,
    clearCart,
    calculateTotals
  } = useBillingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      searchProducts();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchProducts = async () => {
    const products = storage.getProducts();
    const results = products.filter(p => 
      p.is_active && (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode === searchQuery
      )
    ).slice(0, 5);
    setSearchResults(results);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const totals = calculateTotals();
    if (paymentMethod === 'cash' && amountTendered < totals.total) {
      toast.error('Amount tendered is less than total');
      return;
    }

    setIsProcessing(true);
    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      
      // 1. Generate Invoice Number
      const invoices = storage.getInvoices();
      const todayInvoices = invoices.filter(inv => inv.invoice_number.includes(today));
      const invoiceNumber = `INV-${today}-${String(todayInvoices.length + 1).padStart(4, '0')}`;

      // 2. Create Invoice
      const invoiceData: any = {
        invoice_number: invoiceNumber,
        customer_name: customerName || 'Walk-in Customer',
        customer_phone: customerPhone,
        customer_gstin: customerGSTIN,
        subtotal: totals.subtotal,
        total_tax: totals.tax,
        discount: totals.discount,
        grand_total: totals.total,
        payment_method: paymentMethod,
        amount_tendered: amountTendered,
        created_by: user?.id,
        invoice_date: new Date().toISOString(),
        invoice_items: cart.map(item => {
          const itemTaxableAmount = (item.product.mrp * item.quantity - item.discount) / (1 + item.product.tax_rate / 100);
          const itemTaxAmount = (item.product.mrp * item.quantity - item.discount) - itemTaxableAmount;
          return {
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.mrp,
            tax_rate: item.product.tax_rate,
            tax_amount: itemTaxAmount,
            total: item.product.mrp * item.quantity - item.discount
          };
        })
      };

      storage.saveInvoice(invoiceData);
      toast.success('Sale completed successfully! Invoice: ' + invoiceNumber);
      clearCart();
      setSearchQuery('');
    } catch (error: any) {
      toast.error('Error completing sale: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const totals = calculateTotals();
  const change = paymentMethod === 'cash' ? Math.max(0, amountTendered - totals.total) : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 lg:flex-row">
      {/* Left Panel: Cart & Search */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                ref={searchInputRef}
                placeholder="Search product name, SKU, or scan barcode..." 
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    addToCart(searchResults[0]);
                    setSearchQuery('');
                  }
                }}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                      onClick={() => {
                        addToCart(p);
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                    >
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.sku} | Stock: {p.current_stock}</div>
                      </div>
                      <div className="font-bold text-primary">{formatCurrency(p.mrp)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[120px] text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Receipt className="w-12 h-12 opacity-20" />
                          <p>Your cart is empty. Start adding products.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-xs text-gray-500">{item.product.sku}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.product.mrp)}</TableCell>
                        <TableCell className="text-right">
                          <Input 
                            type="number" 
                            className="w-20 h-8 text-right ml-auto" 
                            value={item.discount}
                            onChange={e => updateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(item.product.mrp * item.quantity - item.discount)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
          <CardFooter className="bg-gray-50 p-4 flex justify-between items-center border-t">
            <div className="text-sm text-gray-500">
              {cart.length} items in cart
            </div>
            <Button variant="outline" size="sm" onClick={clearCart} className="text-red-600 hover:bg-red-50">
              Clear Cart
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Panel: Summary & Checkout */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cust-name">Name</Label>
              <Input 
                id="cust-name" 
                placeholder="Walk-in Customer" 
                value={customerName}
                onChange={e => setCustomerInfo({ name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cust-phone">Phone</Label>
                <Input 
                  id="cust-phone" 
                  placeholder="9876543210" 
                  value={customerPhone}
                  onChange={e => setCustomerInfo({ phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cust-gst">GSTIN (Optional)</Label>
                <Input 
                  id="cust-gst" 
                  placeholder="27AAAAA0000A1Z5" 
                  value={customerGSTIN}
                  onChange={e => setCustomerInfo({ gstin: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (GST)</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-600">-{formatCurrency(totals.discount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">Grand Total</span>
                <span className="text-3xl font-black text-primary">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Label>Payment Method</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(v: any) => setPaymentMethod(v)}
                className="grid grid-cols-3 gap-2"
              >
                <Label
                  htmlFor="cash"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    paymentMethod === 'cash' && "border-primary"
                  )}
                >
                  <RadioGroupItem value="cash" id="cash" className="sr-only" />
                  <Banknote className="mb-1 h-5 w-5" />
                  <span className="text-[10px] uppercase font-bold">Cash</span>
                </Label>
                <Label
                  htmlFor="card"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    paymentMethod === 'card' && "border-primary"
                  )}
                >
                  <RadioGroupItem value="card" id="card" className="sr-only" />
                  <CreditCard className="mb-1 h-5 w-5" />
                  <span className="text-[10px] uppercase font-bold">Card</span>
                </Label>
                <Label
                  htmlFor="upi"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    paymentMethod === 'upi' && "border-primary"
                  )}
                >
                  <RadioGroupItem value="upi" id="upi" className="sr-only" />
                  <Smartphone className="mb-1 h-5 w-5" />
                  <span className="text-[10px] uppercase font-bold">UPI</span>
                </Label>
              </RadioGroup>
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="tendered">Amount Tendered</Label>
                  <Input 
                    id="tendered" 
                    type="number" 
                    className="text-xl font-bold h-12" 
                    value={amountTendered}
                    onChange={e => setAmountTendered(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="text-blue-700 font-medium">Change to Return</span>
                  <span className="text-2xl font-black text-blue-800">{formatCurrency(change)}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              className="w-full h-16 text-xl font-bold gap-2" 
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCompleteSale}
            >
              <Printer className="w-6 h-6" />
              {isProcessing ? 'Processing...' : 'Complete Sale (F8)'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
