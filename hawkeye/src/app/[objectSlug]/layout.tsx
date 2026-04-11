"use client";

import type { ReactNode } from "react";
import { use, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { AppSidebar } from "@/components/views/app-sidebar";
import { MobileHeader } from "@/components/views/mobile-header";
import { MobileBottomNav } from "@/components/views/mobile-bottom-nav";
import { CommandPaletteProvider } from "@/components/views/command-palette-provider";

export default function ObjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ objectSlug: string }>;
}) {
  const { objectSlug } = use(params);
  const pathname = usePathname();
  const { getNavigableObjects, getObject, loading } = useMetadata();
  const isDesktop = useBreakpoint("lg");

  const navigableObjects = getNavigableObjects();
  const currentObject = getObject(objectSlug);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Expose a search-open function that dispatches Cmd+K
  const openSearch = useCallback(() => {
    // Simulate Cmd+K to open the command palette
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, []);

  // For the mobile bottom nav create button, we dispatch a custom event
  // that the page component can listen to
  const openCreate = useCallback(() => {
    const event = new CustomEvent("hawkeye:create-record");
    document.dispatchEvent(event);
  }, []);

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-dvh">
        {/* Sidebar */}
        <AppSidebar
          objects={navigableObjects}
          activeUrl={pathname}
          loading={loading}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile header: visible only below lg */}
          <div className="lg:hidden">
            <MobileHeader
              objectName={currentObject?.labelPlural ?? objectSlug}
              onMenuOpen={() => setIsMobileSidebarOpen(true)}
              onSearchOpen={openSearch}
            />
          </div>

          {/* Page content with bottom padding on mobile for bottom nav */}
          <div className="flex-1 overflow-hidden lg:pb-0 pb-[72px]">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav: visible only below lg */}
        <div className="lg:hidden">
          <MobileBottomNav
            objects={navigableObjects}
            currentObjectSlug={objectSlug}
            onSearchOpen={openSearch}
            onCreateOpen={openCreate}
          />
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
