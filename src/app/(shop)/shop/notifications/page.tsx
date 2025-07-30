import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Order #ORD123 has been placed.</li>
          <li>Salesman John Doe approved.</li>
          <li>Order #ORD124 is ready for delivery.</li>
        </ul>
      </CardContent>
    </Card>
  );
} 