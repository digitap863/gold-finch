"use client";

// Salesman Notifications Dashboard
// This page displays order status notifications exclusively for salesmen
// Admins do not use this notification system

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Bell, Check, CheckCircle, Info, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  orderId?: {
    orderCode: string;
    productName: string;
    customerName: string;
    status: string;
  } | null;
  orderCode?: string;
  metadata?: {
    oldStatus?: string;
    newStatus?: string;
    customerName?: string;
    cancelReason?: string;
  };
}

function getIcon(type: string) {
  if (type === "success") return <CheckCircle className="text-green-500" size={20} />;
  if (type === "error") return <XCircle className="text-red-500" size={20} />;
  if (type === "warning") return <AlertTriangle className="text-yellow-500" size={20} />;
  if (type === "info") return <Info className="text-blue-500" size={20} />;
  return <Bell size={20} />;
}

function getBadge(type: string) {
  if (type === "success") return <Badge className="bg-green-100 text-green-800">Success</Badge>;
  if (type === "error") return <Badge variant="destructive">Error</Badge>;
  if (type === "warning") return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
  if (type === "info") return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
  return <Badge>Unknown</Badge>;
}

export default function SalesmanNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState("false"); // Default to show unread first
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterRead !== "all") params.set("isRead", filterRead);
      params.set("page", page.toString());
      params.set("limit", "10");

      const response = await fetch(`/api/salesman/notifications?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterRead, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset to first page when search term changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch("/api/salesman/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "markAsRead",
          notificationIds
        })
      });

      if (!response.ok) throw new Error("Failed to mark as read");

      // Update local state
      setNotifications(prev => prev.map(n => 
        notificationIds.includes(n._id) ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
      toast.success("Notifications marked as read");
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/salesman/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "markAllAsRead"
        })
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.length === notifications.length ? [] : notifications.map(n => n._id)
    );
  };

  const markSelectedAsRead = () => {
    if (selectedIds.length === 0) return;
    markAsRead(selectedIds);
    setSelectedIds([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? "Just now" : `${diffMinutes} min ago`;
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredNotifications = notifications
    .filter(n =>
      searchTerm === "" || 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.orderCode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by read status first (unread first), then by creation date (newest first)
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1; // Unread notifications come first
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6 md:mt-10 mt-16">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your order status
              {filterRead === "false" && " • Showing unread first"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Unread</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={selectedIds.length === notifications.length && notifications.length > 0}
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select all"}
              </span>
            </div>
            
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <Button variant="outline" size="sm" onClick={markSelectedAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark Selected as Read
                </Button>
              )}
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-2" />
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="text-primary" size={20} />
          <CardTitle className="text-lg md:text-xl">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You&apos;re all caught up!</p>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {filteredNotifications.map((n) => (
                  <li key={n._id} className={`flex items-start gap-3 p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                    n.isRead ? 'bg-muted/20' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <Checkbox 
                      checked={selectedIds.includes(n._id)}
                      onCheckedChange={() => toggleSelection(n._id)}
                      className="mt-1"
                    />
                    <span className="mt-1 flex-shrink-0">{getIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold text-sm sm:text-base ${
                              n.isRead ? 'text-muted-foreground' : 'text-foreground'
                            }`}>
                              {n.title}
                            </h4>
                            {!n.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className={`text-sm ${
                            n.isRead ? 'text-muted-foreground' : 'text-foreground'
                          }`}>
                            {n.message}
                          </p>
                          {n.orderId && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Order: {n.orderId.orderCode} • {n.orderId.customerName} • Status: {n.orderId.status.replace('_', ' ')}
                            </div>
                          )}
                          {n.metadata?.cancelReason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                              <div className="font-medium text-red-800 mb-1">Cancellation Reason:</div>
                              <div className="text-red-700">{n.metadata.cancelReason}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          {getBadge(n.type)}
                          <div className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 