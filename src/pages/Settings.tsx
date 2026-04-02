import React, { useState } from 'react';
import { 
  Store, 
  Shield, 
  Bell, 
  Database, 
  UserPlus,
  Save,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function Settings() {
  const [shopDetails, setShopDetails] = useState({
    name: 'My Retail Shop',
    address: '123 Main St, City, State, 400001',
    gstin: '27AAAAA0000A1Z5',
    phone: '+91 9876543210',
    email: 'contact@shop.com'
  });

  const handleSaveShop = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Shop details updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500">Configure your shop profile and application preferences.</p>
      </div>

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="shop">Shop Profile</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="tax">Tax & Billing</TabsTrigger>
          <TabsTrigger value="backup">Backup & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Shop Details
              </CardTitle>
              <CardDescription>This information will appear on your GST invoices.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveShop}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shop-name">Shop Name</Label>
                    <Input 
                      id="shop-name" 
                      value={shopDetails.name} 
                      onChange={e => setShopDetails({...shopDetails, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shop-gst">GSTIN</Label>
                    <Input 
                      id="shop-gst" 
                      value={shopDetails.gstin} 
                      onChange={e => setShopDetails({...shopDetails, gstin: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shop-phone">Phone Number</Label>
                    <Input 
                      id="shop-phone" 
                      value={shopDetails.phone} 
                      onChange={e => setShopDetails({...shopDetails, phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shop-email">Email Address</Label>
                    <Input 
                      id="shop-email" 
                      type="email" 
                      value={shopDetails.email} 
                      onChange={e => setShopDetails({...shopDetails, email: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shop-address">Complete Address</Label>
                  <Input 
                    id="shop-address" 
                    value={shopDetails.address} 
                    onChange={e => setShopDetails({...shopDetails, address: e.target.value})} 
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage staff accounts and permissions.</CardDescription>
              </div>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Admin User</div>
                      <div className="text-xs text-gray-500">admin@shop.com</div>
                    </TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>Owner</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="font-medium">Staff Member</div>
                      <div className="text-xs text-gray-500">staff@shop.com</div>
                    </TableCell>
                    <TableCell>Staff</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Billing Configuration
              </CardTitle>
              <CardDescription>Set default tax rates and invoice numbering.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default GST Rate</Label>
                  <Select defaultValue="18">
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% (Exempt)</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input defaultValue="INV-" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Billing Config
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export your data or manage backups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Export All Data</p>
                  <p className="text-sm text-blue-700">Download all products, invoices, and customers as CSV.</p>
                </div>
                <Button variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50">
                  Export Now
                </Button>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-yellow-900">Clear Transaction History</p>
                  <p className="text-sm text-yellow-700">Delete all invoices and reset numbering. (Irreversible)</p>
                </div>
                <Button variant="destructive">
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
