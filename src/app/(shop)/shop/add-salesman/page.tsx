import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddSalesmanPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Salesman</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col md:flex-row gap-4 items-end">
          <input className="border rounded px-3 py-2 w-full md:w-1/3" placeholder="Salesman Name" />
          <input className="border rounded px-3 py-2 w-full md:w-1/3" placeholder="Mobile Number" />
          <Button type="submit">Add Salesman</Button>
        </form>
      </CardContent>
    </Card>
  );
} 