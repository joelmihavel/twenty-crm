import { type IconComponent } from 'twenty-ui/display';

// ── Column definition for Hawkeye tables ──────────────────────────
export type HawkeyeColumn<T> = {
  key: keyof T & string;
  label: string;
  width?: number;
  type?: 'text' | 'email' | 'phone' | 'date' | 'currency' | 'enum' | 'boolean' | 'number' | 'url';
  Icon?: IconComponent;
};

// ── Entity field group for detail views ────────────────────────────
export type FieldGroup<T> = {
  label: string;
  fields: Array<{
    key: keyof T & string;
    label: string;
    type?: 'text' | 'email' | 'phone' | 'date' | 'currency' | 'enum' | 'boolean' | 'number' | 'url' | 'file' | 'longtext';
  }>;
};

// ── Relation record (pill/chip in detail views) ───────────────────
export type RelationRecord = {
  id: string;
  title: string;
  initials: string;
  color?: string;
  path: string;
};

// ── Relation section in detail views ──────────────────────────────
export type RelationSection = {
  label: string;
  records: RelationRecord[];
  linkPath?: string;
};
