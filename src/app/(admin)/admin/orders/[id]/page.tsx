"use client";

import OrderPDF from '@/components/OrderPDF';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pdf } from '@react-pdf/renderer';
import { ArrowLeft, Download, FileText, Package } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderDetail {
  _id: string;
  orderCode: string;
  productName: string;
  customerName: string;
  customizationDetails?: string;
  voiceRecording?: string;
  images?: string[];
  status: 'confirmed' | 'order_view_and_accepted' | 'cad_completed' | 'production_floor' | 'finished' | 'dispatched' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  expectedDeliveryDate?: string;
  
  // New fields
  karatage?: string;
  weight?: number;
  colour?: string;
  name?: string;
  size?: {
    type: 'plastic' | 'metal';
    value: string;
  };
  stone?: boolean;
  enamel?: boolean;
  matte?: boolean;
  rodium?: boolean;
  
  catalogId?: {
    _id: string;
    title: string;
    style: string;
    images: string[];
    files: string[];
    size: string;
    weight: number;
    description?: string;
    font?: {
      _id: string;
      name: string;
      files: string[];
    };
  };
  salesmanId?: {
    _id: string;
    name?: string;
    email?: string;
    mobile?: string;
    shopName?: string;
    shopAddress?: string;
    shopMobile?: string;
  };
}

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderField = async (payload: Partial<Pick<OrderDetail, 'status' | 'priority' | 'expectedDeliveryDate'>>) => {
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update order');
      const { order: updatedOrder } = await res.json();
      setOrder(updatedOrder);
      toast.success('Order updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  // Convert image URL to base64 via server-side proxy (to avoid CORS issues)
  const imageToBase64 = async (url: string): Promise<string> => {
    try {
      // Use our API proxy to fetch the image server-side
      const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.dataUrl) {
        console.log('Image converted via proxy, length:', data.dataUrl.length);
        return data.dataUrl;
      }
      
      console.error('Proxy failed, no dataUrl returned');
      return url;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return url; // Return original URL as fallback
    }
  };

  const downloadPDF = async () => {
    try {
      if (!order) return;
      
      toast.info('Generating PDF...');

      // Convert images to base64 to avoid CORS issues
      let orderWithBase64Images = { ...order };
      
      if (order.images && order.images.length > 0) {
        console.log('Original images:', order.images);
        const base64Images = await Promise.all(
          order.images.map(async (img) => {
            const base64 = await imageToBase64(img);
            console.log('Converted image:', img, '-> base64 length:', base64?.length);
            return base64;
          })
        );
        orderWithBase64Images.images = base64Images;
        console.log('All images converted:', base64Images.length);
      } else {
        console.log('No order images found');
      }

      // Convert catalog images if present
      if (order.catalogId?.images && order.catalogId.images.length > 0) {
        console.log('Converting catalog images...');
        const base64CatalogImages = await Promise.all(
          order.catalogId.images.map(img => imageToBase64(img))
        );
        orderWithBase64Images = {
          ...orderWithBase64Images,
          catalogId: {
            ...order.catalogId,
            images: base64CatalogImages
          }
        };
      }

      console.log('Final order images:', orderWithBase64Images.images);
      
      const doc = <OrderPDF order={orderWithBase64Images} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Order-${order.orderCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'order_view_and_accepted': return 'bg-purple-100 text-purple-800';
      case 'cad_completed': return 'bg-indigo-100 text-indigo-800';
      case 'production_floor': return 'bg-orange-100 text-orange-800';
      case 'finished': return 'bg-green-100 text-green-800';
      case 'dispatched': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order not found</h3>
          <Button onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderCode}</h1>
            <p className="text-muted-foreground">{order.productName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(order.status)}`}>
            {order.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
          <Badge className={`${getPriorityColor(order.priority)}`}>
            {order.priority.toUpperCase()}
          </Badge>
          <Button onClick={downloadPDF} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Name</label>
                  <p className="text-lg">{order.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Name</label>
                  <p className="text-lg">{order.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Date</label>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Salesman</label>
                  <p>{order.salesmanId?.name || order.salesmanId?.email || '-'}</p>
                </div>
                {order.salesmanId?.mobile && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Salesman Mobile</label>
                    <p>{order.salesmanId.mobile}</p>
                  </div>
                )}
                {order.salesmanId?.shopName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shop Name</label>
                    <p>{order.salesmanId.shopName}</p>
                  </div>
                )}
                {order.salesmanId?.shopMobile && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Shop Mobile</label>
                    <p>{order.salesmanId.shopMobile}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Expected Delivery</label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 text-sm w-full"
                    value={order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().slice(0,10) : ''}
                    onChange={(e) => updateOrderField({ expectedDeliveryDate: e.target.value })}
                  />
                </div>
              </div>

              {order.salesmanId?.shopAddress && (
                <div className="col-span-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Shop Address</label>
                  <p className="mt-1 text-sm">{order.salesmanId.shopAddress}</p>
                </div>
              )}

              {order.customizationDetails && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Customization Details</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{order.customizationDetails}</p>
                </div>
              )}

              {order.voiceRecording && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Voice Recording</label>
                  <audio controls className="w-full">
                    <source src={order.voiceRecording} />
                  </audio>
                </div>
              )}

              {order.images && order.images.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-2">Order Images</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {order.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <Image
                          src={img}
                          alt={`Order image ${idx + 1}`}
                          fill
                          className="object-cover rounded-md border"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Specifications */}
          {(order.karatage || order.weight || order.colour || order.name || order.size || order.stone || order.enamel || order.matte || order.rodium) && (
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
                <CardDescription>Detailed product specifications and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.karatage && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Karatage</label>
                      <p className="text-lg font-medium">{order.karatage}</p>
                    </div>
                  )}
                  {order.weight && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Weight</label>
                      <p className="text-lg font-medium">{order.weight}g</p>
                    </div>
                  )}
                  {order.colour && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Colour</label>
                      <p className="text-lg font-medium">{order.colour}</p>
                    </div>
                  )}
                  {order.name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg font-medium">{order.name}</p>
                    </div>
                  )}
                  {order.size && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Size</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {order.size.type}
                        </Badge>
                        <span className="text-lg font-medium">{order.size.value}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Features */}
                {(order.stone || order.enamel || order.matte || order.rodium) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Additional Features</label>
                    <div className="flex flex-wrap gap-2">
                      {order.stone && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Stone
                        </Badge>
                      )}
                      {order.enamel && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Enamel
                        </Badge>
                      )}
                      {order.matte && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                          Matte
                        </Badge>
                      )}
                      {order.rodium && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Rodium
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Catalog Details */}
          {order.catalogId && (
            <Card>
              <CardHeader>
                <CardTitle>Catalog Details</CardTitle>
                <CardDescription>Product catalog information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Title</label>
                    <p className="text-lg font-medium">{order.catalogId.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Style</label>
                    <p>{order.catalogId.style}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Size</label>
                    <p>{order.catalogId.size}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p>{order.catalogId.weight}g</p>
                  </div>
                </div>

                {order.catalogId.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-700">{order.catalogId.description}</p>
                  </div>
                )}

                {order.catalogId.font && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Font</label>
                    <p className="text-lg">{order.catalogId.font.name}</p>
                    {order.catalogId.font.files && order.catalogId.font.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {order.catalogId.font.files.map((file, idx) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Font File {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {order.catalogId.images && order.catalogId.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">Catalog Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {order.catalogId.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square">
                          <Image
                            src={img}
                            alt={`Catalog image ${idx + 1}`}
                            fill
                            className="object-cover rounded-md border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.catalogId.files && order.catalogId.files.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 block mb-2">3D Files</label>
                    <div className="space-y-2">
                      {order.catalogId.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-2 rounded-md"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          3D File {idx + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Status</label>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateOrderField({ status: value as OrderDetail['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="order_view_and_accepted">Order View & Accepted</SelectItem>
                    <SelectItem value="cad_completed">CAD Completed</SelectItem>
                    <SelectItem value="production_floor">Production Floor</SelectItem>
                    <SelectItem value="finished">Finished</SelectItem>
                    <SelectItem value="dispatched">Dispatched</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Priority</label>
                <Select
                  value={order.priority}
                  onValueChange={(value) => updateOrderField({ priority: value as OrderDetail['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xs bg-muted px-3 py-2 rounded-md break-all">
                {order.orderCode}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
