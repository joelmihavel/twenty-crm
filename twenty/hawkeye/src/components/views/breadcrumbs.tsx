"use client";

import { ChevronRight, HomeLine } from "@untitledui/icons";
import Link from "next/link";
import { cx } from "@/utils/cx";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export function Breadcrumbs({ segments, className }: BreadcrumbsProps) {
  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cx("px-4 py-2 md:px-6", className)}>
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center text-fg-quaternary transition duration-100 ease-linear hover:text-fg-secondary"
            aria-label="Home"
          >
            <HomeLine className="size-4" />
          </Link>
        </li>

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <li key={`${segment.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 text-fg-quaternary" aria-hidden="true" />
              {isLast || !segment.href ? (
                <span
                  className={cx(
                    "font-medium truncate max-w-48",
                    isLast ? "text-brand-secondary" : "text-tertiary",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className="font-medium text-tertiary truncate max-w-48 transition duration-100 ease-linear hover:text-secondary"
                >
                  {segment.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
