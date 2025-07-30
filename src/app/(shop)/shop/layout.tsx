"use client"
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { Home, UserPlus, Users, List, Book, Bell, LogOut, User } from 'lucide-react';


const sidebarLinks = [
  { href: '/shop', label: 'Dashboard', icon: <Home size={18} /> },
  { href: '/shop/add-salesman', label: 'Add Salesman', icon: <UserPlus size={18} /> },
  { href: '/shop/approval', label: 'Salesman Approval', icon: <Users size={18} /> },
  { href: '/shop/salesmen', label: 'Salesman Management', icon: <Users size={18} /> },
  { href: '/shop/orders', label: 'Orders', icon: <List size={18} /> },
  { href: '/shop/catalogue', label: 'Catalogue', icon: <Book size={18} /> },
  { href: '/shop/profile', label: 'Profile', icon: <User size={18} /> },
  { href: '/shop/notifications', label: 'Notifications', icon: <Bell size={18} /> },
];


export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-muted border-r p-4 flex flex-col gap-2">
        <div className="text-xl font-bold mb-4">Shop Dashboard</div>
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