"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Eye, Edit, Trash2, Plus, Search, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import STLViewer from '@/components/STLViewer';

interface Catalog {
  _id: string;
  title: string;
  style: string;
  size: string;
  weight: number;
  description: string;
  images: string[];
  files: string[];
  font?: string;
  createdAt: string;
  updatedAt: string;
}

interface Font {
  _id: string;
  name: string;
  files: string[];
}

export default function AdminCatalogsPage() {
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fonts, setFonts] = useState<Font[]>([]);
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

  // Filter catalogs based on search term
  const filteredCatalogs = catalogs?.filter(catalog =>
    catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalog.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
    catalog.style.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
    <div className="space-y-6 p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogs</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/catalogs/add">
          <Button>
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search catalogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedCatalogs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Font</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCatalogs.map((catalog) => {
                    const catalogFont = fonts.find(f => f._id === catalog.font);
                    return (
                    <TableRow key={catalog._id}>
                      <TableCell className="font-medium">{catalog.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {catalog.style}
                        </Badge>
                      </TableCell>
                      <TableCell>{catalog.size}</TableCell>
                      <TableCell>{formatWeight(catalog.weight)}</TableCell>
                      <TableCell>
                        {catalogFont ? (
                          <Badge variant="outline" style={{ fontFamily: catalogFont.name }}>
                            {catalogFont.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No font</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {catalog.images?.length || 0} images
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {catalog.files?.length || 0} files
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={isViewDialogOpen && selectedCatalog?._id === catalog._id} onOpenChange={(open: boolean) => {
                            if (open) {
                              setSelectedCatalog(catalog);
                              setIsViewDialogOpen(true);
                            } else {
                              setIsViewDialogOpen(false);
                              setSelectedCatalog(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{catalog.title}</DialogTitle>
                                <DialogDescription>
                                  Complete catalog details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Basic Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Title:</span> {catalog.title}</div>
                                    <div><span className="font-medium">Style:</span> <Badge variant="secondary" className="bg-blue-100 text-blue-700 ml-2">{catalog.style}</Badge></div>
                                    <div><span className="font-medium">Size:</span> {catalog.size}</div>
                                    <div><span className="font-medium">Weight:</span> {formatWeight(catalog.weight)}</div>
                                    <div><span className="font-medium">Font:</span> {(() => {
                                      const catalogFont = fonts.find(f => f._id === catalog.font);
                                      return catalogFont ? (
                                        <Badge variant="outline" className="ml-2" style={{ fontFamily: catalogFont.name }}>
                                          {catalogFont.name}
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground ml-2">No font assigned</span>
                                      );
                                    })()}</div>
                                    <div><span className="font-medium">Description:</span> {catalog.description}</div>
                                  </div>
                                </div>
                                
                                {catalog.images && catalog.images.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Images ({catalog.images.length})</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {catalog.images.map((image, index) => (
                                        <Image
                                          key={index}
                                          src={image}
                                          alt={`${catalog.title} image ${index + 1}`}
                                          width={100}
                                          height={100}
                                          className="w-full h-32 object-cover rounded-lg"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {catalog.files && catalog.files.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">3D Models ({catalog.files.length})</h4>
                                    <div className="space-y-4">
                                      {catalog.files.map((file, index) => (
                                        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
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
                                            <div className="h-80 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
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
                                  </div>
                                )}
                                

                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Link href={`/admin/catalogs/edit/${catalog._id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
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
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCatalogs.length)} of {filteredCatalogs.length} catalogs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
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
