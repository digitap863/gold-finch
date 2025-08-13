"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, PlusCircle, List, Bell, User, LogOut, Package, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const sidebarLinks = [
  { href: "/salesman", label: "Dashboard", icon: <Home size={18} /> },
  { href: "/salesman/create-order", label: "Create New Order", icon: <PlusCircle size={18} /> },
  { href: "/salesman/track-orders", label: "Track Orders", icon: <List size={18} /> },
  { href: "/salesman/notifications", label: "Notifications", icon: <Bell size={18} /> },
  { href: "/salesman/profile", label: "Profile", icon: <User size={18} /> },
  { href: "/salesman/catalogs", label: "Catalogs", icon: <Package size={18} /> },
];

export default function SalesmanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      router.push("/");
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message || "Logout failed");
      } else {
        toast.error("Logout failed");
      }
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const SidebarContent = () => (
    <>
      <div className="text-xl font-bold mb-4">Dashboard</div>
      {sidebarLinks.map((link) => (
        <Link key={link.href} href={link.href} onClick={() => isMobile && setSidebarOpen(false)}>
          <Button
            variant={pathname === link.href ? 'secondary' : 'ghost'}
            className="w-full justify-start flex items-center gap-2"
          >
            {link.icon}
            {link.label}
          </Button>
        </Link>
      ))}
      <div className="mt-auto pt-4">
        <Button 
          variant="destructive" 
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut size={18} /> 
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-muted border-r p-4 flex-col gap-2">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden fixed top-4 left-4 z-50">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 