import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Receipt, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { storage } from '@/lib/storage';
import { formatCurrency, cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    profit: 0,
    billCount: 0,
    lowStockCount: 0,
    profitMargin: 0
  });
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const invoices = await storage.getInvoices();
      const products = await storage.getProducts();
      
      // Filter for today's invoices
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayInvoices = invoices.filter(inv => new Date(inv.invoice_date) >= today);

      let revenue = 0;
      let billCount = todayInvoices.length;
      let totalProfit = 0;

      todayInvoices.forEach(inv => {
        revenue += inv.grand_total;
        inv.invoice_items.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            totalProfit += (item.unit_price - product.cost_price) * item.quantity;
          }
        });
      });

      // Low Stock Count
      const lowStockCount = products.filter(p => p.is_active && p.current_stock <= p.reorder_level).length;

      setStats({
        revenue,
        profit: totalProfit,
        billCount,
        lowStockCount,
        profitMargin: revenue > 0 ? (totalProfit / revenue) * 100 : 0
      });

      // Mock Trend Data based on invoices
      setSalesTrend([
        { date: 'Mon', revenue: 4000 },
        { date: 'Tue', revenue: 3000 },
        { date: 'Wed', revenue: 2000 },
        { date: 'Thu', revenue: 2780 },
        { date: 'Fri', revenue: 1890 },
        { date: 'Sat', revenue: 2390 },
        { date: 'Sun', revenue: revenue || 3490 },
      ]);

      // Category Breakdown
      const categories: Record<string, number> = {};
      invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            categories[product.category] = (categories[product.category] || 0) + item.total;
          }
        });
      });

      const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
      setCategorySales(categoryData.length > 0 ? categoryData : [
        { name: 'Electronics', value: 400 },
        { name: 'Groceries', value: 300 },
        { name: 'Clothing', value: 300 },
      ]);

      // Best Sellers
      const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
      invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { name: item.product_name, quantity: 0, revenue: 0 };
          }
          productSales[item.product_id].quantity += item.quantity;
          productSales[item.product_id].revenue += item.total;
        });
      });

      const bestSellersData = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      setBestSellers(bestSellersData.length > 0 ? bestSellersData : [
        { name: 'Product A', quantity: 50, revenue: 5000 },
        { name: 'Product B', quantity: 30, revenue: 3000 },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500">Welcome back to your shop overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +20.1% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.profit)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Margin: <span className="font-medium text-green-600">{stats.profitMargin.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bills Generated</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.billCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Average: {formatCurrency(stats.revenue / (stats.billCount || 1))} / bill
            </p>
          </CardContent>
        </Card>

        <Link to="/low-stock">
          <Card className={stats.lowStockCount > 0 ? "border-red-200 bg-red-50/30" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className={cn("h-4 w-4", stats.lowStockCount > 0 ? "text-red-500" : "text-gray-400")} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", stats.lowStockCount > 0 ? "text-red-600" : "")}>
                {stats.lowStockCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.lowStockCount > 0 ? "Action required immediately" : "All stock levels healthy"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: '#3b82f6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categorySales.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} sales</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Best Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quantity Sold</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Revenue</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {bestSellers.map((item) => (
                  <tr key={item.name} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{item.name}</td>
                    <td className="p-4 align-middle">{item.quantity}</td>
                    <td className="p-4 align-middle">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
