"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
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
  font?: string; // legacy single font
  fonts?: string[]; // new multiple fonts
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

export default function AdminCatalogsPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fonts, setFonts] = useState<Font[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    material: "all",
    audience: "all",
    category: "all",
  });
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  // Fetch fonts
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const res = await fetch('/api/admin/fonts');
        const data = await res.json();
        setFonts(data.fonts || []);
      } catch {
        setFonts([]);
      }
    };
    fetchFonts();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
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

  // Fetch catalogs
  const { data: catalogs, isLoading, error } = useQuery({
    queryKey: ["catalogs"],
    queryFn: async (): Promise<Catalog[]> => {
      const res = await fetch("/api/admin/catalogs");
      if (!res.ok) {
        throw new Error("Failed to fetch catalogs");
      }
      return res.json();
    },
  });

  // Delete catalog
  const deleteMutation = useMutation({
    mutationFn: async (catalogId: string) => {
      const res = await fetch(`/api/admin/catalogs/${catalogId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete catalog");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Catalog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["catalogs"] });
      setIsDeleteDialogOpen(false);
      setSelectedCatalog(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Filter catalogs based on search term and filters
  const filteredCatalogs = catalogs?.filter(catalog => {
    const matchesSearch = 
      catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      catalog.style.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMaterial = filters.material === "all" || catalog.material === filters.material;
    const matchesAudience = filters.audience === "all" || catalog.audience === filters.audience;
    const matchesCategory = filters.category === "all" || catalog.category === filters.category;
    
    return matchesSearch && matchesMaterial && matchesAudience && matchesCategory;
  }) || [];

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCatalogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCatalogs = filteredCatalogs.slice(startIndex, endIndex);

  const formatWeight = (weight: number) => {
    return `${weight} grams`;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading catalogs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading catalogs</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:p-10 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Catalogs</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/add-catalogs" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Catalog
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Catalogs</CardTitle>
          <CardDescription>
            View, edit, and delete catalog items
          </CardDescription>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search catalogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
              
              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-2">
                <Select value={filters.material} onValueChange={(value) => setFilters(prev => ({ ...prev, material: value }))}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.audience} onValueChange={(value) => setFilters(prev => ({ ...prev, audience: value }))}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    <SelectItem value="Men">Men</SelectItem>
                    <SelectItem value="Women">Women</SelectItem>
                    <SelectItem value="Kids">Kids</SelectItem>
                    <SelectItem value="All">All</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({ material: "all", audience: "all", category: "all" });
                    setSearchTerm("");
                  }}
                  className="w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="flex items-center justify-between md:text-sm text-xs text-muted-foreground">
              <div>
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCatalogs.length)} of {filteredCatalogs.length} catalogs
                {(searchTerm || filters.material !== "all" || filters.audience !== "all" || filters.category !== "all") && (
                  <span className="ml-2">
                    (filtered from {catalogs?.length || 0} total)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <Select value={itemsPerPage.toString()} onValueChange={() => {
                  // Note: itemsPerPage is currently fixed, but this could be made dynamic
                }}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedCatalogs.length > 0 ? (
            <>
              <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead className="hidden md:table-cell">Size</TableHead>
                    <TableHead className="hidden lg:table-cell">Width</TableHead>
                    <TableHead className="hidden lg:table-cell">Weight</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="hidden sm:table-cell">Material</TableHead>
                    <TableHead className="hidden sm:table-cell">Audience</TableHead>
                    <TableHead className="hidden xl:table-cell">Fonts</TableHead>
                    <TableHead className="hidden lg:table-cell">Images</TableHead>
                    <TableHead className="hidden lg:table-cell">Files</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCatalogs.map((catalog) => {
                    const catalogFont = fonts.find(f => f._id === catalog.font);
                    const catalogFonts = catalog.fonts ? catalog.fonts.map(fontId => fonts.find(f => f._id === fontId)).filter(Boolean) : [];
                    const catalogCategory = categories.find(c => c._id === catalog.category);
                    return (
                    <TableRow key={catalog._id}>
                      <TableCell className="font-medium">{catalog.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {catalog.style}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{catalog.size || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{catalog.width ? `${catalog.width}mm` : '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatWeight(catalog.weight || 0)}</TableCell>
                      <TableCell>
                        {catalogCategory ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {catalogCategory.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {catalog.material ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            {catalog.material}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {catalog.audience ? (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {catalog.audience}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {catalogFonts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {catalogFonts.slice(0, 2).map((font, index) => (
                              <Badge key={index} variant="outline" style={{ fontFamily: font?.name }}>
                                {font?.name}
                              </Badge>
                            ))}
                            {catalogFonts.length > 2 && (
                              <Badge variant="outline">+{catalogFonts.length - 2}</Badge>
                            )}
                          </div>
                        ) : catalogFont ? (
                          <Badge variant="outline" style={{ fontFamily: catalogFont.name }}>
                            {catalogFont.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No font</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="secondary">
                          {catalog.images?.length || 0} images
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">
                          {catalog.files?.length || 0} files
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/catalogs/${catalog._id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:py-2">
                              <Eye className="h-4 w-4 sm:mr-1.5" />
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </Link>
                          
                          <Link href={`/admin/catalogs/edit/${catalog._id}`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:py-2">
                              <Edit className="h-4 w-4 sm:mr-1.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </Link>
                          
                          <Dialog open={isDeleteDialogOpen && selectedCatalog?._id === catalog._id} onOpenChange={(open: boolean) => {
                            if (open) {
                              setSelectedCatalog(catalog);
                              setIsDeleteDialogOpen(true);
                            } else {
                              setIsDeleteDialogOpen(false);
                              setSelectedCatalog(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3 sm:py-2">
                                <Trash2 className="h-4 w-4 sm:mr-1.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Catalog</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;{catalog.title}&quot;? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setSelectedCatalog(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteMutation.mutate(catalog._id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCatalogs.length)} of {filteredCatalogs.length} catalogs
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No catalogs found matching your search" : "No catalogs found"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
