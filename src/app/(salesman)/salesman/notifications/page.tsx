import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, Clock } from "lucide-react";

const notifications = [
  {
    id: 1,
    message: "Order #ORD001 is ready for delivery.",
    type: "success",
    time: "2024-05-20 10:30",
  },
  {
    id: 2,
    message: "Your order #ORD002 was rejected by manufacturer.",
    type: "error",
    time: "2024-05-19 16:45",
  },
  {
    id: 3,
    message: "Order #ORD003 is delayed.",
    type: "warning",
    time: "2024-05-18 14:30",
  },
];

function getIcon(type: string) {
  if (type === "success") return <CheckCircle className="text-green-500" size={20} />;
  if (type === "error") return <XCircle className="text-red-500" size={20} />;
  if (type === "warning") return <Clock className="text-yellow-500" size={20} />;
  return <Bell size={20} />;
}

function getBadge(type: string) {
  if (type === "success") return <Badge variant="default">Ready</Badge>;
  if (type === "error") return <Badge variant="destructive">Rejected</Badge>;
  if (type === "warning") return <Badge variant="secondary">Delayed</Badge>;
  return <Badge>Info</Badge>;
}

export default function SalesmanNotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your order status</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="text-primary" size={20} />
          <CardTitle className="text-lg md:text-xl">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="mt-1 flex-shrink-0">{getIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-medium text-foreground text-sm sm:text-base">{n.message}</span>
                    <div className="flex-shrink-0">{getBadge(n.type)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                </div>
              </li>
            ))}
          </ul>
          
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 