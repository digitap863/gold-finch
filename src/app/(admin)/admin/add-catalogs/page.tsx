"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Catalog form schema
const catalogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  style: z.string().min(1, "Style is required"),
  size: z.string().optional(),
  width: z.string().optional(),
  weight: z.string().optional(),
  category: z.string().optional(),
  material: z.enum(["Gold", "Diamond"]),
  audience: z.enum(["Men", "Women", "Kids", "All"]),
  fonts: z.array(z.string()).optional(),
  description: z.string().optional(),
});

type CatalogFormValues = z.infer<typeof catalogFormSchema>;

interface Font {
  _id: string;
  name: string;
  files?: string[]; // Added files property
}

interface CategoryOpt {
  _id: string;
  name: string;
}

const CatalogPage = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [fontsLoading, setFontsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryOpt[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchFonts = async () => {
      setFontsLoading(true);
      try {
        const res = await fetch("/api/admin/fonts");
        const data = await res.json();
        const fontsData = data.fonts || [];
        console.log('Fetched fonts:', fontsData);
        setFonts(fontsData);
      } catch {
        setFonts([]);
      } finally {
        setFontsLoading(false);
      }
    };
    fetchFonts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fonts.forEach((font) => {
      if (!font.files?.length) {
        console.warn(`Font ${font.name} has no files`);
        return;
      }
      
      const fontUrl = font.files[0];
      console.log(`Loading font ${font.name} from ${fontUrl}`);
      
      // Only try to load fonts that have valid URLs
      if (fontUrl && (fontUrl.startsWith('http') || fontUrl.startsWith('/uploads/'))) {
        const fontFace = new FontFace(font.name, `url(${fontUrl})`);
        fontFace.load().then((loadedFace) => {
          document.fonts.add(loadedFace);
          console.log(`Successfully loaded font ${font.name}`);
        }).catch((error) => {
          console.warn(`Failed to load font ${font.name} from ${fontUrl}:`, error);
          // Don't throw error, just log it
        });
      } else {
        console.warn(`Font ${font.name} has invalid URL: ${fontUrl}`);
      }
    });
  }, [fonts]);

  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogFormSchema),
    defaultValues: {
      title: "",
      style: "",
      size: "",
      width: "",
      weight: "",
      category: "",
      material: undefined,
      audience: undefined,
      fonts: [],
      description: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeFont = (fontId: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = new Set(form.getValues("fonts") || []);
    current.delete(fontId);
    form.setValue("fonts", Array.from(current));
  };

  const onSubmit = async (data: CatalogFormValues) => {
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("style", data.style);
      if (data.size) formData.append("size", data.size);
      if (data.weight) formData.append("weight", data.weight);
      if (data.width && data.width.length > 0) formData.append("width", data.width);
      if (data.category) formData.append("category", data.category);
      if (data.material) formData.append("material", data.material);
      if (data.audience) formData.append("audience", data.audience);
      if (data.fonts && data.fonts.length > 0) {
        data.fonts.forEach((fid) => formData.append("fonts", fid));
      }
      if (data.description) {
        formData.append("description", data.description);
      }
      // Add all selected images
      selectedImages.forEach((file) => {
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
      setSelectedImages([]);
    } catch (error) {
      console.error("Error creating catalog:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create catalog");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:p-10 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Add New Catalog</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create a new catalog item with images and details
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Small, Medium" {...field} />
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
                      <FormLabel>Weight (grams)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fonts"
                render={() => {
                  const selected = form.watch("fonts") || [];
                  const selectedFonts = fonts.filter((f) => selected.includes(f._id));
                  const maxBadges = 3;
                  const extraCount = Math.max(0, selectedFonts.length - maxBadges);
                  return (
                    <FormItem>
                      <FormLabel>Fonts</FormLabel>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="outline" className="w-full justify-start min-h-10">
                            {fontsLoading ? (
                              <span className="text-sm text-muted-foreground">Loading fonts...</span>
                            ) : selectedFonts.length === 0 ? (
                              <span className="text-sm text-muted-foreground">Select fonts</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {selectedFonts.slice(0, maxBadges).map((f) => (
                                  <Badge key={f._id} variant="secondary" className="flex items-center gap-1">
                                    <span style={{ fontFamily: f.name }}>{f.name}</span>
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`Remove ${f.name}`}
                                      className="ml-1 text-xs opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={(e) => removeFont(f._id, e)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          removeFont(f._id, e);
                                        }
                                      }}
                                    >
                                      ×
                                    </span>
                                  </Badge>
                                ))}
                                {extraCount > 0 && (
                                  <Badge variant="outline">+{extraCount} more</Badge>
                                )}
                              </div>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                          {fonts.map((f) => {
                            const isChecked = (form.getValues("fonts") || []).includes(f._id);
                            return (
                              <DropdownMenuCheckboxItem
                                key={f._id}
                                checked={!!isChecked}
                                onCheckedChange={(v) => {
                                  const current = new Set(form.getValues("fonts") || []);
                                  if (v) current.add(f._id); else current.delete(f._id);
                                  form.setValue("fonts", Array.from(current));
                                }}
                              >
                                <span style={{ fontFamily: f.name }}>{f.name}</span>
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} disabled={categoriesLoading}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
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
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Diamond">Diamond</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience *</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Men">Men</SelectItem>
                            <SelectItem value="Women">Women</SelectItem>
                            <SelectItem value="Kids">Kids</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <Label className="text-sm font-medium">Images</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Catalog image ${index + 1}`}
                            width={200}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
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
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Catalog"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setSelectedImages([]);
                  }}
                  className="w-full sm:w-auto"
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