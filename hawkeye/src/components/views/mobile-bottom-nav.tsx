"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BarChartSquare02,
  Plus,
  SearchLg,
} from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import type { ObjectMetadata } from "@/lib/twenty/types";
import { ENTITIES } from "@/lib/entity-config";
import { cx } from "@/utils/cx";

interface MobileBottomNavProps {
  objects: ObjectMetadata[];
  currentObjectSlug: string;
  onSearchOpen: () => void;
  onCreateOpen: () => void;
}

export function MobileBottomNav({
  objects,
  currentObjectSlug,
  onSearchOpen,
  onCreateOpen,
}: MobileBottomNavProps) {
  const router = useRouter();
  const [isObjectPickerOpen, setIsObjectPickerOpen] = useState(false);

  const handleEntitySelect = useCallback(
    (slug: string) => {
      router.push(`/${slug}`);
      setIsObjectPickerOpen(false);
    },
    [router],
  );

  // Check if current slug matches any entity
  const isEntityActive = useCallback(
    (slug: string) => {
      return currentObjectSlug === slug;
    },
    [currentObjectSlug],
  );

  return (
    <>
      {/* Entity picker dropdown */}
      <AnimatePresence>
        {isObjectPickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-overlay/50"
              onClick={() => setIsObjectPickerOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="fixed bottom-[72px] left-3 right-3 z-50 rounded-xl border border-secondary bg-primary shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-secondary">
                <h3 className="text-xs font-semibold text-quaternary uppercase tracking-wider">
                  Entities
                </h3>
              </div>
              <ul className="max-h-[50vh] overflow-y-auto py-1">
                {ENTITIES.map((entity) => {
                  const EntityIcon = entity.icon;
                  return (
                    <li key={entity.slug}>
                      <button
                        onClick={() => handleEntitySelect(entity.slug)}
                        className={cx(
                          "flex w-full items-center gap-3 px-4 py-3 text-sm transition duration-100 ease-linear min-h-[44px]",
                          isEntityActive(entity.slug)
                            ? "bg-active text-primary font-medium"
                            : "text-secondary hover:bg-primary_hover",
                        )}
                      >
                        <EntityIcon className="size-4 shrink-0 text-fg-quaternary" />
                        <span>{entity.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-secondary bg-primary lg:hidden safe-area-bottom">
        <div className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {/* Dashboard */}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-fg-tertiary hover:text-fg-secondary transition duration-100 ease-linear min-h-[56px]"
            aria-label="Dashboard"
          >
            <BarChartSquare02 className="size-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>

          {/* Entities */}
          <button
            onClick={() => setIsObjectPickerOpen((prev) => !prev)}
            className={cx(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition duration-100 ease-linear min-h-[56px]",
              isObjectPickerOpen
                ? "text-fg-brand-primary"
                : "text-fg-tertiary hover:text-fg-secondary",
            )}
            aria-label="Entities"
          >
            <BarChartSquare02 className="size-5" />
            <span className="text-[10px] font-medium">Entities</span>
          </button>

          {/* Create */}
          <button
            onClick={onCreateOpen}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px]"
            aria-label="Create new record"
          >
            <div className="flex items-center justify-center rounded-full bg-brand-solid size-8">
              <Plus className="size-4 text-fg-white" />
            </div>
            <span className="text-[10px] font-medium text-fg-brand-primary">Create</span>
          </button>

          {/* Search */}
          <button
            onClick={onSearchOpen}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-fg-tertiary hover:text-fg-secondary transition duration-100 ease-linear min-h-[56px]"
            aria-label="Search"
          >
            <SearchLg className="size-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
        </div>
      </nav>
    </>
  );
}
