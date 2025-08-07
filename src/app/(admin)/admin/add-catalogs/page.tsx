"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";
import Image from 'next/image';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Catalog form schema
const catalogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  style: z.string().min(1, "Style is required"),
  size: z.string().min(1, "Size is required"),
  weight: z.string().min(1, "Weight is required"),
  font: z.string().min(1, "Font is required"),
  description: z.string().optional(),
});

type CatalogFormValues = z.infer<typeof catalogFormSchema>;

interface Font {
  _id: string;
  name: string;
  files?: string[]; // Added files property
}

const CatalogPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [fontsLoading, setFontsLoading] = useState(true);

  useEffect(() => {
    const fetchFonts = async () => {
      setFontsLoading(true);
      try {
        const res = await fetch("/api/admin/fonts");
        const data = await res.json();
        setFonts(data.fonts || []);
      } catch {
        setFonts([]);
      } finally {
        setFontsLoading(false);
      }
    };
    fetchFonts();
  }, []);

  useEffect(() => {
    fonts.forEach((font) => {
      if (!font.files?.length) return;
      const fontUrl = font.files[0];
      const fontFace = new FontFace(font.name, `url(${fontUrl})`);
      fontFace.load().then((loadedFace) => {
        document.fonts.add(loadedFace);
      });
    });
  }, [fonts]);

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogFormSchema),
    defaultValues: {
      title: "",
      style: "",
      size: "",
      weight: "",
      font: "",
      description: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    toast.success("Images selected successfully");
  };

  const removeImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const onSubmit = async (data: CatalogFormValues) => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("style", data.style);
      formData.append("size", data.size);
      formData.append("weight", data.weight);
      formData.append("font", data.font);
      if (data.description) {
        formData.append("description", data.description);
      }
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/admin/catalogs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create catalog");
      }

      await response.json();
      toast.success("Catalog created successfully!");
      form.reset();
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error creating catalog:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create catalog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Catalog</h1>
        <p className="text-muted-foreground">Create a new catalog item with images and details</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Catalog Information</CardTitle>
          <CardDescription>
            Fill in the details for your new catalog item. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter catalog title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter style (e.g., Modern, Classic)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Small, Medium, Large" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (grams) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="font"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font *</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={fontsLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={fontsLoading ? "Loading fonts..." : "Select a font"} />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map((font) => (
                            <SelectItem
                              key={font._id}
                              value={font._id}
                              style={{ fontFamily: font.name }}
                            >
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter catalog description (optional)"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide additional details about the catalog item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Files *</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Select Images
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*,.stl,application/octet-stream"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <FormDescription>
                    Upload one or more images or STL files for the catalog item
                  </FormDescription>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => {
                      const isImage = file.type.startsWith('image/');
                      
                      return (
                        <div key={index} className="relative group">
                          {isImage ? (
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={`Catalog image ${index + 1}`}
                              width={200}
                              height={128}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-2xl mb-1">📁</div>
                                <div className="text-xs text-gray-600">{file.name}</div>
                                <div className="text-xs text-gray-500">STL File</div>
                              </div>
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Catalog"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedFiles([]);
                  }}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogPage;