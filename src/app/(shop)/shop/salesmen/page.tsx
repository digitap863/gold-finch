import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

export default function SalesmanManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salesman Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>9123456789</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>
                <Button size="sm" className="mr-2" variant="destructive">Block</Button>
                <Button size="sm" variant="secondary">Remove</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 