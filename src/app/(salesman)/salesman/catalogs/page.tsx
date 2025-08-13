"use client";


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, Download, Package, ShoppingCart } from "lucide-react";
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

const CatalogsPage = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [fonts, setFonts] = useState<Font[]>([]);

  useEffect(() => {
    fetchCatalogs();
    fetchFonts();
  }, []);

  const fetchCatalogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/catalogs');
      if (!response.ok) {
        throw new Error('Failed to fetch catalogs');
      }
      const data = await response.json();
      setCatalogs(data);
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast.error('Failed to load catalogs');
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

  const filteredCatalogs = catalogs.filter(catalog => {
    const matchesSearch = catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         catalog.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = sizeFilter === 'all' || catalog.size.toLowerCase() === sizeFilter.toLowerCase();
    return matchesSearch && matchesSize;
  });

  const handleViewCatalog = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
  };

  const handleOrderNow = (catalog: Catalog) => {
    // Navigate to create order page with catalog data
    window.location.href = `/salesman/create-order?catalogId=${catalog._id}`;
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
            <p className="text-muted-foreground">Loading catalogs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 mt-10">
        <h1 className="text-2xl md:text-3xl font-bold">Catalogs</h1>
        <p className="text-muted-foreground">Browse available catalog items</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search catalogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Catalog Grid */}
      {filteredCatalogs.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No catalogs found</h3>
          <p className="text-muted-foreground">
            {searchTerm || sizeFilter !== 'all' ? 'Try adjusting your search or filters' : 'No catalogs available yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCatalogs.map((catalog) => {
            const catalogFont = fonts.find(f => f._id === catalog.font);
            return (
              <Card key={catalog._id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle
                        className="text-lg font-semibold text-gray-900"
                        style={catalogFont ? { fontFamily: catalogFont.name } : {}}
                      >
                        {catalog.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600">
                        {catalog.description || 'No description available'}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                      {catalog.size}
                    </Badge>
                  </div>
                </CardHeader>
              
                <CardContent className="space-y-4">
                  {/* Image Preview */}
                  {catalog.images && catalog.images.length > 0 && (
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={catalog.images[0]}
                        alt={catalog.title}
                        fill
                        className="object-cover"
                      />
                      {catalog.images.length > 1 && (
                        <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                          +{catalog.images.length - 1} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Catalog Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-medium text-gray-900">{catalog.weight}g</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      variant="default"
                      size="default"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
                      onClick={() => handleOrderNow(catalog)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Order Now
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full h-10"
                      onClick={() => handleViewCatalog(catalog)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Catalog Detail Modal */}
      {selectedCatalog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCatalog.title}</h2>
                  <p className="text-muted-foreground">{selectedCatalog.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCatalog(null)}
                >
                  ✕
                </Button>
              </div>

              {/* Images Gallery */}
              {selectedCatalog.images && selectedCatalog.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Images</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedCatalog.images.map((image, index) => (
                      <div key={index} className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${selectedCatalog.title} image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STL Files - Only shown in detail view */}
              {selectedCatalog.files && selectedCatalog.files.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">3D Models</h3>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      {selectedCatalog.files.length} file{selectedCatalog.files.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-6">
                    {selectedCatalog.files.map((file, index) => (
                      <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        {/* File Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {selectedCatalog.title} - Model {index + 1}
                              </h4>
                              <p className="text-sm text-gray-500">STL 3D Model</p>
                            </div>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleDownloadSTL(file, `${selectedCatalog.title}_${index + 1}.stl`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download STL
                          </Button>
                        </div>
                        
                                                 {/* 3D Viewer */}
                         <div className="relative">
                           <div className="h-80 sm:h-96 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
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
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Size</span>
                  <p className="font-medium">{selectedCatalog.size}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <p className="font-medium">{selectedCatalog.weight}g</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Images</span>
                  <p className="font-medium">{selectedCatalog.images.length}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">3D Models</span>
                  <p className="font-medium">{selectedCatalog.files?.length || 0}</p>
                </div>
              </div>

              {/* Order Now Button in Modal */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleOrderNow(selectedCatalog)}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Order Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogsPage;
