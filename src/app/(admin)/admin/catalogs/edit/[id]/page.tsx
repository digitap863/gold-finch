"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, X, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const catalogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  style: z.string().min(1, "Style is required"),
  size: z.string().min(1, "Size is required"),
  weight: z.string().min(1, "Weight is required"),
  font: z.string().min(1, "Font is required"),
  description: z.string().min(1, "Description is required"),
});

type CatalogFormData = z.infer<typeof catalogFormSchema>;

interface Catalog {
  _id: string;
  title: string;
  style: string;
  size: string;
  weight: number;
  font: string;
  description: string;
  images: string[];
  files: string[];
  createdAt: string;
  updatedAt: string;
}

interface Font {
  _id: string;
  name: string;
  files: string[];
}

export default function EditCatalogPage() {
  const params = useParams();
  const id = (params as Record<string, string>).id;
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CatalogFormData>({
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

  // Fetch fonts
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const res = await fetch('/api/admin/fonts');
        const data = await res.json();
        setFonts(data.fonts || []);
      } catch {
        setFonts([]);
      }
    };
    fetchFonts();
  }, []);

  // Fetch catalog data
  const { data: catalog, isLoading, error } = useQuery({
    queryKey: ["catalog", id],
    queryFn: async (): Promise<Catalog> => {
      const res = await fetch(`/api/admin/catalogs/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch catalog");
      }
      return res.json();
    },
  });

  // Update form when catalog data is loaded
  useEffect(() => {
    if (catalog) {
      form.reset({
        title: catalog.title,
        style: catalog.style,
        size: catalog.size,
        weight: catalog.weight.toString(),
        font: catalog.font,
        description: catalog.description,
      });
      setExistingImages(catalog.images || []);
      setExistingFiles(catalog.files || []);
    }
  }, [catalog, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setRemovedImages(prev => [...prev, existingImages[index]]);
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const removeFile = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setRemovedFiles(prev => [...prev, existingFiles[index]]);
      setExistingFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update catalog mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CatalogFormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("style", data.style);
      formData.append("size", data.size);
      formData.append("weight", data.weight);
      formData.append("font", data.font);
      formData.append("description", data.description);

      // Add new files
      [...selectedImages, ...selectedFiles].forEach((file) => {
        formData.append("images", file);
      });

      // Add existing files that weren't removed
      existingImages.forEach((image) => {
        formData.append("existingImages", image);
      });

      existingFiles.forEach((file) => {
        formData.append("existingFiles", file);
      });

      // Add removed files for cleanup
      removedImages.forEach((image) => {
        formData.append("removedImages", image);
      });

      removedFiles.forEach((file) => {
        formData.append("removedFiles", file);
      });

      const response = await fetch(`/api/admin/catalogs/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update catalog");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Catalog updated successfully!");
      router.push("/admin/catalogs");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: CatalogFormData) => {
    if (existingImages.length === 0 && existingFiles.length === 0 && selectedImages.length === 0 && selectedFiles.length === 0) {
      toast.error("Please select at least one image or file");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading catalog...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading catalog</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/catalogs">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalogs
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Catalog</h1>
          <p className="text-muted-foreground">
            Update catalog information and files
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Catalog Information</CardTitle>
          <CardDescription>
            Update the details for your catalog item
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

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter size" {...field} />
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

              <FormField
                control={form.control}
                name="font"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font._id} value={font._id}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Existing Images</label>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative h-32">
                          <Image
                            src={image}
                            alt={`Existing image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index, true)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Add New Images</label>
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
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative h-32">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Existing Files */}
                {existingFiles.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Existing Files</label>
                    <div className="mt-4 space-y-2">
                      {existingFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">File {index + 1}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={file} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFile(index, true)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New File Upload */}
                <div>
                  <label className="text-sm font-medium">Add New Files (STL, etc.)</label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept=".stl,.obj,.fbx,.3ds"
                      multiple
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Updating..." : "Update Catalog"}
                </Button>
                <Link href="/admin/catalogs">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 