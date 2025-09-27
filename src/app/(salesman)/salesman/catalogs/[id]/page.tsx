"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Download, Package, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import STLViewer from '@/components/STLViewer';

interface Catalog {
  _id: string;
  title: string;
  style: string;
  size?: string;
  width?: number;
  weight?: number;
  description?: string;
  images: string[];
  files?: string[];
  font?: string; // legacy single font
  fonts?: string[]; // new multiple fonts
  category?: string;
  material?: "Gold" | "Diamond";
  audience?: "Men" | "Women" | "Kids";
  createdAt: string;
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

const CatalogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewName, setPreviewName] = useState('');
  const [selectedFontId, setSelectedFontId] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCatalog();
      fetchFonts();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/catalogs/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch catalog');
      }
      const data = await response.json();
      console.log('Catalog data:', data);
      console.log('Files array:', data.files);
      setCatalog(data);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      toast.error('Failed to load catalog details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFonts = async () => {
    try {
      const res = await fetch('/api/admin/fonts');
      const data = await res.json();
      setFonts(data.fonts || []);
    } catch {
      setFonts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    }
  };

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

  const handleOrderNow = () => {
    if (catalog) {
      router.push(`/salesman/create-order?catalogId=${catalog._id}`);
    }
  };

  const handleDownloadSTL = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('STL file download started');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading catalog details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Catalog not found</h3>
          <p className="text-muted-foreground mb-4">The catalog you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const catalogFont = fonts.find(f => f._id === catalog.font);
  const catalogCategory = categories.find(c => c._id === catalog.category);
  const selectedFont = fonts.find(f => f._id === selectedFontId);

  return (
    <div className="container mx-auto p-4 sm:p-6 mt-20 sm:mt-10">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalogs
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {catalog.title}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-3">
              {catalog.description || 'No description available'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs sm:text-sm">
                {catalog.style}
              </Badge>
              {catalog.size && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs sm:text-sm">
                  {catalog.size}
                </Badge>
              )}
              {catalog.material && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs sm:text-sm">
                  {catalog.material}
                </Badge>
              )}
              {catalog.audience && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs sm:text-sm">
                  {catalog.audience}
                </Badge>
              )}
              {catalog.weight && (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {catalog.weight}g
                </Badge>
              )}
              {catalogFont && (
                <Badge variant="outline" className="text-xs sm:text-sm" style={{ fontFamily: catalogFont.name }}>
                  {catalogFont.name}
                </Badge>
              )}
              {catalogCategory && (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {catalogCategory.name}
                </Badge>
              )}
            </div>
          </div>
          
          <Button
            variant="default"
            size="lg"
            className="bg-black hover:bg-gray-800 text-white w-full lg:w-auto"
            onClick={handleOrderNow}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Order Now
          </Button>
        </div>
      </div>

      {/* Images Gallery */}
      {catalog.images && catalog.images.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>{catalog.images.length} image{catalog.images.length > 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {catalog.images.map((image, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${catalog.title} image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      

      {/* Font Preview Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Font Preview</CardTitle>
          <CardDescription>Type a name and see how it looks in different fonts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="preview-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Name
                </label>
                <input
                  id="preview-name"
                  type="text"
                  placeholder="Type a name here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={previewName}
                  onChange={(e) => setPreviewName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="preview-font" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Font
                </label>
                <select
                  id="preview-font"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedFontId}
                  onChange={(e) => setSelectedFontId(e.target.value)}
                >
                  <option value="">Choose a font...</option>
                  {fonts.map((font) => (
                    <option key={font._id} value={font._id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {previewName && selectedFontId && (
              <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview:</h3>
                <div className="text-center">
                  <div 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 break-words"
                    style={{ 
                      fontFamily: selectedFont?.name || 'inherit',
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {previewName}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Font: {selectedFont?.name || 'Default'}
                  </p>
                </div>
              </div>
            )}
            
            {(!previewName || !selectedFontId) && (
              <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-gray-500">
                  {!previewName && !selectedFontId 
                    ? "Enter a name and select a font to see the preview"
                    : !previewName 
                    ? "Enter a name to see the preview"
                    : "Select a font to see the preview"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Style</span>
              <p className="font-medium text-sm sm:text-base">{catalog.style}</p>
            </div>
            {catalog.size && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Size</span>
                <p className="font-medium text-sm sm:text-base">{catalog.size}</p>
              </div>
            )}
            {catalog.width && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Width</span>
                <p className="font-medium text-sm sm:text-base">{catalog.width}mm</p>
              </div>
            )}
            {catalog.weight && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Weight</span>
                <p className="font-medium text-sm sm:text-base">{catalog.weight}g</p>
              </div>
            )}
            {catalog.material && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Material</span>
                <p className="font-medium text-sm sm:text-base">{catalog.material}</p>
              </div>
            )}
            {catalog.audience && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Audience</span>
                <p className="font-medium text-sm sm:text-base">{catalog.audience}</p>
              </div>
            )}
            {catalogCategory && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Category</span>
                <p className="font-medium text-sm sm:text-base">{catalogCategory.name}</p>
              </div>
            )}
            {catalog.fonts && catalog.fonts.length > 0 ? (
              <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                <span className="text-xs sm:text-sm text-muted-foreground">Fonts</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {catalog.fonts.map((fontId, index) => {
                    const font = fonts.find(f => f._id === fontId);
                    return font ? (
                      <Badge key={index} variant="outline" className="text-xs" style={{ fontFamily: font.name }}>
                        {font.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            ) : catalogFont && (
              <div>
                <span className="text-xs sm:text-sm text-muted-foreground">Font</span>
                <p className="font-medium text-sm sm:text-base" style={{ fontFamily: catalogFont.name }}>
                  {catalogFont.name}
                </p>
              </div>
            )}
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Images</span>
              <p className="font-medium text-sm sm:text-base">{catalog.images.length}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">3D Models</span>
              <p className="font-medium text-sm sm:text-base">{catalog.files?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogDetailPage;
