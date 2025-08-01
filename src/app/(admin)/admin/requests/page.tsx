"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Eye, Check, X, Clock } from "lucide-react";

interface SalesmanRequest {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  shopName: string;
  shopAddress: string;
  shopMobile: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function AdminRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<SalesmanRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch salesman requests
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["salesman-requests"],
    queryFn: async (): Promise<SalesmanRequest[]> => {
      const res = await fetch("/api/admin/salesman-requests");
      if (!res.ok) {
        throw new Error("Failed to fetch requests");
      }
      return res.json();
    },
  });

  // Approve salesman request
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/admin/salesman-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!res.ok) {
        throw new Error("Failed to approve request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request approved successfully");
      queryClient.invalidateQueries({ queryKey: ["salesman-requests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reject salesman request
  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/admin/salesman-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!res.ok) {
        throw new Error("Failed to reject request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Request rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["salesman-requests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1"><Check className="w-3 h-3" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="w-3 h-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading requests</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Salesman Requests</h1>
        <p className="text-muted-foreground">
          Review and manage salesman registration requests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and approve or reject salesman registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium">{request.name}</TableCell>
                    <TableCell>{request.mobile}</TableCell>
                    <TableCell>{request.shopName}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={isViewDialogOpen && selectedRequest?._id === request._id} onOpenChange={(open: boolean) => {
                          if (open) {
                            setSelectedRequest(request);
                            setIsViewDialogOpen(true);
                          } else {
                            setIsViewDialogOpen(false);
                            setSelectedRequest(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Salesman Details</DialogTitle>
                              <DialogDescription>
                                Complete information about the salesman request
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Personal Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Name:</span> {request.name}</div>
                                  <div><span className="font-medium">Mobile:</span> {request.mobile}</div>
                                  {request.email && <div><span className="font-medium">Email:</span> {request.email}</div>}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Shop Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Shop Name:</span> {request.shopName}</div>
                                  <div><span className="font-medium">Shop Mobile:</span> {request.shopMobile}</div>
                                  <div><span className="font-medium">Shop Address:</span> {request.shopAddress}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Request Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><span className="font-medium">Status:</span> {getStatusBadge(request.status)}</div>
                                  <div><span className="font-medium">Requested On:</span> {formatDate(request.createdAt)}</div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => approveMutation.mutate(request._id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectMutation.mutate(request._id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No salesman requests found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
