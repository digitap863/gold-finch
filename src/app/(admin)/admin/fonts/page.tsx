"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="space-y-6 md:p-10 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fonts</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your custom brand fonts
          </p>
        </div>
        <Link href="/admin/add-fonts" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Font
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading fonts...</div>
        </div>
      ) : fonts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No fonts found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {fonts.map((font) => (
            <div
              key={font._id}
              className="p-4 md:p-6 border rounded-xl bg-card shadow-sm flex flex-col items-start transition-all hover:shadow-md dark:bg-muted/20"
            >
              <div className="flex items-center w-full justify-between mb-4">
                <div className="text-base md:text-lg font-semibold truncate pr-2">{font.name}</div>
                <button
                  title="Delete font"
                  onClick={() => handleDeleteClick(font)}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                >
                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
              <div
                className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 dark:bg-muted/10 w-full"
                style={{
                  fontFamily: font.name,
                  padding: "24px 12px",
                  textAlign: "center",
                }}
              >
                <span className="text-2xl md:text-3xl lg:text-4xl break-all">
                  {font.name}
                </span>
              </div>
              <div className="mt-4 w-full">
                <p className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1">FONT FILES</p>
                <div className="flex flex-wrap gap-1">
                  {font.files.map((f, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 bg-muted rounded text-[10px] md:text-xs truncate max-w-[150px]"
                    >
                      {f.split("/").pop()}
                    </span>
                  ))}
                </div>
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
