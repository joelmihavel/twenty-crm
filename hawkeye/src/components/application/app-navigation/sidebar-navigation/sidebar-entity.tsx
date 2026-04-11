"use client";

import type { ReactNode } from "react";
import { SearchLg } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { Cube01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountCard } from "../base-components/nav-account-card";
import { NavItemBase } from "../base-components/nav-item";
import type { NavItemType } from "../config";
import type { EntityNavItem } from "@/components/views/app-sidebar";

interface SidebarNavigationEntityProps {
  activeUrl?: string;
  entityItems: EntityNavItem[];
  footerItems?: NavItemType[];
  featureCard?: ReactNode;
  showAccountCard?: boolean;
  hideBorder?: boolean;
  className?: string;
}

export const SidebarNavigationEntity = ({
  activeUrl,
  entityItems,
  footerItems = [],
  featureCard,
  showAccountCard = true,
  hideBorder = false,
  className,
}: SidebarNavigationEntityProps) => {
  const MAIN_SIDEBAR_WIDTH = 280;

  // Check if URL is active (exact match or starts with for entity pages with tabs)
  const isItemActive = (href: string) => {
    return activeUrl === href || (activeUrl?.startsWith(href + "?") ?? false);
  };

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
        <div className="flex items-center gap-2">
          <Cube01 className="size-6 text-fg-brand-primary" />
          <span className="text-md font-semibold text-primary">Hawkeye</span>
        </div>

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

      {/* Entity navigation - flat list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3">
        <ul className="flex flex-col">
          {entityItems.map((item) => (
            <li key={item.href} className="py-px">
              <NavItemBase
                type="link"
                icon={item.icon}
                href={item.href}
                current={isItemActive(item.href)}
              >
                {item.label}
              </NavItemBase>
            </li>
          ))}
        </ul>
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
