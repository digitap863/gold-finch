"use client";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronRightCircle, Eye, Package, Search, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  files?: string[];
  font?: string; // legacy single font
  fonts?: string[]; // new multiple fonts
  category?: string;
  material?: "Gold" | "Diamond";
  audience?: "Men" | "Women" | "Kids" | "All";
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ITEMS_PER_PAGE = 15;

const CatalogsPage = () => {
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [fonts, setFonts] = useState<Font[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCatalogs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", ITEMS_PER_PAGE.toString());
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (categoryFilter && categoryFilter !== "all") params.set("category", categoryFilter);

      const response = await fetch(`/api/admin/catalogs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch catalogs');
      }
      const data = await response.json();
      setCatalogs(data.catalogs || []);
      setPagination(data.pagination || {
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      toast.error('Failed to load catalogs');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter]);

  useEffect(() => {
    fetchFonts();
    fetchCategories();
  }, []);

  // Fetch catalogs when search or category changes (reset to page 1)
  useEffect(() => {
    fetchCatalogs(1);
  }, [fetchCatalogs]);

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
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
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

  const handleViewCatalog = (catalog: Catalog) => {
    router.push(`/salesman/catalogs/${catalog._id}`);
  };

  const handleOrderNow = (catalog: Catalog) => {
    // Navigate to create order page with catalog data
    window.location.href = `/salesman/create-order?catalogId=${catalog._id}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCatalogs(newPage);
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            placeholder="Search catalogs by model ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Catalog Grid */}
      {catalogs.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No catalogs found</h3>
          <p className="text-muted-foreground">
            {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your search or filters' : 'No catalogs available yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {catalogs.map((catalog) => {
              return (
                <Card key={catalog._id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-gray-200">
                  <CardHeader className="pb-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {catalog.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-gray-600">
                          {catalog.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        {catalog.size && (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {catalog.size}
                          </Badge>
                        )}
                        {catalog.material && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {catalog.material}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                
                  <CardContent className="space-y-4">
                    {/* Image Preview */}
                    {catalog.images && catalog.images.length > 0 && (
                      <div className="relative h-76 bg-gray-100 rounded-lg overflow-hidden">
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
                        <span className="text-gray-500">Model:</span>
                        <span className="font-medium text-gray-900">{catalog.style}</span>
                      </div>
                      {catalog.audience && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Audience:</span>
                          <span className="font-medium text-gray-900">{catalog.audience}</span>
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} catalogs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="h-9 w-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="h-9 px-3"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CatalogsPage;
