"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof schema>;

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const nameValue = form.watch("name");
  const autoSlug = useMemo(() => toSlug(nameValue || ""), [nameValue]);

  useEffect(() => {
    // keep derived slug preview only
  }, [autoSlug]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create category");
      }
      toast.success("Category created");
      form.reset({ name: "" });
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Delete this category?");
    if (!confirm) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete category");
      }
      toast.success("Deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Create and manage product categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
            <CardDescription>Provide a name. Slug can be customized.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Rings" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <div>
                  <FormLabel>Slug</FormLabel>
                  <p className="text-xs text-muted-foreground">Preview: {autoSlug || "-"}</p>
                </div> */}

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Category"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => form.reset({ name: "" })}>
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>{loading ? "Loading..." : `${categories.length} total`}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
           
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
   
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(c._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {categories.length === 0 && !loading && (
                <TableCaption>No categories found</TableCaption>
              )}
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryPage;
