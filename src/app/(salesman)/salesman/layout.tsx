"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, PlusCircle, List, Bell, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { href: "/salesman", label: "Dashboard", icon: <Home size={18} /> },
  { href: "/salesman/create-order", label: "Create New Order", icon: <PlusCircle size={18} /> },
  { href: "/salesman/track-orders", label: "Track Orders", icon: <List size={18} /> },
  { href: "/salesman/notifications", label: "Notifications", icon: <Bell size={18} /> },
  { href: "/salesman/profile", label: "Profile", icon: <User size={18} /> },
];

export default function SalesmanLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted border-r p-4 flex flex-col gap-2">
        <div className="text-xl font-bold mb-4">Salesman Dashboard</div>
        {sidebarLinks.map((link) => (
          <Link key={link.href} href={link.href}>
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
          <Button variant="destructive" className="w-full flex items-center gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 bg-background overflow-y-auto">{children}</main>
    </div>
  );
} 