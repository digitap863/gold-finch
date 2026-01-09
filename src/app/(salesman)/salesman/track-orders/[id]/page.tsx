"use client";

import React, { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Package, Calendar, User, Hash, Image as ImageIcon, Volume2, Settings } from "lucide-react";

interface Order {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
  expectedDeliveryDate?: string;
  karatage?: string;
  weight?: number;
  colour?: string;
  name?: string;
  size?: { type?: 'plastic' | 'metal'; value?: string };
  stone?: boolean;
  enamel?: boolean;
  matte?: boolean;
  rodium?: boolean;
  status: 'order_view_and_accepted' | 'cad_completed' | 'production_floor' | 'finished' | 'dispatched' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  catalogId?: {
    _id: string;
    title: string;
    images: string[];
  };
}

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const OrderDetailPage = ({ params }: OrderDetailPageProps) => {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/salesman/orders/${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error('Failed to load order details');
      }
      const data: Order = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
      router.push('/salesman/track-orders');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'order_view_and_accepted': return 'bg-blue-100 text-blue-800';
      case 'cad_completed': return 'bg-purple-100 text-purple-800';
      case 'production_floor': return 'bg-orange-100 text-orange-800';
      case 'finished': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order not found</h3>
          <p className="text-muted-foreground mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/salesman/track-orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto sm:p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col  items-start  gap-4 mb-6 mt-10 md:mt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/salesman/track-orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{order.productName}</h1>
          <p className="text-muted-foreground">Order Details</p>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={`text-sm ${getStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Badge>
        {/* <Badge className={`text-sm ${getPriorityColor(order.priority)}`}>
          {order.priority.toUpperCase()}
        </Badge> */}
      </div>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Order Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Order Code</div>
              <div className="font-mono text-sm bg-muted px-3 py-2 rounded">{order.orderCode}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{order.customerName}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Created Date</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Expected Delivery</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="text-sm text-muted-foreground">Catalog</div>
              <div className="font-medium">{order.catalogId?.title ?? 'No catalog'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Details */}
      {order.customizationDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Customization Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{order.customizationDetails}</p>
          </CardContent>
        </Card>
      )}

      {/* Voice Recording */}
      {order.voiceRecording && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Voice Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full">
              <source src={order.voiceRecording} />
            </audio>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {order.images && order.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Images ({order.images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img} 
                    alt={`Order image ${idx + 1}`} 
                    className="w-full h-48 object-cover rounded-lg border shadow-sm group-hover:shadow-md transition-shadow" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Specifications */}
      {(order.karatage || order.weight !== undefined || order.colour || order.name || order.size || order.stone || order.enamel || order.matte || order.rodium) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.karatage && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Karatage</div>
                  <div className="font-medium">{order.karatage}</div>
                </div>
              )}
              {order.weight !== undefined && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Weight</div>
                  <div className="font-medium">{order.weight} g</div>
                </div>
              )}
              {order.colour && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Colour</div>
                  <div className="font-medium">{order.colour}</div>
                </div>
              )}
              {order.name && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{order.name}</div>
                </div>
              )}
              {order.size && (order.size.type || order.size.value) && (
                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm text-muted-foreground">Size</div>
                  <div className="font-medium">
                    {order.size.type ? order.size.type.toUpperCase() : ''}
                    {order.size.type && order.size.value ? ' - ' : ''}
                    {order.size.value ?? ''}
                  </div>
                </div>
              )}
            </div>
            
            {(order.stone || order.enamel || order.matte || order.rodium) && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Features</div>
                <div className="flex flex-wrap gap-2">
                  {order.stone && (<Badge variant="secondary">Stone</Badge>)}
                  {order.enamel && (<Badge variant="secondary">Enamel</Badge>)}
                  {order.matte && (<Badge variant="secondary">Matte</Badge>)}
                  {order.rodium && (<Badge variant="secondary">Rodium</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailPage;
