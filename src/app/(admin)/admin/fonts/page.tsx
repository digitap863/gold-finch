"use client";

import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Font {
  _id: string;
  name: string;
  files: string[];
}

const FontListPage = () => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fontToDelete, setFontToDelete] = useState<Font | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchFonts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/fonts");
        const data = await res.json();
        setFonts(data.fonts || []);
      } catch {
        setFonts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFonts();
  }, []);

  // Dynamically inject @font-face for each font
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

  const handleDeleteClick = (font: Font) => {
    setFontToDelete(font);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fontToDelete) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/fonts?id=${fontToDelete._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete font");
      setFonts((prev) => prev.filter((f) => f._id !== fontToDelete._id));
      setDeleteDialogOpen(false);
      setFontToDelete(null);
    } catch {
      alert("Error deleting font");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFontToDelete(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Font List</h1>
      {loading ? (
        <div>Loading fonts...</div>
      ) : fonts.length === 0 ? (
        <div>No fonts found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fonts.map((font) => (
            <div
              key={font._id}
              className="p-6 border rounded-lg bg-white shadow-sm flex flex-col items-start"
            >
              <div className="flex items-center w-full justify-between mb-2">
                <div className="text-lg font-semibold">{font.name}</div>
                <button
                  title="Delete font"
                  onClick={() => handleDeleteClick(font)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full border border-transparent hover:border-red-200 transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div
                style={{
                  fontFamily: font.name,
                  fontSize: 32,
                  fontWeight: 400,
                  border: "1px dashed #ddd",
                  padding: "12px 0",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {font.name}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Files: {font.files.map((f, i) => (
                  <span key={i}>{f.split("/").pop()}{i < font.files.length - 1 ? ", " : ""}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Font</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{fontToDelete?.name}&rdquo;? This action cannot be undone and will permanently remove the font and all its files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Font"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FontListPage;
