import type { BadgeColors } from "@/components/base/badges/badge-types";

// Shared badge color map (Fix 9)
export const BADGE_COLOR_MAP: Record<string, BadgeColors> = {
  green: "success",
  red: "error",
  yellow: "warning",
  blue: "brand",
  purple: "purple",
  orange: "orange",
  pink: "pink",
  sky: "sky",
  slate: "slate",
  indigo: "indigo",
};

export function mapOptionColor(color: string): BadgeColors {
  return BADGE_COLOR_MAP[color.toLowerCase()] ?? "gray";
}
