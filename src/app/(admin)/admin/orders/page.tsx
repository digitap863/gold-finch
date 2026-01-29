"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminOrderItem {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
    status: 'confirmed' | 'order_view_and_accepted' | 'cad_completed' | 'production_floor' | 'finished' | 'dispatched' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expectedDeliveryDate?: string;
  catalogId?: { _id: string; title: string } | null;
  salesmanId?: { _id: string; name?: string; email?: string; mobile?: string } | null;
  cancelReason?: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, dateFrom, dateTo]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (searchTerm) params.set("q", searchTerm);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? orders.map(o => o._id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id));
  };

  const bulkUpdateStatus = async (status: AdminOrderItem['status']) => {
    try {
      if (selectedIds.length === 0) return;
      
      // If cancelling, show modal for cancel reason
      if (status === 'cancelled') {
        setOrderToCancel('bulk'); // Special identifier for bulk cancellation
        setCancelReason("");
        setCancelModalOpen(true);
        return;
      }
      
      const res = await fetch('/api/admin/orders/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setOrders(prev => prev.map(o => selectedIds.includes(o._id) ? { ...o, status } : o));
      setSelectedIds([]);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const navigateToOrder = (orderCode: string) => {
    window.location.href = `/admin/orders/${orderCode}`;
  };

  const updateOrderField = async (orderId: string, payload: Partial<Pick<AdminOrderItem, 'status' | 'priority' | 'expectedDeliveryDate' | 'cancelReason'>>) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update order');
      }
      const { order } = await res.json();
      setOrders(prev => prev.map(o => (o._id === order._id ? order : o)));
      toast.success('Order updated');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order');
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    if (!orderToCancel) return;

    try {
      if (orderToCancel === 'bulk') {
        // Handle bulk cancellation
        const res = await fetch('/api/admin/orders/bulk-update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ids: selectedIds, 
            status: 'cancelled',
            cancelReason: cancelReason.trim()
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to update orders');
        }
        setOrders(prev => prev.map(o => selectedIds.includes(o._id) ? { ...o, status: 'cancelled', cancelReason: cancelReason.trim() } : o));
        setSelectedIds([]);
        toast.success('Orders cancelled successfully');
      } else {
        // Handle single order cancellation
        await updateOrderField(orderToCancel, { 
          status: 'cancelled', 
          cancelReason: cancelReason.trim() 
        });
      }
      
      setCancelModalOpen(false);
      setCancelReason("");
      setOrderToCancel(null);
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel order(s)');
    }
  };

  // Status color badges are not used in admin table as we use a dropdown

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 md:p-10 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {/* Search and Status Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by product or customer..."
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

        {/* Date Filter Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-muted/30 p-3 sm:p-4 rounded-xl border">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap uppercase tracking-wider">Filter by Date</label>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full sm:w-[140px] text-xs sm:text-sm"
                placeholder="From"
              />
              <span className="text-muted-foreground text-xs font-bold px-1">TO</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full sm:w-[140px] text-xs sm:text-sm"
                placeholder="To"
              />
            </div>
            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs hover:text-destructive shrink-0"
              >
                Clear Dates
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 w-full lg:w-auto lg:ml-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-muted-foreground/10">
              <Select onValueChange={(v) => bulkUpdateStatus(v as AdminOrderItem['status'])}>
                <SelectTrigger className="w-full sm:w-[220px] bg-primary text-primary-foreground h-9">
                  <SelectValue placeholder={`Bulk Update (${selectedIds.length})`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order_view_and_accepted">Order View & Accepted</SelectItem>
                  <SelectItem value="cad_completed">CAD Completed</SelectItem>
                  <SelectItem value="production_floor">Production Floor</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onCheckedChange={(c) => toggleAll(Boolean(c))}
                />
              </TableHead>
            <TableHead className="min-w-[100px]">Order</TableHead>
            <TableHead className="min-w-[120px]">Customer</TableHead>
            <TableHead className="min-w-[200px]">Status</TableHead>
            <TableHead className="min-w-[140px] hidden sm:table-cell">Priority</TableHead>
            <TableHead className="hidden lg:table-cell">Salesman</TableHead>
            <TableHead className="hidden xl:table-cell">Catalog</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead className="hidden lg:table-cell">Expected</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Loading orders…</TableCell>
            </TableRow>
          ) : orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No orders found</TableCell>
            </TableRow>
          ) : (
            orders.map((o) => (
              <TableRow key={o._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(o._id)}
                    onCheckedChange={(c) => toggleOne(o._id, Boolean(c))}
                  />
                </TableCell>
                <TableCell className="font-medium text-xs sm:text-sm">{o.orderCode}</TableCell>
                <TableCell className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{o.customerName}</TableCell>
                <TableCell>
                  <Select
                    value={o.status}
                    onValueChange={(value) => {
                      if (value === 'cancelled') {
                        handleCancelOrder(o._id);
                      } else {
                        updateOrderField(o._id, { status: value as AdminOrderItem['status'] });
                      }
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="order_view_and_accepted">Order View & Accepted</SelectItem>
                      <SelectItem value="cad_completed">CAD Completed</SelectItem>
                      <SelectItem value="production_floor">Production Floor</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="dispatched">Dispatched</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Select
                    value={o.priority}
                    onValueChange={(value) => updateOrderField(o._id, { priority: value as AdminOrderItem['priority'] })}
                  >
                    <SelectTrigger className="w-full sm:w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{o.salesmanId?.name || o.salesmanId?.email || o.salesmanId?.mobile || '-'}</TableCell>
                <TableCell className="hidden xl:table-cell text-xs sm:text-sm">{o.catalogId?.title || '-'}</TableCell>
                <TableCell className="hidden md:table-cell text-xs sm:text-sm">{formatDate(o.createdAt)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-xs"
                    value={o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toISOString().slice(0,10) : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrderField(o._id, { expectedDeliveryDate: e.target.value })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => navigateToOrder(o.orderCode)} className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:py-2">
                    <Eye className="h-4 w-4 sm:mr-1.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>

      {/* Cancel Order Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {orderToCancel === 'bulk' ? `Cancel ${selectedIds.length} Orders` : 'Cancel Order'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">
                Reason for cancellation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Please provide a reason for cancelling this order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelModalOpen(false);
                setCancelReason("");
                setOrderToCancel(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCancelOrder}
              disabled={!cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrdersPage;
