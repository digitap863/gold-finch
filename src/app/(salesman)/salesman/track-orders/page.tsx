import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, AlertCircle } from "lucide-react";

const orders = [
  {
    id: "ORD001",
    product: "Gold Ring",
    status: "In Production",
    updatedAt: "2024-05-18 14:30",
    priority: "high"
  },
  {
    id: "ORD002", 
    product: "Silver Necklace",
    status: "Completed",
    updatedAt: "2024-05-17 10:15",
    priority: "medium"
  },
  {
    id: "ORD003",
    product: "Diamond Earrings", 
    status: "Pending",
    updatedAt: "2024-05-16 09:45",
    priority: "low"
  }
];

function getStatusIcon(status: string) {
  switch (status) {
    case "Completed":
      return <CheckCircle className="text-green-500" size={16} />;
    case "In Production":
      return <Package className="text-blue-500" size={16} />;
    case "Pending":
      return <Clock className="text-yellow-500" size={16} />;
    default:
      return <AlertCircle className="text-gray-500" size={16} />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Completed":
      return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
    case "In Production":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Production</Badge>;
    case "Pending":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function TrackOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Track Orders</h1>
        <p className="text-muted-foreground">Monitor your order status and progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(order.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base">#{order.id}</h3>
                        <span className="text-muted-foreground text-sm">{order.product}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="text-xs text-muted-foreground">
                          Updated: {order.updatedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {orders.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">Create your first order to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 