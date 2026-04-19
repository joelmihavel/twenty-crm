"use client";

import type { FieldMetadata, CurrencyValue, FullNameValue, EmailsValue, PhonesValue, LinksValue } from "@/lib/twenty/types";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { AvatarLabelGroup } from "@/components/base/avatar/avatar-label-group";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { RatingStars } from "@/components/foundations/rating-stars";
import { mapOptionColor } from "@/lib/twenty/color-utils";
import { Check, Mail01, Phone, X } from "@untitledui/icons";

interface FieldRendererProps {
  field: FieldMetadata;
  value: unknown;
}

function getInitials(firstName: string | undefined, lastName: string | undefined): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return first + last || "?";
}

/**
 * Format a date string as a human-readable relative time.
 * Returns strings like "Just now", "3 minutes ago", "2 hours ago", "5 days ago", etc.
 */
function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates
  if (diffMs < 0) {
    return formatFutureDate(Math.abs(diffMs));
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes === 1) return "1 minute ago";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;
  if (diffYears === 1) return "1 year ago";
  return `${diffYears} years ago`;
}

function formatFutureDate(diffMs: number): string {
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 365) return `In ${Math.floor(diffDays / 30)} months`;
  return `In ${Math.floor(diffDays / 365)} years`;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FieldRenderer({ field, value }: FieldRendererProps) {
  if (value === null || value === undefined) {
    return <span className="text-fg-quaternary">&mdash;</span>;
  }

  switch (field.type) {
    case "TEXT": {
      const text = String(value);
      if (!text) return <span className="text-fg-quaternary">&mdash;</span>;
      return (
        <Tooltip title={text} delay={300}>
          <TooltipTrigger>
            <span className="truncate max-w-48 block">{text}</span>
          </TooltipTrigger>
        </Tooltip>
      );
    }

    case "NUMBER":
    case "NUMERIC":
      return <span className="tabular-nums">{Number(value).toLocaleString("en-IN")}</span>;

    case "BOOLEAN":
      return value ? (
        <Check className="size-4 text-fg-secondary" />
      ) : (
        <X className="size-4 text-fg-quaternary" />
      );

    case "DATE":
    case "DATE_TIME": {
      const dateStr = value as string;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return <span className="text-fg-quaternary">&mdash;</span>;
      const relativeTime = formatRelativeDate(dateStr);
      const fullDate = formatFullDate(dateStr);
      return (
        <Tooltip title={fullDate} delay={300}>
          <TooltipTrigger>
            <span className="text-secondary">{relativeTime}</span>
          </TooltipTrigger>
        </Tooltip>
      );
    }

    case "CURRENCY": {
      const cv = value as CurrencyValue;
      if (!cv?.amountMicros) return <span className="text-fg-quaternary">&mdash;</span>;
      const amount = cv.amountMicros / 1_000_000;
      const currencyCode = cv.currencyCode || "INR";
      const formatted = new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
      return <span className="tabular-nums">{formatted}</span>;
    }

    case "SELECT": {
      const optValue = String(value);
      const option = field.options?.find((o) => o.value === optValue);
      if (!option) return <span>{optValue}</span>;
      return <Badge size="sm" color={mapOptionColor(option.color)}>{option.label}</Badge>;
    }

    case "MULTI_SELECT": {
      const values = value as string[];
      if (!Array.isArray(values) || values.length === 0) return <span className="text-fg-quaternary">&mdash;</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {values.map((v) => {
            const option = field.options?.find((o) => o.value === v);
            return <Badge key={v} size="sm" color={option ? mapOptionColor(option.color) : "gray"}>{option?.label ?? v}</Badge>;
          })}
        </div>
      );
    }

    case "FULL_NAME": {
      const fn = value as FullNameValue;
      const fullName = [fn?.firstName, fn?.lastName].filter(Boolean).join(" ");
      if (!fullName) return <span className="text-fg-quaternary">&mdash;</span>;
      const initials = getInitials(fn?.firstName, fn?.lastName);
      return (
        <AvatarLabelGroup
          size="sm"
          initials={initials}
          alt={fullName}
          title={fullName}
          subtitle=""
        />
      );
    }

    case "EMAILS": {
      const em = value as EmailsValue;
      if (!em?.primaryEmail) return <span className="text-fg-quaternary">&mdash;</span>;
      return (
        <span className="flex items-center gap-1.5">
          <Mail01 className="size-3.5 text-fg-quaternary shrink-0" aria-hidden="true" />
          <a
            href={`mailto:${em.primaryEmail}`}
            className="truncate text-brand-secondary hover:text-brand-secondary_hover transition duration-100 ease-linear"
          >
            {em.primaryEmail}
          </a>
        </span>
      );
    }

    case "PHONES": {
      const ph = value as PhonesValue;
      if (!ph?.primaryPhoneNumber) return <span className="text-fg-quaternary">&mdash;</span>;
      return (
        <span className="flex items-center gap-1.5">
          <Phone className="size-3.5 text-fg-quaternary shrink-0" aria-hidden="true" />
          <a
            href={`tel:${ph.primaryPhoneNumber}`}
            className="text-brand-secondary hover:text-brand-secondary_hover transition duration-100 ease-linear"
          >
            {ph.primaryPhoneNumber}
          </a>
        </span>
      );
    }

    case "LINKS": {
      const lk = value as LinksValue;
      return lk?.primaryLinkUrl ? (
        <a href={lk.primaryLinkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-secondary_hover hover:underline truncate transition duration-100 ease-linear">
          {lk.primaryLinkLabel || lk.primaryLinkUrl}
        </a>
      ) : <span className="text-fg-quaternary">&mdash;</span>;
    }

    case "RATING": {
      const rating = Math.min(5, Math.max(0, Number(value) || 0));
      return <RatingStars rating={rating} stars={5} starClassName="size-4" />;
    }

    default:
      return <span className="truncate">{JSON.stringify(value)}</span>;
  }
}
