"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Plus, Upload, X, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";

// Font form schema
const fontFormSchema = z.object({
  name: z.string().min(1, "Font name is required"),
});

type FontFormValues = z.infer<typeof fontFormSchema>;

const FontPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FontFormValues>({
    resolver: zodResolver(fontFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);
    toast.success("Font files selected successfully");
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const onSubmit = async (data: FontFormValues) => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one font file");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/fonts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create font");
      }

      await response.json();
      toast.success("Font created successfully!");
      form.reset();
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error creating font:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create font");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Font</h1>
        <p className="text-muted-foreground">Upload font files and create a new font entry</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Font Information</CardTitle>
          <CardDescription>
            Add a new font with its files. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter font name (e.g., Arial, Roboto, Open Sans)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a descriptive name for the font family
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Font Files *</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('font-upload')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Select Font Files
                    </Button>
                    <input
                      id="font-upload"
                      type="file"
                      multiple
                      accept=".ttf,.otf,.woff,.woff2,.eot"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  <FormDescription>
                    Upload font files (TTF, OTF, WOFF, WOFF2, EOT formats supported)
                  </FormDescription>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Selected Files ({selectedFiles.length})</div>
                    <div className="grid gap-3">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <div className="font-medium text-sm">{file.name}</div>
                              <div className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Font"}
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

export default FontPage;
