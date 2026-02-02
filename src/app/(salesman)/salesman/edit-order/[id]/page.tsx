"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface OrderDetail {
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
  additional_feature_color?: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  catalogId?: {
    _id: string;
    title: string;
    images: string[];
  };
}

const EDIT_WINDOW_HOURS = 48;

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [productName, setProductName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customizationDetails, setCustomizationDetails] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [karatage, setKaratage] = useState("");
  const [weight, setWeight] = useState("");
  const [colour, setColour] = useState("");
  const [name, setName] = useState("");
  const [sizeType, setSizeType] = useState("");
  const [sizeValue, setSizeValue] = useState("");
  const [stone, setStone] = useState(false);
  const [enamel, setEnamel] = useState(false);
  const [matte, setMatte] = useState(false);
  const [rodium, setRodium] = useState(false);
  const [additionalFeatureColor, setAdditionalFeatureColor] = useState("");

  // Edit window state
  const [canEdit, setCanEdit] = useState(true);
  const [editWindowMessage, setEditWindowMessage] = useState("");
  const [remainingTime, setRemainingTime] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Update remaining time every minute
  useEffect(() => {
    if (!order) return;
    
    const updateRemainingTime = () => {
      const orderDate = new Date(order.createdAt);
      const deadline = new Date(orderDate.getTime() + EDIT_WINDOW_HOURS * 60 * 60 * 1000);
      const now = new Date();
      const remainingMs = deadline.getTime() - now.getTime();
      
      if (remainingMs <= 0) {
        setRemainingTime("Expired");
        setCanEdit(false);
        setEditWindowMessage("Editing period expired. You can no longer modify this order.");
      } else {
        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setRemainingTime(`${remainingHours}h ${remainingMins}m remaining`);
      }
    };
    
    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/salesman/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data);
      
      // Populate form fields
      setProductName(data.productName || "");
      setCustomerName(data.customerName || "");
      setCustomizationDetails(data.customizationDetails || "");
      setExpectedDeliveryDate(data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : "");
      setKaratage(data.karatage || "");
      setWeight(data.weight?.toString() || "");
      setColour(data.colour || "");
      setName(data.name || "");
      setSizeType(data.size?.type || "");
      setSizeValue(data.size?.value || "");
      setStone(data.stone || false);
      setEnamel(data.enamel || false);
      setMatte(data.matte || false);
      setRodium(data.rodium || false);
      setAdditionalFeatureColor(data.additional_feature_color || "");
      
      // Check edit eligibility
      const orderDate = new Date(data.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > EDIT_WINDOW_HOURS) {
        setCanEdit(false);
        setEditWindowMessage("Editing period expired. You can no longer modify this order.");
      } else if (!['confirmed', 'order_view_and_accepted'].includes(data.status)) {
        setCanEdit(false);
        setEditWindowMessage("Order cannot be edited. It has already been processed.");
      }
      
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      router.push('/salesman/track-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error(editWindowMessage);
      return;
    }

    if (!productName.trim() || !customerName.trim()) {
      toast.error("Product name and customer name are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        productName,
        customerName,
        customizationDetails,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        karatage: karatage || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        colour: colour || undefined,
        name: name || undefined,
        size: sizeType && sizeValue ? { type: sizeType, value: sizeValue } : undefined,
        stone,
        enamel,
        matte,
        rodium,
        additional_feature_color: additionalFeatureColor || undefined,
      };

      const response = await fetch(`/api/salesman/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.editWindowExpired) {
          setCanEdit(false);
          setEditWindowMessage(result.error);
        }
        throw new Error(result.error || "Failed to update order");
      }

      toast.success("Order updated successfully!");
      router.push('/salesman/track-orders');
      
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order not found</h3>
          <Button onClick={() => router.push('/salesman/track-orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 md:mt-10 mt-16">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/salesman/track-orders')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Edit Order</h1>
            <p className="text-muted-foreground">Order Code: {order.orderCode}</p>
          </div>
          {canEdit && (
            <Badge variant="outline" className="flex items-center gap-2 w-fit bg-blue-50 text-blue-700 border-blue-200">
              <Clock className="h-4 w-4" />
              {remainingTime}
            </Badge>
          )}
        </div>
      </div>

      {/* Edit Window Warning */}
      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800">Cannot Edit Order</h4>
            <p className="text-sm text-yellow-700">{editWindowMessage}</p>
          </div>
        </div>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product Name</Label>
                <Input
                  id="product"
                  placeholder="e.g., Gold Ring"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Customization Details</Label>
              <Textarea
                id="details"
                placeholder="Describe any specific requirements, measurements, or customizations needed..."
                className="min-h-[100px]"
                value={customizationDetails}
                onChange={(e) => setCustomizationDetails(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            {/* Existing Images (Read-only) */}
            {order.images && order.images.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {order.images.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square border rounded-lg overflow-hidden"
                    >
                      <Image
                        src={src}
                        alt={`Order image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Images cannot be modified after order creation</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deadline">Expected Delivery Date</Label>
              <Input
                type="date"
                id="deadline"
                className="w-full"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="karatage">Karatage</Label>
                <Input
                  id="karatage"
                  placeholder="e.g., 18K"
                  value={karatage}
                  onChange={(e) => setKaratage(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  placeholder="e.g., 5.00g"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colour">Colour</Label>
                <Input
                  id="colour"
                  placeholder="e.g., Yellow"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Ring Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sizeType"
                      value="plastic"
                      checked={sizeType === "plastic"}
                      onChange={(e) => setSizeType(e.target.value)}
                      disabled={!canEdit}
                    />
                    <span>Plastic</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="sizeType"
                      value="metal"
                      checked={sizeType === "metal"}
                      onChange={(e) => setSizeType(e.target.value)}
                      disabled={!canEdit}
                    />
                    <span>Metal</span>
                  </label>
                </div>
                {sizeType && (
                  <Input
                    placeholder="Enter size value"
                    value={sizeValue}
                    onChange={(e) => setSizeValue(e.target.value)}
                    disabled={!canEdit}
                  />
                )}
              </div>
              <div className="col-span-1 md:col-span-2 space-y-3">
                <Label>Additional Features</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="stone"
                      checked={stone}
                      onChange={(e) => setStone(e.target.checked)}
                      className="rounded"
                      disabled={!canEdit}
                    />
                    <span className="text-sm">Stone</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="enamel"
                      checked={enamel}
                      onChange={(e) => setEnamel(e.target.checked)}
                      className="rounded"
                      disabled={!canEdit}
                    />
                    <span className="text-sm">Enamel</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="matte"
                      checked={matte}
                      onChange={(e) => setMatte(e.target.checked)}
                      className="rounded"
                      disabled={!canEdit}
                    />
                    <span className="text-sm">Matte</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="rodium"
                      checked={rodium}
                      onChange={(e) => setRodium(e.target.checked)}
                      className="rounded"
                      disabled={!canEdit}
                    />
                    <span className="text-sm">Rodium</span>
                  </label>
                </div>
                
                {/* Show color input when Stone, Enamel, or Rodium is selected */}
                {(stone || enamel || rodium) && (
                  <div className="mt-4">
                    <Label htmlFor="additionalFeatureColor">Feature Color</Label>
                    <Input
                      id="additionalFeatureColor"
                      placeholder="Enter color "
                      value={additionalFeatureColor}
                      onChange={(e) => setAdditionalFeatureColor(e.target.value)}
                      className="mt-1"
                      disabled={!canEdit}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Specify the color for: {[stone && 'Stone', enamel && 'Enamel', rodium && 'Rodium'].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isSubmitting || !canEdit}
              >
                {isSubmitting ? "Updating Order..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => router.push('/salesman/track-orders')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
