"use client"
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";

async function fetchSalesmanRequests() {
  const res = await fetch("/api/shop/salesman-requests");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function updateSalesmanStatus({ id, action }: { id: string; action: "approve" | "reject" }) {
  const res = await fetch(`/api/shop/salesman-requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export default function SalesmanApprovalPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["salesman-requests"],
    queryFn: fetchSalesmanRequests,
  });

  const mutation = useMutation({
    mutationFn: updateSalesmanStatus,
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["salesman-requests"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salesman Approval Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading...</div>}
        {isError && <div className="text-destructive">Failed to load requests.</div>}
        {data && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>

                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.requests.map((req: {
                _id: string;
                name: string;
                email?: string;
                mobile: string;
                requestStatus: string;
                createdAt?: string;
              }) => (
                <TableRow key={req._id}>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>{req.email || '-'}</TableCell>
                  <TableCell>{req.mobile}</TableCell>
                  <TableCell>{req.requestStatus}</TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      className="mr-2"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: req._id, action: "approve" })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: req._id, action: "reject" })}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 