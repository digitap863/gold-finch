import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SalesmanDashboardHome() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders Placed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">12</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Orders Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">3</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Orders Delivered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">7</div>
        </CardContent>
      </Card>
    </div>
  );
}