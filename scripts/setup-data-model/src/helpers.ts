/**
 * Utility helpers for building field definitions.
 */

import crypto from "node:crypto";
import type { FieldDefinition, SelectColor, SelectOption } from "./types.js";

/**
 * Build SELECT/MULTI_SELECT options with auto-generated UUIDs.
 * Each entry is "Label:color" or just "Label" (defaults to gray).
 */
export function makeOptions(entries: Array<string | [string, SelectColor]>): SelectOption[] {
  return entries.map((entry, i) => {
    const label = typeof entry === "string" ? entry : entry[0];
    const color: SelectColor = typeof entry === "string" ? "gray" : entry[1];
    // Value: SCREAMING_SNAKE_CASE from label
    // Twenty requires values to start with a letter (UPPER_CASE snake_case).
    // Numeric prefixes are converted to word equivalents.
    let value = label
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    // Fix values starting with digits (Twenty rejects these)
    const numWords: Record<string, string> = {
      "0": "ZERO", "1": "ONE", "2": "TWO", "3": "THREE", "4": "FOUR",
      "5": "FIVE", "6": "SIX", "7": "SEVEN", "8": "EIGHT", "9": "NINE",
      "10": "TEN", "11": "ELEVEN", "12": "TWELVE",
    };
    const leadingNum = value.match(/^(\d+)_?(.*)/);
    if (leadingNum) {
      const numStr = leadingNum[1];
      const rest = leadingNum[2];
      const word = numWords[numStr] ?? `N${numStr}`;
      value = rest ? `${word}_${rest}` : word;
    }
    return {
      id: crypto.randomUUID(),
      label,
      value,
      color,
      position: i,
    };
  });
}

// Convenience field builders

export function textField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "TEXT", icon: icon ?? "IconTextSize" };
}

export function numberField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "NUMBER", icon: icon ?? "IconNumber" };
}

export function boolField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "BOOLEAN", icon: icon ?? "IconCheckbox" };
}

export function dateField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "DATE", icon: icon ?? "IconCalendar" };
}

export function currencyField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "CURRENCY", icon: icon ?? "IconCurrencyRupee" };
}

export function linksField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "LINKS", icon: icon ?? "IconLink" };
}

export function richTextField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "RICH_TEXT", icon: icon ?? "IconNotes" };
}

export function ratingField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "RATING", icon: icon ?? "IconStar" };
}

export function addressField(name: string, label: string, icon?: string): FieldDefinition {
  return { name, label, type: "ADDRESS", icon: icon ?? "IconMap" };
}

export function selectField(
  name: string,
  label: string,
  options: Array<string | [string, SelectColor]>,
  icon?: string
): FieldDefinition {
  return {
    name,
    label,
    type: "SELECT",
    icon: icon ?? "IconList",
    options: makeOptions(options),
  };
}

export function multiSelectField(
  name: string,
  label: string,
  options: Array<string | [string, SelectColor]>,
  icon?: string
): FieldDefinition {
  return {
    name,
    label,
    type: "MULTI_SELECT",
    icon: icon ?? "IconChecklist",
    options: makeOptions(options),
  };
}
