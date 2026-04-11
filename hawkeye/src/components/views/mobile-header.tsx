"use client";

import { Menu02, SearchLg } from "@untitledui/icons";
import { Cube01 } from "@untitledui/icons";

interface MobileHeaderProps {
  objectName: string;
  onMenuOpen: () => void;
  onSearchOpen: () => void;
}

export function MobileHeader({
  objectName,
  onMenuOpen,
  onSearchOpen,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-secondary bg-primary px-3 lg:hidden">
      {/* Left: hamburger */}
      <button
        onClick={onMenuOpen}
        className="flex items-center justify-center rounded-lg p-2 text-fg-secondary hover:bg-primary_hover hover:text-fg-secondary_hover transition duration-100 ease-linear min-h-[44px] min-w-[44px]"
        aria-label="Open navigation menu"
      >
        <Menu02 className="size-5" />
      </button>

      {/* Center: object name */}
      <div className="flex items-center gap-2">
        <Cube01 className="size-4 text-fg-brand-primary md:hidden" />
        <h1 className="text-sm font-semibold text-primary truncate max-w-[200px]">
          {objectName}
        </h1>
      </div>

      {/* Right: search */}
      <button
        onClick={onSearchOpen}
        className="flex items-center justify-center rounded-lg p-2 text-fg-secondary hover:bg-primary_hover hover:text-fg-secondary_hover transition duration-100 ease-linear min-h-[44px] min-w-[44px]"
        aria-label="Open search"
      >
        <SearchLg className="size-5" />
      </button>
    </header>
  );
}
