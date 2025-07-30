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
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Bell className="text-primary" size={24} />
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3">
              <span className="mt-1">{getIcon(n.type)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{n.message}</span>
                  {getBadge(n.type)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 