"use client";

import STLViewer from '@/components/STLViewer';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Edit, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Catalog {
  _id: string;
  title: string;
  style: string;
  size?: string;
  width?: number;
  weight?: number;
  description?: string;
  images: string[];
  files: string[];
  font?: string;
  fonts?: string[];
  category?: string;
  material?: "Gold" | "Diamond";
  audience?: "Men" | "Women" | "Kids" | "All";
  createdAt: string;
  updatedAt: string;
}

interface Font {
  _id: string;
  name: string;
  files: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function CatalogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch catalog
        const catalogRes = await fetch(`/api/admin/catalogs/${params.id}`);
        if (!catalogRes.ok) throw new Error("Failed to fetch catalog");
        const catalogData = await catalogRes.json();
        setCatalog(catalogData);

        // Fetch fonts
        const fontsRes = await fetch('/api/admin/fonts');
        const fontsData = await fontsRes.json();
        setFonts(fontsData.fonts || []);

        // Fetch categories
        const categoriesRes = await fetch('/api/admin/categories');
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load catalog");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleDownloadSTL = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('STL file download started');
  };

  const formatWeight = (weight: number) => {
    return `${weight} grams`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading catalog...</div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Catalog not found</div>
      </div>
    );
  }

  const catalogFont = fonts.find(f => f._id === catalog.font);
  const catalogFonts = catalog.fonts ? catalog.fonts.map(fontId => fonts.find(f => f._id === fontId)).filter(Boolean) : [];
  const catalogCategory = categories.find(c => c._id === catalog.category);

  return (
    <div className="space-y-6 md:p-10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{catalog.title}</h1>
            <p className="text-muted-foreground">Catalog Details</p>
          </div>
        </div>
        <Link href={`/admin/catalogs/edit/${catalog._id}`}>
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Catalog
          </Button>
        </Link>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-muted-foreground">Title:</span>
              <p className="text-lg">{catalog.title}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Style:</span>
              <div className="mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {catalog.style}
                </Badge>
              </div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Size:</span>
              <p className="text-lg">{catalog.size || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Width:</span>
              <p className="text-lg">{catalog.width ? `${catalog.width}mm` : 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Weight:</span>
              <p className="text-lg">{formatWeight(catalog.weight || 0)}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Category:</span>
              <div className="mt-1">
                {catalogCategory ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {catalogCategory.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Material:</span>
              <div className="mt-1">
                {catalog.material ? (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    {catalog.material}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Audience:</span>
              <div className="mt-1">
                {catalog.audience ? (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {catalog.audience}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not specified</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-muted-foreground">Fonts:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {catalogFonts.length > 0 ? (
                  catalogFonts.map((font, index) => (
                    <Badge key={index} variant="outline" style={{ fontFamily: font?.name }}>
                      {font?.name}
                    </Badge>
                  ))
                ) : catalogFont ? (
                  <Badge variant="outline" style={{ fontFamily: catalogFont.name }}>
                    {catalogFont.name}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">No font assigned</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <span className="font-medium text-muted-foreground">Description:</span>
              <p className="text-lg mt-1">{catalog.description || 'No description'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      {catalog.images && catalog.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Images ({catalog.images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {catalog.images.map((image, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${catalog.title} image ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3D Models */}
      {catalog.files && catalog.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3D Models ({catalog.files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {catalog.files.map((file, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  {/* File Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Download className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {catalog.title} - Model {index + 1}
                        </h4>
                        <p className="text-sm text-gray-500">STL 3D Model</p>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleDownloadSTL(file, `${catalog.title}_${index + 1}.stl`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download STL
                    </Button>
                  </div>
                  
                  {/* 3D Viewer */}
                  <div className="relative">
                    <div className="h-96 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <STLViewer 
                        url={file} 
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* Viewer Controls Info */}
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500">
                        💡 Drag to rotate • Scroll to zoom • Right-click to pan
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Lightbox */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
          {selectedImageIndex !== null && catalog.images[selectedImageIndex] && (
            <div className="relative w-full h-full">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSelectedImageIndex(null)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Previous Button */}
              {selectedImageIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* Next Button */}
              {selectedImageIndex < catalog.images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Image */}
              <div className="flex items-center justify-center p-4">
                <Image
                  src={catalog.images[selectedImageIndex]}
                  alt={`${catalog.title} image ${selectedImageIndex + 1}`}
                  width={1200}
                  height={1200}
                  className="max-w-full max-h-[85vh] object-contain"
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {catalog.images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
