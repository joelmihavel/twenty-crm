"use client";

import type { FieldMetadata, CurrencyValue, FullNameValue, EmailsValue, PhonesValue, LinksValue } from "@/lib/twenty/types";
import { Badge } from "@/components/base/badges/badges";
import { Avatar } from "@/components/base/avatar/avatar";
import { mapOptionColor } from "@/lib/twenty/color-utils";

interface FieldRendererProps {
  field: FieldMetadata;
  value: unknown;
}

function getInitials(firstName: string | undefined, lastName: string | undefined): string {
  const first = firstName?.charAt(0)?.toUpperCase() ?? "";
  const last = lastName?.charAt(0)?.toUpperCase() ?? "";
  return first + last || "?";
}

export function FieldRenderer({ field, value }: FieldRendererProps) {
  if (value === null || value === undefined) {
    return <span className="text-fg-quaternary">&mdash;</span>;
  }

  switch (field.type) {
    case "TEXT":
      return <span className="truncate">{String(value)}</span>;

    case "NUMBER":
    case "NUMERIC":
      return <span className="tabular-nums">{Number(value).toLocaleString("en-IN")}</span>;

    case "BOOLEAN":
      return <span>{value ? "Yes" : "No"}</span>;

    case "DATE":
    case "DATE_TIME": {
      const date = new Date(value as string);
      return <span>{date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>;
    }

    case "CURRENCY": {
      const cv = value as CurrencyValue;
      if (!cv?.amountMicros) return <span className="text-fg-quaternary">&mdash;</span>;
      const amount = cv.amountMicros / 1_000_000;
      return <span className="tabular-nums">{"\u20B9"}{amount.toLocaleString("en-IN")}</span>;
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
      return (
        <span className="inline-flex items-center gap-2">
          <Avatar
            size="xs"
            initials={getInitials(fn?.firstName, fn?.lastName)}
            alt={fullName}
          />
          <span>{fullName}</span>
        </span>
      );
    }

    case "EMAILS": {
      const em = value as EmailsValue;
      return em?.primaryEmail ? (
        <a href={`mailto:${em.primaryEmail}`} className="text-brand-secondary hover:underline truncate">{em.primaryEmail}</a>
      ) : <span className="text-fg-quaternary">&mdash;</span>;
    }

    case "PHONES": {
      const ph = value as PhonesValue;
      return ph?.primaryPhoneNumber ? (
        <a href={`tel:${ph.primaryPhoneNumber}`} className="text-brand-secondary hover:underline">{ph.primaryPhoneNumber}</a>
      ) : <span className="text-fg-quaternary">&mdash;</span>;
    }

    case "LINKS": {
      const lk = value as LinksValue;
      return lk?.primaryLinkUrl ? (
        <a href={lk.primaryLinkUrl} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline truncate">
          {lk.primaryLinkLabel || lk.primaryLinkUrl}
        </a>
      ) : <span className="text-fg-quaternary">&mdash;</span>;
    }

    case "RATING": {
      const rating = Math.min(5, Math.max(0, Math.round(Number(value) || 0)));
      return <span>{"\u2605".repeat(rating)}{"\u2606".repeat(5 - rating)}</span>;
    }

    default:
      return <span className="truncate">{JSON.stringify(value)}</span>;
  }
}
