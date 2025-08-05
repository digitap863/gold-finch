"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, Ban, CheckCircle, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Salesman {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  shopName: string;
  shopAddress: string;
  shopMobile: string;
  isBlocked: boolean;
  isApproved: boolean;
  createdAt: string;
  lastLogin?: string;
}

const SalesmenPage = () => {
  const [salesmen, setSalesmen] = useState<Salesman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSalesman, setSelectedSalesman] = useState<Salesman | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSalesmen();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchSalesmen = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/salesmen');
      if (!response.ok) {
        throw new Error('Failed to fetch salesmen');
      }
      const data = await response.json();
      setSalesmen(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching salesmen:', error);
      toast.error('Failed to load salesmen');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (salesmanId: string, isBlocked: boolean) => {
    try {
      const response = await fetch(`/api/admin/salesmen/${salesmanId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update salesman status');
      }

      toast.success(isBlocked ? 'Salesman unblocked successfully' : 'Salesman blocked successfully');
      fetchSalesmen(); // Refresh the list
    } catch (error) {
      console.error('Error updating salesman status:', error);
      toast.error('Failed to update salesman status');
    }
  };

  const filteredSalesmen = salesmen.filter(salesman => {
    const matchesSearch = 
      salesman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salesman.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salesman.mobile.includes(searchTerm) ||
      salesman.shopName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !salesman.isBlocked) ||
      (statusFilter === 'blocked' && salesman.isBlocked);

    return matchesSearch && matchesStatus;
  });

  const paginatedSalesmen = filteredSalesmen.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (salesman: Salesman) => {
    setSelectedSalesman(salesman);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading salesmen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Salesmen Management</h1>
        <p className="text-muted-foreground">Manage approved salesmen and their accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Salesmen</p>
                <p className="text-2xl font-bold">{salesmen.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {salesmen.filter(s => !s.isBlocked).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-red-600">
                  {salesmen.filter(s => s.isBlocked).length}
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {salesmen.filter(s => {
                    const createdAt = new Date(s.createdAt);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && 
                           createdAt.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, mobile, or shop name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salesmen</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="blocked">Blocked Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Salesmen Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salesmen List</CardTitle>
          <CardDescription>
            Showing {paginatedSalesmen.length} of {filteredSalesmen.length} salesmen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSalesmen.map((salesman) => (
                  <TableRow key={salesman._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{salesman.name}</div>
                        <div className="text-sm text-muted-foreground">{salesman.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{salesman.mobile}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{salesman.shopName}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {salesman.shopAddress}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={salesman.isBlocked ? "destructive" : "default"}
                        className={salesman.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
                      >
                        {salesman.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(salesman.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(salesman)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleBlockUnblock(salesman._id, salesman.isBlocked)}
                            className={salesman.isBlocked ? "text-green-600" : "text-red-600"}
                          >
                            {salesman.isBlocked ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Block
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salesman Detail Modal */}
      {selectedSalesman && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSalesman.name}</h2>
                  <p className="text-muted-foreground">{selectedSalesman.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSalesman(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedSalesman.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <p className="font-medium">{selectedSalesman.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Mobile:</span>
                      <p className="font-medium">{selectedSalesman.mobile}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Shop Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Shop Name:</span>
                      <p className="font-medium">{selectedSalesman.shopName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <p className="font-medium">{selectedSalesman.shopAddress}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Mobile:</span>
                      <p className="font-medium">{selectedSalesman.shopMobile}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={selectedSalesman.isBlocked ? "destructive" : "default"}
                      className="ml-2"
                    >
                      {selectedSalesman.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Joined:</span>
                    <p className="font-medium">
                      {new Date(selectedSalesman.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant={selectedSalesman.isBlocked ? "default" : "destructive"}
                  onClick={() => {
                    handleBlockUnblock(selectedSalesman._id, selectedSalesman.isBlocked);
                    setSelectedSalesman(null);
                  }}
                >
                  {selectedSalesman.isBlocked ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unblock Salesman
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Block Salesman
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSalesman(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesmenPage;
