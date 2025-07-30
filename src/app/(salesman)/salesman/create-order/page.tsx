"use client"
import React, { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, X } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <Input className="w-full" placeholder="Product" />
          <Input className="w-full" placeholder="Customer Name" />
          <Input className="w-full" placeholder="Customer Mobile" />
          <Textarea className="w-full" placeholder="Customization Details" />
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" className="flex items-center gap-2">
              <Mic size={18} /> Record Voice
            </Button>
            <span className="text-xs text-muted-foreground">(Optional)</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Images</label>
            <Input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                    <img src={src} alt="preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white"
                      onClick={() => removeImage(idx)}
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Input type="date" className="w-full" />
          <Button type="submit">Submit Order</Button>
        </form>
      </CardContent>
    </Card>
  );
} 