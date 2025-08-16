"use client";


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, Package, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
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
    router.push(`/salesman/catalogs/${catalog._id}`);
  };

  const handleOrderNow = (catalog: Catalog) => {
    // Navigate to create order page with catalog data
    window.location.href = `/salesman/create-order?catalogId=${catalog._id}`;
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
                      <CardTitle className="text-lg font-semibold text-gray-900">
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
                      <span className="text-gray-500">Style:</span>
                      <span className="font-medium text-gray-900">{catalog.style}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-medium text-gray-900">{catalog.weight}g</span>
                    </div>
                    {catalogFont && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Font:</span>
                        <span className="font-medium text-gray-900" style={{ fontFamily: catalogFont.name }}>
                          {catalogFont.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      variant="default"
                      size="default"
                      className="w-full bg-black hover:bg-black/80 text-white h-12 text-base font-semibold"
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
    </div>
  );
};

export default CatalogsPage;
