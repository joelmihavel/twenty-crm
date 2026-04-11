import type {
  FieldMetadata,
  RecordData,
  FullNameValue,
  EmailsValue,
  PhonesValue,
  CurrencyValue,
  LinksValue,
} from "@/lib/twenty/types";

interface AddressValue {
  addressStreet1?: string;
  addressStreet2?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  addressPostcode?: string;
}

/**
 * Escape a single CSV value: wrap in quotes if it contains a comma, quote, or newline.
 * Internal double-quotes are doubled per RFC 4180.
 */
function escapeCsvValue(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format a single field value as a plain-text string suitable for CSV output.
 */
function formatFieldValue(field: FieldMetadata, value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (field.type) {
    case "FULL_NAME": {
      const fn = value as FullNameValue;
      return [fn?.firstName, fn?.lastName].filter(Boolean).join(" ");
    }

    case "EMAILS": {
      const em = value as EmailsValue;
      return em?.primaryEmail ?? "";
    }

    case "PHONES": {
      const ph = value as PhonesValue;
      return ph?.primaryPhoneNumber ?? "";
    }

    case "CURRENCY": {
      const cv = value as CurrencyValue;
      if (!cv?.amountMicros) return "";
      const amount = cv.amountMicros / 1_000_000;
      return `${amount} ${cv.currencyCode ?? ""}`.trim();
    }

    case "LINKS": {
      const lk = value as LinksValue;
      return lk?.primaryLinkUrl ?? "";
    }

    case "ADDRESS": {
      const addr = value as AddressValue;
      if (!addr) return "";
      const parts = [
        addr.addressStreet1,
        addr.addressCity,
        addr.addressState,
        [addr.addressCountry, addr.addressPostcode]
          .filter(Boolean)
          .join(" "),
      ].filter(Boolean);
      return parts.join(", ");
    }

    case "SELECT": {
      return String(value);
    }

    case "MULTI_SELECT": {
      const values = value as string[];
      if (!Array.isArray(values)) return String(value);
      return values.join(", ");
    }

    case "DATE":
    case "DATE_TIME": {
      const date = new Date(value as string);
      return isNaN(date.getTime()) ? String(value) : date.toISOString();
    }

    case "BOOLEAN": {
      return value ? "true" : "false";
    }

    default: {
      return String(value);
    }
  }
}

/**
 * Export an array of records to a CSV file and trigger a browser download.
 *
 * @param records   - The record data to export
 * @param fields    - The field metadata describing each column
 * @param filename  - The base filename (without extension)
 */
export function exportToCsv(
  records: RecordData[],
  fields: FieldMetadata[],
  filename: string,
): void {
  // Build header row from field labels
  const headerRow = fields.map((f) => escapeCsvValue(f.label)).join(",");

  // Build data rows
  const dataRows = records.map((record) =>
    fields
      .map((field) => escapeCsvValue(formatFieldValue(field, record[field.name])))
      .join(","),
  );

  // Combine header + data rows with CRLF line endings (RFC 4180)
  const csvContent = [headerRow, ...dataRows].join("\r\n");

  // Prepend UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create a temporary download link and trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
