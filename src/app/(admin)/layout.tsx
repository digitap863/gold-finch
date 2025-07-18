import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ActiveThemeProvider } from "@/components/ui/active-theme";

import React from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";



const adminLayout = async ({ children }: { children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");
  return (
    <div
      className={cn(
        "bg-background overscroll-none font-sans antialiased",
        activeThemeValue ? `theme-${activeThemeValue}` : "",
        isScaled ? "theme-scaled" : ""
      )}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <ActiveThemeProvider initialTheme={activeThemeValue}>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ActiveThemeProvider>
      </ThemeProvider>
    </div>
  );
};

export default adminLayout;
