"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2 } from "lucide-react";
import React, { useEffect, useState } from 'react';

interface SpecialItem {
  _id: string;
  name: string; 
  image: string;
  weight: number;
}

const SpecialItemsPage = () => {
  const [items, setItems] = useState<SpecialItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<SpecialItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/special-items");
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    // reset to first page whenever data or page size changes
    setCurrentPage(1);
  }, [items.length, pageSize]);

  const resetForm = () => {
    setName("");
    setWeight("");
    setImageFile(null);
    setEditing(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name", name);
      form.append("weight", weight);
      if (imageFile) form.append("image", imageFile);

      const url = editing ? `/api/admin/special-items/${editing._id}` : "/api/admin/special-items";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, body: form });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      await fetchItems();
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/admin/special-items/${id}`, { method: "DELETE" });
    if (res.ok) fetchItems();
  };

  return (
    <div className="space-y-6 md:p-10 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Special Items</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your exclusive brand items and collections
          </p>
        </div>
      </div>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{editing ? "Edit Special Item" : "Add New Item"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-10 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Weight (g)</Label>
              <Input id="weight" type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} required className="h-10 text-sm" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image" className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">Image</Label>
              <Input 
                id="image" 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                {...(editing ? {} : { required: true })} 
                className="h-10 text-xs sm:text-sm file:text-xs file:font-semibold"
              />
            </div>
            <div className="flex flex-row gap-2 h-10 mt-auto sm:mt-7">
              <Button type="submit" disabled={submitting} className="flex-1 sm:flex-none h-10">
                {editing ? "Update Item" : "Add Item"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 sm:flex-none h-10">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Preview</th>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Name</th>
                  <th className="text-left p-3 font-semibold uppercase tracking-wider text-[10px] sm:text-xs hidden sm:table-cell">Weight (g)</th>
                  <th className="text-right p-3 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
                  .map((it) => (
                  <tr key={it._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden border border-muted-foreground/10 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.image} alt={it.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-xs sm:text-sm">{it.name}</div>
                      <div className="text-[10px] sm:hidden text-muted-foreground mt-0.5">{it.weight}g</div>
                    </td>
                    <td className="p-3 text-xs sm:text-sm hidden sm:table-cell">{it.weight}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => { setEditing(it); setName(it.name); setWeight(String(it.weight)); }}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:py-2"
                        >
                          <Edit className="h-3.5 w-3.5 sm:mr-1.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => onDelete(it._id)}
                          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:py-2"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">No items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, items.length)} of {items.length} items
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 order-1 sm:order-2">
                <div className="flex items-center gap-2 mr-2 border-r pr-3 border-muted-foreground/20">
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    className="border-none rounded-md px-2 py-1 text-xs sm:text-sm bg-muted/50 focus:ring-1 focus:ring-primary outline-none h-8 w-14"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                  >
                    Prev
                  </Button>
                  <div className="text-[10px] sm:text-xs font-semibold px-2 min-w-[70px] text-center bg-muted/30 py-1.5 rounded-md">
                    {currentPage} / {Math.max(1, Math.ceil(items.length / pageSize))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(items.length / pageSize), p + 1))}
                    disabled={currentPage >= Math.ceil(items.length / pageSize)}
                    className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SpecialItemsPage
