"use client";

import {
  BarChartSquare02,
  Settings01,
  Cube01,
  LogOut01,
  ChevronLeft,
  Sun,
  Moon01,
  Upload01,
  Briefcase01,
} from "@untitledui/icons";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import type { ObjectMetadata } from "@/lib/twenty/types";
import type { NavItemType } from "@/components/application/app-navigation/config";
import { SidebarNavigationEntity } from "@/components/application/app-navigation/sidebar-navigation/sidebar-entity";
import { clearStoredToken } from "@/lib/auth";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { ENTITIES } from "@/lib/entity-config";
import { cx } from "@/utils/cx";

function DarkModeToggle({ showLabel }: { showLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-tertiary transition duration-100 ease-linear min-h-[44px]"
        aria-label="Toggle dark mode"
        disabled
      >
        <Sun className="size-5 shrink-0" />
        {showLabel && <span>Theme</span>}
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-tertiary hover:bg-primary_hover hover:text-secondary transition duration-100 ease-linear min-h-[44px]"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-5 shrink-0" /> : <Moon01 className="size-5 shrink-0" />}
      {showLabel && (
        <span>{isDark ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  );
}

// Entity nav item type for the sidebar
export interface EntityNavItem {
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
}

// Kept for backward compatibility with sidebar-grouped.tsx
export interface GroupedNavItem {
  groupKey: string;
  groupLabel: string;
  groupIcon: React.FC<{ className?: string }>;
  items: NavItemType[];
}

interface AppSidebarProps {
  objects: ObjectMetadata[];
  activeUrl: string;
  loading: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({
  objects,
  activeUrl,
  loading,
  isMobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useBreakpoint("lg");
  const isTablet = useBreakpoint("md");
  const isMobile = !isTablet;

  const [isTabletExpanded, setIsTabletExpanded] = useState(false);

  // Build entity nav items from ENTITIES config (8 items, flat)
  const entityNavItems: EntityNavItem[] = ENTITIES.map((entity) => ({
    label: entity.label,
    href: `/${entity.slug}`,
    icon: entity.icon,
  }));

  const handleLogout = useCallback(() => {
    clearStoredToken();
    router.push("/login");
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  }, [pathname, isMobile, onMobileClose]);

  const handleNavClick = useCallback(
    (href: string) => {
      router.push(href);
      if (isMobile && onMobileClose) {
        onMobileClose();
      }
      if (!isDesktop && isTabletExpanded) {
        setIsTabletExpanded(false);
      }
    },
    [isMobile, onMobileClose, isDesktop, isTabletExpanded, router],
  );

  // Check if a URL is active (exact match or starts with for entity pages)
  const isActive = useCallback(
    (href: string) => {
      return activeUrl === href || activeUrl.startsWith(href + "?");
    },
    [activeUrl],
  );

  // Desktop: full sidebar with entity navigation
  if (isDesktop) {
    return (
      <SidebarNavigationEntity
        activeUrl={activeUrl}
        entityItems={entityNavItems}
        footerItems={[
          {
            label: "CRM Ops",
            href: "/crmops",
            icon: Briefcase01,
          },
          {
            label: "Import",
            href: "/import",
            icon: Upload01,
          },
          {
            label: "Settings",
            href: "/settings",
            icon: Settings01,
          },
        ]}
        featureCard={
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5 rounded-lg border border-secondary bg-secondary px-3 py-2 text-xs text-tertiary">
              <span>Quick search</span>
              <kbd className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-quaternary ring-1 ring-secondary ring-inset">
                {"\u2318"}K
              </kbd>
            </div>
            <div className="flex items-center justify-center">
              <DarkModeToggle showLabel />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs text-tertiary transition-colors duration-100 ease-linear hover:bg-secondary_hover hover:text-secondary"
            >
              <LogOut01 className="size-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        }
      />
    );
  }

  // Tablet: collapsed icon-only sidebar, expand on hover
  if (isTablet && !isMobile) {
    return (
      <>
        <div
          className="fixed inset-y-0 left-0 z-40 flex"
          onMouseEnter={() => setIsTabletExpanded(true)}
          onMouseLeave={() => setIsTabletExpanded(false)}
        >
          <motion.aside
            animate={{ width: isTabletExpanded ? 280 : 64 }}
            transition={{ type: "spring", damping: 26, stiffness: 220, bounce: 0 }}
            className="flex h-full flex-col border-r border-secondary bg-primary overflow-hidden"
          >
            {/* Logo area */}
            <div className="flex h-14 items-center px-4 shrink-0">
              <Cube01 className="size-6 shrink-0 text-fg-brand-primary" />
              <AnimatePresence>
                {isTabletExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 text-sm font-semibold text-primary whitespace-nowrap overflow-hidden"
                  >
                    Hawkeye CRM
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Dashboard item */}
            <div className="px-2 pt-2">
              <TabletNavButton
                icon={BarChartSquare02}
                label="Dashboard"
                isActive={isActive("/dashboard")}
                isExpanded={isTabletExpanded}
                onClick={() => handleNavClick("/dashboard")}
              />
            </div>

            {/* Entity nav items */}
            <nav className="flex-1 overflow-y-auto px-2 py-2">
              <ul className="flex flex-col gap-0.5">
                {entityNavItems.map((item) => (
                  <li key={item.href}>
                    <TabletNavButton
                      icon={item.icon}
                      label={item.label}
                      isActive={isActive(item.href)}
                      isExpanded={isTabletExpanded}
                      onClick={() => handleNavClick(item.href)}
                    />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer */}
            <div className="px-2 py-3 border-t border-secondary shrink-0">
              <TabletNavButton
                icon={Briefcase01}
                label="CRM Ops"
                isActive={isActive("/crmops")}
                isExpanded={isTabletExpanded}
                onClick={() => handleNavClick("/crmops")}
              />
              <TabletNavButton
                icon={Upload01}
                label="Import"
                isActive={isActive("/import")}
                isExpanded={isTabletExpanded}
                onClick={() => handleNavClick("/import")}
              />
              <TabletNavButton
                icon={Settings01}
                label="Settings"
                isActive={isActive("/settings")}
                isExpanded={isTabletExpanded}
                onClick={() => handleNavClick("/settings")}
              />
              <DarkModeToggle showLabel={isTabletExpanded} />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-tertiary hover:bg-primary_hover hover:text-secondary transition duration-100 ease-linear min-h-[44px]"
              >
                <LogOut01 className="size-5 shrink-0" />
                <AnimatePresence>
                  {isTabletExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Sign out
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.aside>
        </div>

        {/* Spacer to push content right */}
        <div className="w-16 shrink-0" />
      </>
    );
  }

  // Mobile: overlay sidebar triggered by hamburger from mobile header
  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-overlay/70 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          {/* Slide-in sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220, bounce: 0 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-primary shadow-xl"
          >
            {/* Sidebar header */}
            <div className="flex h-14 items-center justify-between px-4 border-b border-secondary shrink-0">
              <div className="flex items-center gap-2">
                <Cube01 className="size-6 text-fg-brand-primary" />
                <span className="text-sm font-semibold text-primary">Hawkeye CRM</span>
              </div>
              <button
                onClick={onMobileClose}
                className="flex items-center justify-center rounded-lg p-2 text-fg-tertiary hover:bg-primary_hover hover:text-fg-secondary transition duration-100 ease-linear min-h-[44px] min-w-[44px]"
                aria-label="Close sidebar"
              >
                <ChevronLeft className="size-5" />
              </button>
            </div>

            {/* Dashboard */}
            <div className="px-3 pt-3">
              <button
                onClick={() => handleNavClick("/dashboard")}
                className={cx(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition duration-100 ease-linear min-h-[44px]",
                  isActive("/dashboard")
                    ? "bg-active text-primary"
                    : "text-tertiary hover:bg-primary_hover hover:text-secondary",
                )}
              >
                <BarChartSquare02 className="size-5 shrink-0" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Entity nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-2">
              <ul className="flex flex-col gap-0.5">
                {entityNavItems.map((item) => {
                  const ItemIcon = item.icon;
                  const itemActive = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className={cx(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition duration-100 ease-linear min-h-[44px]",
                          itemActive
                            ? "bg-active text-primary"
                            : "text-tertiary hover:bg-primary_hover hover:text-secondary",
                        )}
                      >
                        <ItemIcon className="size-5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="px-3 py-3 border-t border-secondary shrink-0">
              <button
                onClick={() => handleNavClick("/crmops")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-tertiary hover:bg-primary_hover hover:text-secondary transition duration-100 ease-linear min-h-[44px]"
              >
                <Briefcase01 className="size-5 shrink-0" />
                <span>CRM Ops</span>
              </button>
              <button
                onClick={() => handleNavClick("/import")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-tertiary hover:bg-primary_hover hover:text-secondary transition duration-100 ease-linear min-h-[44px]"
              >
                <Upload01 className="size-5 shrink-0" />
                <span>Import</span>
              </button>
              <button
                onClick={() => handleNavClick("/settings")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-tertiary hover:bg-primary_hover hover:text-secondary transition duration-100 ease-linear min-h-[44px]"
              >
                <Settings01 className="size-5 shrink-0" />
                <span>Settings</span>
              </button>
              <DarkModeToggle showLabel />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-tertiary hover:bg-primary_hover hover:text-secondary transition duration-100 ease-linear min-h-[44px]"
              >
                <LogOut01 className="size-5 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Tablet nav button helper
function TabletNavButton({
  icon: Icon,
  label,
  isActive,
  isExpanded,
  onClick,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-100 ease-linear min-h-[44px]",
        isActive
          ? "bg-active text-primary"
          : "text-tertiary hover:bg-primary_hover hover:text-secondary",
      )}
      title={!isExpanded ? label : undefined}
    >
      <Icon className="size-5 shrink-0" />
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
