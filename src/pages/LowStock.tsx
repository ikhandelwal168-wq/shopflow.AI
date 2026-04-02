import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ShoppingCart, 
  Mail, 
  ArrowRight,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function LowStock() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const data = await storage.getProducts();
      const filtered = data?.filter(p => p.is_active && p.current_stock <= p.reorder_level) || [];
      setLowStockProducts(filtered);
    } catch (error: any) {
      toast.error('Error fetching low stock items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = (product: Product) => {
    toast.info(`Purchase Order functionality for ${product.name} coming soon!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-gray-500">Products that have reached or dropped below reorder levels.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Report
          </Button>
          <Button className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Bulk Reorder
          </Button>
        </div>
      </div>

      {lowStockProducts.length > 0 ? (
        <Card className="border-red-200 bg-red-50/10">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600 w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-red-900">Critical Attention Required</CardTitle>
              <CardDescription className="text-red-700">
                There are {lowStockProducts.length} items that need immediate restocking to avoid out-of-stock situations.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      ) : !loading && (
        <Card className="border-green-200 bg-green-50/10">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Package className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-green-900">All Stock Levels Healthy</CardTitle>
              <CardDescription className="text-green-700">
                No products are currently below their reorder levels.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Reorder Level</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Loading low stock items...</TableCell>
              </TableRow>
            ) : lowStockProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">No low stock items found.</TableCell>
              </TableRow>
            ) : (
              lowStockProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sku}</div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {product.current_stock} {product.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">{product.reorder_level} {product.unit}</TableCell>
                  <TableCell>{product.supplier_name || 'N/A'}</TableCell>
                  <TableCell>
                    {product.current_stock === 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleCreatePO(product)}>
                      Create PO
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
