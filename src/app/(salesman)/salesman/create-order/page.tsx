"use client"
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, X, Upload, Plus } from "lucide-react";

export default function CreateOrderPage() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Create New Order</h1>
        <p className="text-muted-foreground">Submit a new order request</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product Name</Label>
                <Input id="product" placeholder="e.g., Gold Ring" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" placeholder="Customer name" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobile">Customer Mobile</Label>
              <Input id="mobile" placeholder="+1234567890" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Customization Details</Label>
              <Textarea 
                id="details" 
                placeholder="Describe any specific requirements, measurements, or customizations needed..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button type="button" variant="outline" className="flex items-center gap-2">
                <Mic size={18} /> 
                <span className="hidden sm:inline">Record Voice</span>
                <span className="sm:hidden">Voice</span>
              </Button>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Upload Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
              
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square border rounded-lg overflow-hidden">
                      <Image src={src} alt="preview" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white transition-colors"
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Expected Delivery Date</Label>
              <Input type="date" id="deadline" className="w-full" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Order
              </Button>
              <Button type="button" variant="outline" className="flex-1 sm:flex-none">
                Save Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 