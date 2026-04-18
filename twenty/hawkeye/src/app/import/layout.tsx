"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useMetadata } from "@/lib/hooks/use-metadata";
import { AppSidebar } from "@/components/views/app-sidebar";
import { CommandPaletteProvider } from "@/components/views/command-palette-provider";

export default function ImportLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { getNavigableObjects, loading } = useMetadata();

  const navigableObjects = getNavigableObjects();

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-dvh">
        <AppSidebar
          objects={navigableObjects}
          activeUrl={pathname}
          loading={loading}
        />
        <main className="flex-1 overflow-hidden lg:pl-0">{children}</main>
      </div>
    </CommandPaletteProvider>
  );
}
