"use client";
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Special Item" : "Add Special Item"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (g)</Label>
              <Input id="weight" type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} {...(editing ? {} : { required: true })} />
            </div>
            <div className="flex items-end gap-3">
              <Button type="submit" disabled={submitting}>{editing ? "Update" : "Add"}</Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Special Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Image</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Weight (g)</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items
                  .slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
                  .map((it) => (
                  <tr key={it._id} className="border-b">
                    <td className="p-2">
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.image} alt={it.name} className="object-cover w-full h-full" />
                      </div>
                    </td>
                    <td className="p-2">{it.name}</td>
                    <td className="p-2">{it.weight}</td>
                    <td className="p-2 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(it); setName(it.name); setWeight(String(it.weight)); }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(it._id)}>Delete</Button>
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, items.length)} of {items.length}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="border rounded px-2 py-1 text-sm bg-background"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {Math.max(1, Math.ceil(items.length / pageSize))}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(items.length / pageSize), p + 1))}
                    disabled={currentPage >= Math.ceil(items.length / pageSize)}
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
