import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Package,
  AlertCircle
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';
import { Product } from '@/types';
import { formatCurrency, calculateProfit, getProfitColor, cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = ['Electronics', 'Clothing', 'Groceries', 'Cosmetics', 'Stationery', 'Other'];
const TAX_RATES = [0, 5, 12, 18, 28];
const UNITS = ['Piece', 'Kg', 'Liter', 'Box', 'Packet'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    brand: '',
    category: 'Other',
    mrp: 0,
    cost_price: 0,
    current_stock: 0,
    reorder_level: 10,
    tax_rate: 18,
    unit: 'Piece',
    is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await storage.getProducts();
      setProducts(data || []);
    } catch (error: any) {
      toast.error('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await storage.saveProduct({ ...editingProduct, ...formData } as Product);
        toast.success('Product updated successfully');
      } else {
        await storage.saveProduct(formData as Product);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error('Error saving product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await storage.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error('Error deleting product: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      brand: '',
      category: 'Other',
      mrp: 0,
      cost_price: 0,
      current_stock: 0,
      reorder_level: 10,
      tax_rate: 18,
      unit: 'Piece',
      is_active: true
    });
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.barcode && p.barcode.includes(searchQuery));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.current_stock <= p.reorder_level && p.current_stock > 0;
    else if (stockFilter === 'out') matchesStock = p.current_stock === 0;
    else if (stockFilter === 'in') matchesStock = p.current_stock > p.reorder_level;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockBadge = (product: Product) => {
    if (product.current_stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (product.current_stock <= product.reorder_level) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>;
    return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500">Manage your inventory and stock levels.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                Fill in the details below to {editingProduct ? 'update' : 'create'} a product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveProduct} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name*</Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU / Code*</Label>
                  <Input 
                    id="sku" 
                    required 
                    value={formData.sku} 
                    onChange={e => setFormData({...formData, sku: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input 
                    id="brand" 
                    value={formData.brand || ''} 
                    onChange={e => setFormData({...formData, brand: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={v => setFormData({...formData, category: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (Selling Price)*</Label>
                  <Input 
                    id="mrp" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.mrp} 
                    onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price*</Label>
                  <Input 
                    id="cost" 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.cost_price} 
                    onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Current Stock*</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    required 
                    value={formData.current_stock} 
                    onChange={e => setFormData({...formData, current_stock: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorder">Reorder Level*</Label>
                  <Input 
                    id="reorder" 
                    type="number" 
                    required 
                    value={formData.reorder_level} 
                    onChange={e => setFormData({...formData, reorder_level: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax Rate (%)*</Label>
                  <Select 
                    value={formData.tax_rate?.toString()} 
                    onValueChange={v => setFormData({...formData, tax_rate: parseInt(v)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_RATES.map(r => <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit*</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={v => setFormData({...formData, unit: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Estimated Profit Margin</p>
                  <p className={cn("text-xl font-bold", getProfitColor(calculateProfit(formData.mrp || 0, formData.cost_price || 0)))}>
                    {calculateProfit(formData.mrp || 0, formData.cost_price || 0).toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Profit per Unit</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency((formData.mrp || 0) - (formData.cost_price || 0))}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by name, SKU, or barcode..." 
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[150px]">
              <Package className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">MRP</TableHead>
              <TableHead className="text-right">Profit %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">Loading products...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">No products found.</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.brand}</div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    {product.current_stock} {product.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(product.mrp)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-medium", getProfitColor(calculateProfit(product.mrp, product.cost_price)))}>
                      {calculateProfit(product.mrp, product.cost_price).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{getStockBadge(product)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingProduct(product);
                          setFormData(product);
                          setIsModalOpen(true);
                        }}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
