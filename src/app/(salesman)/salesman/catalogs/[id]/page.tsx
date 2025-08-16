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
  size: string;
  weight: number;
  description?: string;
  images: string[];
  files?: string[];
  font?: string;
  createdAt: string;
}

interface Font {
  _id: string;
  name: string;
  files: string[];
}

const CatalogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [fonts, setFonts] = useState<Font[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchCatalog();
      fetchFonts();
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
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs sm:text-sm">
                {catalog.size}
              </Badge>
              <Badge variant="outline" className="text-xs sm:text-sm">
                {catalog.weight}g
              </Badge>
              {catalogFont && (
                <Badge variant="outline" className="text-xs sm:text-sm" style={{ fontFamily: catalogFont.name }}>
                  {catalogFont.name}
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

      {/* 3D Models */}
      {catalog.files && catalog.files.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>3D Models</CardTitle>
                <CardDescription>{catalog.files.length} STL file{catalog.files.length > 1 ? 's' : ''}</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Interactive View
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {catalog.files.map((file, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  {/* File Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {catalog.title} - Model {index + 1}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500">STL 3D Model</p>
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-black hover:bg-gray-800 text-white w-full sm:w-auto"
                      onClick={() => handleDownloadSTL(file, `${catalog.title}_${index + 1}.stl`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download STL
                    </Button>
                  </div>
                  
                  {/* 3D Viewer */}
                  <div className="relative">
                    <div className="h-64 sm:h-80 md:h-96 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <STLViewer 
                        url={file} 
                        className="w-full h-full"
                      />
                    </div>
                    
                    {/* Viewer Controls Info */}
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500 px-2">
                        💡 Touch to rotate • Pinch to zoom • Mobile-friendly controls
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        catalog.files !== undefined && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3D Models</CardTitle>
              <CardDescription>No 3D models available for this catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No STL files have been uploaded for this catalog yet.</p>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Product Details */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Style</span>
              <p className="font-medium text-sm sm:text-base">{catalog.style}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Size</span>
              <p className="font-medium text-sm sm:text-base">{catalog.size}</p>
            </div>
            <div>
              <span className="text-xs sm:text-sm text-muted-foreground">Weight</span>
              <p className="font-medium text-sm sm:text-base">{catalog.weight}g</p>
            </div>
            {catalogFont && (
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
