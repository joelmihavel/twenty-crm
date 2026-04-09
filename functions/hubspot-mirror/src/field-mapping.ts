import type {
  HubSpotRecord,
  MappedOutput,
  TwentyRecord,
  MappingError,
} from "./types.js";
import {
  CONTACT_PEOPLE_FIELDS,
  TENANT_FIELDS,
  LANDLORD_FIELDS,
  CONTRACT_FIELDS,
  PROPERTY_FIELDS,
  ROOM_FIELDS,
  TICKET_FIELDS,
  PIPELINE_MAP,
} from "./types.js";

// ── Utility Helpers ──────────────────────────────────────────────────

/** Convert HubSpot snake_case to camelCase (e.g. "first_name" -> "firstName") */
function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/** Normalize empty strings to null */
function normalizeValue(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

/** Parse a numeric string, returning null for empty/null/non-numeric */
function parseNumeric(value: string | null | undefined): number | null {
  const normalized = normalizeValue(value);
  if (normalized === null) return null;
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
}

/** Pick whitelisted fields from a HubSpot record and transform keys to camelCase */
function pickFields(
  properties: Record<string, string | null>,
  whitelist: readonly string[],
  numericFields: ReadonlySet<string> = new Set(),
  keyOverrides: Record<string, string> = {},
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of whitelist) {
    const rawValue = properties[field];
    const camelKey = keyOverrides[field] ?? snakeToCamel(field);
    if (numericFields.has(field)) {
      result[camelKey] = parseNumeric(rawValue);
    } else {
      result[camelKey] = normalizeValue(rawValue);
    }
  }
  return result;
}

// ── Key overrides for HubSpot fields that are not true snake_case ────

const CONTACT_KEY_OVERRIDES: Record<string, string> = {
  firstname: "firstName",
  lastname: "lastName",
  hs_object_id: "hsObjectId",
};

const ROOM_KEY_OVERRIDES: Record<string, string> = {
  roomid: "roomId",
};

const TICKET_KEY_OVERRIDES: Record<string, string> = {
  hs_object_id: "hsObjectId",
};

// ── Numeric field sets ───────────────────────────────────────────────

const TENANT_NUMERIC_FIELDS = new Set([
  "tenant_monthly_rent",
  "tenant_base_rent",
  "monthly_maintenance",
  "convenience_fee",
  "platform_fee",
  "tenant_gst",
  "furnishing_rental",
  "first_month_rent",
  "budget",
  "nps_score",
]);

const CONTRACT_NUMERIC_FIELDS = new Set([
  "monthly_license_fee",
  "property_base_rent",
  "security_deposit",
  "platform_fees",
  "convenience_fee",
  "gst",
  "tds_amount",
  "maintenance_amount",
  "increment_percentage",
  "settlement_amount",
]);

const PROPERTY_NUMERIC_FIELDS = new Set([
  "units",
  "floors",
  "washrooms",
  "monthly_license_fee",
  "maintenance_fee",
]);

const ROOM_NUMERIC_FIELDS = new Set([
  "n3_month_lock_in_rent",
  "n6_month_lock_in_rent",
  "n11_month_lock_in_rent",
  "no_lock_in_rent",
]);

const TICKET_NUMERIC_FIELDS = new Set([
  "cost_associated",
  "tenant_rating",
]);

// ── Contact Mapping (-> Person + Tenant + Landlord) ─────────────────

export function mapContact(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];
  const props = record.properties;

  // Always emit a Person record
  const personFields = pickFields(props, CONTACT_PEOPLE_FIELDS, new Set(), CONTACT_KEY_OVERRIDES);
  records.push({
    objectType: "person",
    hubspotId: record.id,
    fields: personFields,
  });

  const customerType = normalizeValue(props["customer_type"]);

  // Check for Tenant role (case-insensitive)
  if (customerType && customerType.toLowerCase().includes("tenant")) {
    const tenantFields = pickFields(props, TENANT_FIELDS, TENANT_NUMERIC_FIELDS);
    records.push({
      objectType: "tenant",
      hubspotId: record.id,
      fields: tenantFields,
    });
  }

  // Check for Landlord role (case-insensitive)
  if (customerType && customerType.toLowerCase().includes("landlord")) {
    const landlordFields = pickFields(props, LANDLORD_FIELDS);
    records.push({
      objectType: "landlord",
      hubspotId: record.id,
      fields: landlordFields,
    });
  }

  return { records, errors };
}

// ── Deal Mapping (-> Opportunity) ────────────────────────────────────

export function mapDeal(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];
  const props = record.properties;

  const rawPipeline = normalizeValue(props["pipeline"]);
  const mappedPipeline = rawPipeline !== null
    ? (PIPELINE_MAP[rawPipeline] ?? rawPipeline)
    : null;

  const fields: Record<string, unknown> = {
    dealName: normalizeValue(props["dealname"]),
    amount: parseNumeric(props["amount"]),
    closeDate: normalizeValue(props["closedate"]),
    dealStage: normalizeValue(props["dealstage"]),
    pipeline: mappedPipeline,
  };

  records.push({
    objectType: "opportunity",
    hubspotId: record.id,
    fields,
  });

  return { records, errors };
}

// ── Contract Custom Object Mapping ───────────────────────────────────

export function mapContract(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(record.properties, CONTRACT_FIELDS, CONTRACT_NUMERIC_FIELDS);
  records.push({
    objectType: "contract",
    hubspotId: record.id,
    fields,
  });

  return { records, errors };
}

// ── Property Custom Object Mapping ───────────────────────────────────

export function mapProperty(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(record.properties, PROPERTY_FIELDS, PROPERTY_NUMERIC_FIELDS);
  records.push({
    objectType: "property",
    hubspotId: record.id,
    fields,
  });

  return { records, errors };
}

// ── Room Custom Object Mapping ───────────────────────────────────────

export function mapRoom(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(record.properties, ROOM_FIELDS, ROOM_NUMERIC_FIELDS, ROOM_KEY_OVERRIDES);
  records.push({
    objectType: "room",
    hubspotId: record.id,
    fields,
  });

  return { records, errors };
}

// ── Ticket Mapping ───────────────────────────────────────────────────

export function mapTicket(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(record.properties, TICKET_FIELDS, TICKET_NUMERIC_FIELDS, TICKET_KEY_OVERRIDES);
  records.push({
    objectType: "ticket",
    hubspotId: record.id,
    fields,
  });

  return { records, errors };
}

// ── Dispatcher ───────────────────────────────────────────────────────

export type ObjectMapper = (record: HubSpotRecord) => MappedOutput;

export const OBJECT_MAPPERS: Record<string, ObjectMapper> = {
  contacts: mapContact,
  deals: mapDeal,
  tickets: mapTicket,
  "2-35314522": mapContract,
  "2-35314851": mapProperty,
  "2-35432178": mapRoom,
};
