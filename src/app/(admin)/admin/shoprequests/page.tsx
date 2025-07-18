"use client"
import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from "next/link";
import { Button } from '@/components/ui/button';

async function fetchShopRequests() {
  const res = await fetch('/api/admin/shop-requests');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

const ShopRequests = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shop-requests'],
    queryFn: fetchShopRequests,
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Shop Verification Requests</h2>
      {isLoading && <div>Loading...</div>}
      {isError && <div className="text-destructive">Failed to load shop requests.</div>}
      {data && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop Name</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Request Status</TableHead>
              <TableHead>Shop Verified</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.shops.map((shop: any) => (
              <TableRow key={shop._id}>
                <TableCell>{shop.shopName}</TableCell>
                <TableCell>{shop.gstNumber || '-'}</TableCell>
                <TableCell>{shop.address}</TableCell>
                <TableCell>{shop.ownerId?.name || '-'}</TableCell>
                <TableCell>{shop.ownerId?.email || '-'}</TableCell>
                <TableCell>{shop.ownerId?.mobile || '-'}</TableCell>
                <TableCell>
                  <Badge variant={shop.ownerId?.requestStatus === 'pending' ? 'secondary' : shop.ownerId?.requestStatus === 'approved' ? 'default' : 'destructive'}>
                    {shop.ownerId?.requestStatus || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={shop.isVerified ? 'default' : 'secondary'}>
                    {shop.isVerified ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={shop.isActive ? 'default' : 'destructive'}>
                    {shop.isActive ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(shop.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link href={`/admin/shoprequests/${shop._id}`}>
                    <Button asChild size="sm" variant="outline">
                      <span>View</span>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default ShopRequests