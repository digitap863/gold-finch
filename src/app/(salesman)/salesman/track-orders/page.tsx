"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Edit, Eye, Package, Search } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from "sonner";

interface Order {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
  expectedDeliveryDate?: string;
  karatage?: string;
  weight?: number;
  colour?: string;
  name?: string;
  size?: { type?: 'plastic' | 'metal'; value?: string };
  stone?: boolean;
  enamel?: boolean;
  matte?: boolean;
  rodium?: boolean;
  status: 'confirmed' | 'order_view_and_accepted' | 'cad_completed' | 'production_floor' | 'finished' | 'dispatched' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  catalogId?: {
    _id: string;
    title: string;
    images: string[];
  };
}

const EDIT_WINDOW_HOURS = 48;

const TrackOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/salesman/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const viewOrderDetails = (orderId: string) => {
    router.push(`/salesman/track-orders/${orderId}`);
  };

  const editOrder = (orderId: string) => {
    router.push(`/salesman/edit-order/${orderId}`);
  };

  // Check if order is within 48-hour edit window
  const isWithinEditWindow = (createdAt: string): boolean => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= EDIT_WINDOW_HOURS;
  };

  // Check if order status allows editing
  const isEditableStatus = (status: string): boolean => {
    return ['confirmed', 'order_view_and_accepted'].includes(status);
  };

  // Get remaining edit time
  const getRemainingEditTime = (createdAt: string): string => {
    const orderDate = new Date(createdAt);
    const deadline = new Date(orderDate.getTime() + EDIT_WINDOW_HOURS * 60 * 60 * 1000);
    const now = new Date();
    const remainingMs = deadline.getTime() - now.getTime();
    
    if (remainingMs <= 0) return 'Expired';
    
    const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMins}m left`;
    }
    return `${remainingMins}m left`;
  };

  // Determine if edit button should be shown and its state
  const getEditButtonState = (order: Order): { canEdit: boolean; reason: string } => {
    if (!isEditableStatus(order.status)) {
      return { canEdit: false, reason: 'Order has been processed and cannot be edited' };
    }
    if (!isWithinEditWindow(order.createdAt)) {
      return { canEdit: false, reason: 'Editing period expired (48 hours)' };
    }
    return { canEdit: true, reason: getRemainingEditTime(order.createdAt) };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'order_view_and_accepted': return 'bg-blue-100 text-blue-800';
      case 'cad_completed': return 'bg-purple-100 text-purple-800';
      case 'production_floor': return 'bg-orange-100 text-orange-800';
      case 'finished': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6 mt-10">
          <h1 className="text-2xl md:text-3xl font-bold">Track Orders</h1>
          <p className="text-muted-foreground">Monitor your order status and progress</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="order_view_and_accepted">Order View & Accepted</SelectItem>
              <SelectItem value="cad_completed">CAD Completed</SelectItem>
              <SelectItem value="production_floor">Production Floor</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'No orders created yet'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Expected</TableHead>
                  <TableHead className="hidden lg:table-cell">Catalog</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const editState = getEditButtonState(order);
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.orderCode}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(order.createdAt)}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{order.catalogId?.title ?? '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Button
                                  variant={editState.canEdit ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => editOrder(order._id)}
                                  disabled={!editState.canEdit}
                                  className={editState.canEdit ? "bg-blue-600 hover:bg-blue-700" : "opacity-50"}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {editState.canEdit ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{editState.reason}</span>
                                </div>
                              ) : (
                                <span>{editState.reason}</span>
                              )}
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* View Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewOrderDetails(order._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

      </div>
    </TooltipProvider>
  );
};

export default TrackOrdersPage;
 