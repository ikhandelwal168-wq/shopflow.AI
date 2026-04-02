import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  IndianRupee, 
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { storage } from '@/lib/storage';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Report Data
  const [salesReport, setSalesReport] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [slowMovers, setSlowMovers] = useState<any[]>([]);
  const [profitAnalysis, setProfitAnalysis] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') await fetchSalesReport();
      else if (activeTab === 'best-sellers') await fetchBestSellers();
      else if (activeTab === 'slow-movers') await fetchSlowMovers();
      else if (activeTab === 'profit') await fetchProfitAnalysis();
    } catch (error: any) {
      toast.error('Error fetching report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    const data = await storage.getInvoices();
    setSalesReport(data || []);
  };

  const fetchBestSellers = async () => {
    const invoices = await storage.getInvoices();
    const data: any[] = [];
    invoices.forEach(inv => {
      inv.invoice_items.forEach(item => {
        data.push({ product_name: item.product_name, quantity: item.quantity, total: item.total });
      });
    });
    
    // Grouping logic (simplified)
    const grouped = data?.reduce((acc: any, item: any) => {
      if (!acc[item.product_name]) {
        acc[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      acc[item.product_name].quantity += item.quantity;
      acc[item.product_name].revenue += item.total;
      return acc;
    }, {});
    
    setBestSellers(Object.values(grouped || {}).sort((a: any, b: any) => b.revenue - a.revenue));
  };

  const fetchSlowMovers = async () => {
    // Simplified logic: products with stock but no recent sales
    const products = await storage.getProducts();
    const filtered = products.filter(p => p.current_stock > 0);
    setSlowMovers(filtered || []);
  };

  const fetchProfitAnalysis = async () => {
    const products = await storage.getProducts();
    
    const analysis = products?.map(p => ({
      ...p,
      profit: p.mrp - p.cost_price,
      margin: ((p.mrp - p.cost_price) / (p.cost_price || 1)) * 100
    })) || [];
    
    setProfitAnalysis(analysis);
  };

  const exportCSV = () => {
    toast.info('Exporting report as CSV...');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-500">Analyze your shop's performance and trends.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="best-sellers">Best Sellers</TabsTrigger>
          <TabsTrigger value="slow-movers">Slow-Moving</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg border shadow-sm">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="from">From Date</Label>
            <Input 
              id="from" 
              type="date" 
              value={dateRange.from} 
              onChange={e => setDateRange({...dateRange, from: e.target.value})} 
            />
          </div>
          <div className="grid gap-2 flex-1">
            <Label htmlFor="to">To Date</Label>
            <Input 
              id="to" 
              type="date" 
              value={dateRange.to} 
              onChange={e => setDateRange({...dateRange, to: e.target.value})} 
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" />
            Apply Filters
          </Button>
        </div>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(salesReport.reduce((sum, inv) => sum + inv.grand_total, 0))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesReport.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(salesReport.reduce((sum, inv) => sum + inv.grand_total, 0) / (salesReport.length || 1))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
                  ) : salesReport.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                      <TableCell>{new Date(inv.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell>{inv.customer_name}</TableCell>
                      <TableCell className="uppercase text-xs font-bold">{inv.payment_method}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(inv.grand_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-sellers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bestSellers.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {bestSellers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Quantity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bestSellers.slice(0, 5).sort((a, b) => b.quantity - a.quantity)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {bestSellers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="slow-movers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slow-Moving Items</CardTitle>
              <CardDescription>Items with stock but potentially low turnover.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Stock Value (Cost)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slowMovers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.sku}</div>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right">{p.current_stock}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(p.current_stock * p.cost_price)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600">Mark for Clearance</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Margin Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">MRP</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Profit / Unit</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitAnalysis.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.mrp)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(p.cost_price)}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">{formatCurrency(p.profit)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={cn(
                          p.margin > 20 ? "border-green-200 text-green-700 bg-green-50" : 
                          p.margin > 10 ? "border-yellow-200 text-yellow-700 bg-yellow-50" : 
                          "border-red-200 text-red-700 bg-red-50"
                        )}>
                          {p.margin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
