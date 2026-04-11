"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, SearchLg } from "@untitledui/icons";
import { Link as AriaLink } from "react-aria-components";
import { AnimatePresence, motion } from "motion/react";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { cx } from "@/utils/cx";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountCard } from "../base-components/nav-account-card";
import { NavItemBase } from "../base-components/nav-item";
import type { NavItemType } from "../config";
import type { GroupedNavItem } from "@/components/views/app-sidebar";

// Persist expanded group state in localStorage
const STORAGE_KEY = "hawkeye-sidebar-expanded-groups";

function loadExpandedGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

function saveExpandedGroups(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

interface SidebarNavigationGroupedProps {
  activeUrl?: string;
  groupedItems: GroupedNavItem[];
  ungroupedItems?: NavItemType[];
  footerItems?: NavItemType[];
  featureCard?: ReactNode;
  showAccountCard?: boolean;
  hideBorder?: boolean;
  className?: string;
}

export const SidebarNavigationGrouped = ({
  activeUrl,
  groupedItems,
  ungroupedItems = [],
  footerItems = [],
  featureCard,
  showAccountCard = true,
  hideBorder = false,
  className,
}: SidebarNavigationGroupedProps) => {
  const MAIN_SIDEBAR_WIDTH = 280;

  const content = (
    <aside
      style={
        {
          "--width": `${MAIN_SIDEBAR_WIDTH}px`,
        } as React.CSSProperties
      }
      className={cx(
        "flex h-full w-full max-w-full flex-col justify-between overflow-auto bg-primary pt-4 lg:w-(--width) lg:pt-5",
        !hideBorder && "border-secondary md:border-r",
        className,
      )}
    >
      <div className="flex flex-col gap-5 px-4 lg:px-5">
        <UntitledLogo className="h-6" />

        {/* Mobile search input */}
        <Input size="md" aria-label="Search" placeholder="Search" icon={SearchLg} className="md:hidden" />

        {/* Desktop search input */}
        <Input shortcut size="sm" aria-label="Search" placeholder="Search" icon={SearchLg} className="max-md:hidden" />
      </div>

      {/* Dashboard link */}
      <div className="px-4 pt-4">
        <NavItemBase
          type="link"
          href="/dashboard"
          current={activeUrl === "/dashboard"}
          icon={undefined}
        >
          Dashboard
        </NavItemBase>
      </div>

      {/* Grouped navigation */}
      <div className="flex-1 overflow-y-auto px-4 pt-3">
        {groupedItems.map((group) => (
          <GroupSection
            key={group.groupKey}
            group={group}
            activeUrl={activeUrl}
          />
        ))}

        {/* Ungrouped items */}
        {ungroupedItems.length > 0 && (
          <div className="mt-2">
            <div className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-quaternary">
              Other
            </div>
            <ul className="flex flex-col">
              {ungroupedItems.map((item) => (
                <li key={item.label} className="py-px">
                  <NavItemBase
                    type="link"
                    badge={item.badge}
                    icon={item.icon}
                    href={item.href}
                    current={activeUrl === item.href}
                  >
                    {item.label}
                  </NavItemBase>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3 px-4 py-4 lg:py-5">
        {footerItems.length > 0 && (
          <ul className="flex flex-col">
            {footerItems.map((item) => (
              <li key={item.label} className="py-px">
                <NavItemBase
                  badge={item.badge}
                  icon={item.icon}
                  href={item.href}
                  type="link"
                  current={item.href === activeUrl}
                >
                  {item.label}
                </NavItemBase>
              </li>
            ))}
          </ul>
        )}

        {featureCard}

        {showAccountCard && <NavAccountCard />}
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile header navigation */}
      <MobileNavigationHeader>{content}</MobileNavigationHeader>

      {/* Desktop sidebar navigation */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex">{content}</div>

      {/* Placeholder to take up physical space because the real sidebar has `fixed` position. */}
      <div
        style={{
          paddingLeft: MAIN_SIDEBAR_WIDTH,
        }}
        className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
      />
    </>
  );
};

// Collapsible group section
function GroupSection({
  group,
  activeUrl,
}: {
  group: GroupedNavItem;
  activeUrl?: string;
}) {
  const isGroupActive = group.items.some((item) => activeUrl === item.href);

  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = loadExpandedGroups();
    return stored[group.groupKey] ?? isGroupActive;
  });

  // Auto-expand when navigating to a child
  useEffect(() => {
    if (isGroupActive && !isExpanded) {
      setIsExpanded(true);
      const stored = loadExpandedGroups();
      stored[group.groupKey] = true;
      saveExpandedGroups(stored);
    }
  }, [isGroupActive, isExpanded, group.groupKey]);

  const toggleGroup = useCallback(() => {
    setIsExpanded((prev: boolean) => {
      const next = !prev;
      const stored = loadExpandedGroups();
      stored[group.groupKey] = next;
      saveExpandedGroups(stored);
      return next;
    });
  }, [group.groupKey]);

  const GroupIcon = group.groupIcon;

  return (
    <div className="mb-0.5">
      {/* Group header */}
      <button
        onClick={toggleGroup}
        className={cx(
          "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition duration-100 ease-linear",
          isGroupActive
            ? "text-brand-secondary"
            : "text-quaternary hover:text-tertiary hover:bg-primary_hover",
        )}
      >
        <GroupIcon
          className={cx(
            "size-4 shrink-0",
            isGroupActive ? "text-fg-brand-secondary" : "text-fg-quaternary group-hover:text-fg-tertiary",
          )}
        />
        <span className="flex-1 text-left">{group.groupLabel}</span>
        <span className="text-[10px] font-medium lowercase tracking-normal text-quaternary tabular-nums">
          {group.items.length}
        </span>
        <ChevronDown
          className={cx(
            "size-3 shrink-0 text-fg-quaternary transition-transform duration-150",
            isExpanded ? "" : "-rotate-90",
          )}
        />
      </button>

      {/* Group children */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="flex flex-col overflow-hidden"
          >
            {group.items.map((item) => (
              <li key={item.label} className="py-px">
                <NavItemBase
                  type="link"
                  icon={item.icon}
                  href={item.href}
                  current={activeUrl === item.href}
                >
                  {item.label}
                </NavItemBase>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
