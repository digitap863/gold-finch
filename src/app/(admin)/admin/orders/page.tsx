"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface AdminOrderItem {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
    status: 'confirmed' | 'order_view_and_accepted' | 'cad_completed' | 'production_floor' | 'finished' | 'dispatched';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expectedDeliveryDate?: string;
  catalogId?: { _id: string; title: string } | null;
  salesmanId?: { _id: string; name?: string; email?: string; mobile?: string } | null;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const navigateToOrder = (orderId: string) => {
    window.location.href = `/admin/orders/${orderId}`;
  };

  const updateOrderField = async (orderId: string, payload: Partial<Pick<AdminOrderItem, 'status' | 'priority' | 'expectedDeliveryDate'>>) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update order');
      const { order } = await res.json();
      setOrders(prev => prev.map(o => (o._id === order._id ? order : o)));
      toast.success('Order updated');
    } catch {
      console.error('Update error');
      toast.error('Failed to update order');
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
    <div className="space-y-6 p-5">
      <div className="mb-6 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">All orders across salesmen</p>
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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Order Date:</label>
            <div className="flex gap-2 items-center">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[140px]"
                placeholder="From"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[140px]"
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
                className="text-muted-foreground hover:text-foreground"
              >
                Clear dates
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Select onValueChange={(v) => bulkUpdateStatus(v as AdminOrderItem['status'])}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={`Bulk update (${selectedIds.length})`} />
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

      <Table>
        <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onCheckedChange={(c) => toggleAll(Boolean(c))}
                />
              </TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Salesman</TableHead>
            <TableHead>Catalog</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Expected</TableHead>
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
                <TableCell className="font-medium">{o.orderCode}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell>
                  <Select
                    value={o.status}
                    onValueChange={(value) => updateOrderField(o._id, { status: value as AdminOrderItem['status'] })}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
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
                </TableCell>
                <TableCell>
                  <Select
                    value={o.priority}
                    onValueChange={(value) => updateOrderField(o._id, { priority: value as AdminOrderItem['priority'] })}
                  >
                    <SelectTrigger className="w-[140px]">
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
                <TableCell>{o.salesmanId?.name || o.salesmanId?.email || o.salesmanId?.mobile || '-'}</TableCell>
                <TableCell>{o.catalogId?.title || '-'}</TableCell>
                <TableCell>{formatDate(o.createdAt)}</TableCell>
                <TableCell>
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-sm"
                    value={o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toISOString().slice(0,10) : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrderField(o._id, { expectedDeliveryDate: e.target.value })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => navigateToOrder(o._id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminOrdersPage;
