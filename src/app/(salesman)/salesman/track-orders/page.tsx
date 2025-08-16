"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Eye, Package } from "lucide-react";

interface Order {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
  expectedDeliveryDate?: string;
  status: 'order_view_and_accepted' | 'cad_completed' | 'production_floor' | 'finished' | 'dispatched' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  catalogId?: {
    _id: string;
    title: string;
    images: string[];
  };
}

const TrackOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

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

  const openOrderModal = async (orderId: string) => {
    try {
      setIsDialogOpen(true);
      setLoadingOrder(true);
      setSelectedOrder(null);
      const response = await fetch(`/api/salesman/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to load order details');
      }
      const data: Order = await response.json();
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
      setIsDialogOpen(false);
    } finally {
      setLoadingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_view_and_accepted': return 'bg-blue-100 text-blue-800';
      case 'cad_completed': return 'bg-purple-100 text-purple-800';
      case 'production_floor': return 'bg-orange-100 text-orange-800';
      case 'finished': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
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
            <SelectItem value="order_view_and_accepted">Order View & Accepted</SelectItem>
            <SelectItem value="cad_completed">CAD Completed</SelectItem>
            <SelectItem value="production_floor">Production Floor</SelectItem>
            <SelectItem value="finished">Finished</SelectItem>
            <SelectItem value="dispatched">Dispatched</SelectItem>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expected</TableHead>
              <TableHead>Catalog</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">{order.orderCode}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getPriorityColor(order.priority)}`}>
                    {order.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}</TableCell>
                <TableCell>{order.catalogId?.title ?? '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOrderModal(order._id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Order Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {loadingOrder ? 'Loading…' : selectedOrder?.productName || 'Order Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder ? `Customer: ${selectedOrder.customerName}` : ''}
            </DialogDescription>
          </DialogHeader>

          {loadingOrder ? (
            <div className="py-10 text-center text-muted-foreground">Fetching order details…</div>
          ) : selectedOrder ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`text-xs ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
                <Badge className={`text-xs ${getPriorityColor(selectedOrder.priority)}`}>
                  {selectedOrder.priority.toUpperCase()}
                </Badge>
              </div>

              {selectedOrder.customizationDetails && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Customization Details</div>
                  <p className="text-sm">{selectedOrder.customizationDetails}</p>
                </div>
              )}

              {selectedOrder.voiceRecording && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Voice Recording</div>
                  <audio controls className="w-full">
                    <source src={selectedOrder.voiceRecording} />
                  </audio>
                </div>
              )}

              {selectedOrder.images && selectedOrder.images.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Images</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedOrder.images.map((img, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={idx} src={img} alt={`Order image ${idx + 1}`} className="w-full h-28 object-cover rounded-md border" />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(selectedOrder.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Expected</div>
                  <div className="font-medium">{selectedOrder.expectedDeliveryDate ? formatDate(selectedOrder.expectedDeliveryDate) : '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Catalog</div>
                  <div className="font-medium">{selectedOrder.catalogId?.title ?? '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Order ID</div>
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded">{selectedOrder.orderCode}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">No order selected</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackOrdersPage; 