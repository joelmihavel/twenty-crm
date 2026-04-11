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

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function normalizeValue(value: string | null | undefined): string | null {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function parseNumeric(value: string | null | undefined): number | null {
  const normalized = normalizeValue(value);
  if (normalized === null) return null;
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
}

export function toCurrency(
  value: string | number | null | undefined,
  currencyCode = "INR",
): { amountMicros: number; currencyCode: string } | null {
  const num = typeof value === "number" ? value : parseNumeric(value as string | null | undefined);
  if (num === null) return null;
  return {
    amountMicros: Math.round(num * 1_000_000),
    currencyCode,
  };
}

// ── SELECT value transformer (matches makeOptions logic) ─────────────

const NUM_WORDS: Record<string, string> = {
  "0": "ZERO", "1": "ONE", "2": "TWO", "3": "THREE", "4": "FOUR",
  "5": "FIVE", "6": "SIX", "7": "SEVEN", "8": "EIGHT", "9": "NINE",
  "10": "TEN", "11": "ELEVEN", "12": "TWELVE",
};

export function toScreamingSnake(value: string | null | undefined): string | null {
  if (!value) return null;
  let v = value.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  const leadingNum = v.match(/^(\d+)_?(.*)/);
  if (leadingNum) {
    const numStr = leadingNum[1]!;
    const rest = leadingNum[2] ?? "";
    const word = NUM_WORDS[numStr] ?? `N${numStr}`;
    v = rest ? `${word}_${rest}` : word;
  }
  return v;
}

// ── pickFields with SELECT and MULTI_SELECT support ──────────────────

function pickFields(
  properties: Record<string, string | null>,
  whitelist: readonly string[],
  numericFields: ReadonlySet<string> = new Set(),
  keyOverrides: Record<string, string> = {},
  currencyFields: ReadonlySet<string> = new Set(),
  selectFields: ReadonlySet<string> = new Set(),
  multiSelectFields: ReadonlySet<string> = new Set(),
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of whitelist) {
    const rawValue = properties[field];
    const camelKey = keyOverrides[field] ?? snakeToCamel(field);
    if (currencyFields.has(field)) {
      result[camelKey] = toCurrency(rawValue);
    } else if (numericFields.has(field)) {
      result[camelKey] = parseNumeric(rawValue);
    } else if (multiSelectFields.has(field)) {
      // Semicolon-delimited -> array of SCREAMING_SNAKE values
      if (!rawValue) {
        result[camelKey] = null;
      } else {
        result[camelKey] = rawValue.split(";").map(s => toScreamingSnake(s.trim())).filter(Boolean);
      }
    } else if (selectFields.has(field)) {
      result[camelKey] = toScreamingSnake(rawValue);
    } else {
      result[camelKey] = normalizeValue(rawValue);
    }
  }
  return result;
}

// ── Key overrides: HubSpot snake_case -> Twenty camelCase field name ──

const CONTACT_KEY_OVERRIDES: Record<string, string> = {
  firstname: "firstName",
  lastname: "lastName",
  hs_object_id: "hubspotRecordId",
  customer_type: "personRole",
  aadhar_number: "aadharNumber",
  pan_card: "panCard",
  country_code: "countryCode",
  lead_source: "leadSource",
  lead_sub_source: "leadSubSource",
};

const TENANT_KEY_OVERRIDES: Record<string, string> = {
  tenant_monthly_rent: "monthlyRent",
  tenant_base_rent: "baseRent",
  monthly_maintenance: "maintenanceAmount",
  convenience_fee: "convenienceFee",
  platform_fee: "platformFee",
  tenant_gst: "gst",
  furnishing_rental: "furnishingRental",
  rent_due: "rentDue",
  rent_status: "rentStatus",
  first_month_rent: "firstMonthRent",
  real_move_in_date: "moveInDate",
  move_out_date: "moveOutDate",
  preferred_area: "preferredAreas",
  food_preference: "foodPreference",
  smoking_preference: "smoking",
  pet_preference: "petPreference",
  nps_score: "npsScore",
  customer_status: "customerStatus",
  tenant_lifecycle: "tenantLifecycle",
  reserve_status: "reserveStatus",
  cashfree_order_id: "cfOrderId",
  cashfree_link_id: "cfLinkId",
  rental_link: "rentalLink",
  budget: "budget",
};

const LANDLORD_KEY_OVERRIDES: Record<string, string> = {
  cashfree_vendor_id: "cashfreeVendorId",
  vendor_status: "vendorStatus",
  pan_card: "panCard",
  bank_account_number: "bankAccountNumber",
  ifsc_code: "ifscCode",
  account_holder_name: "accountHolderName",
  account_type: "accountType",
  penny_drop_status: "pennyDropStatus",
  landlord_status: "landlordStatus",
  last_cashfree_sync: "lastCashfreeSync",
  payment_control: "paymentControl",
};

const ROOM_KEY_OVERRIDES: Record<string, string> = {
  roomid: "roomId",
  n3_month_lock_in_rent: "threeMonthLockInRent",
  n6_month_lock_in_rent: "sixMonthLockInRent",
  n11_month_lock_in_rent: "elevenMonthLockInRent",
  no_lock_in_rent: "noLockInRent",
};

const TICKET_KEY_OVERRIDES: Record<string, string> = {
  hs_object_id: "hubspotRecordId",
  hs_pipeline: "pipeline",
  hs_pipeline_stage: "ticketStatus",
  ticket_category: "category",
  hs_ticket_priority: "priority",
  cost_associated: "cost",
  cost_paid_by: "costPaidBy",
  resolution_notes: "resolutionNotes",
  tenant_rating: "tenantRating",
  scheduled_on: "scheduledOn",
  time_slot: "timeSlot",
  ticket_flag: "flag",
};

const CONTRACT_KEY_OVERRIDES: Record<string, string> = {
  contract_id: "contractId",
  contract_uid: "contractUid",
  contract_type: "contractType",
  contract_start_date: "startDate",
  contract_end_date: "endDate",
  go_live_date: "goLiveDate",
  lock_in_end_date: "lockInEnd",
  lock_in_plan: "lockInPlan",
  monthly_license_fee: "monthlyLicenseFee",
  property_base_rent: "baseRent",
  security_deposit: "securityDeposit",
  platform_fees: "platformFees",
  convenience_fee: "convenienceFee",
  tds_amount: "tdsAmount",
  maintenance_amount: "maintenanceAmount",
  increment_percentage: "incrementPercentage",
  rental_cycle: "rentalCycle",
  short_term_flag: "shortTermFlag",
  water_charges_separate: "waterChargesSeparate",
  move_in_inspector: "moveInInspector",
  move_in_status: "moveInStatus",
  move_out_inspector: "moveOutInspector",
  move_out_status: "moveOutStatus",
  deposit_settled: "depositSettled",
  settlement_amount: "settlementAmount",
  business_type: "businessType",
  lf_settlement_day: "lfSettlementDay",
  lf_settlement_cycle: "lfSettlementCycle",
  maintenance_to_landlord: "maintenanceToLandlord",
  tds_on_license_fee: "tdsOnLicenseFee",
  number_of_units: "numberOfUnits",
  monthly_payment_status: "monthlyPaymentStatus",
};

const PROPERTY_KEY_OVERRIDES: Record<string, string> = {
  area_name: "area",
  property_name: "propertyName",
  building_name: "buildingName",
  property_address: "propertyAddress",
  property_type: "propertyType",
  monthly_license_fee: "monthlyLicenseFee",
  maintenance_fee: "maintenanceFee",
  rent_cycle: "rentCycle",
  maintenance_cycle: "maintenanceCycle",
  tds_deduction: "tdsDeduction",
  lock_box_installed: "lockBoxInstalled",
  lock_box_code: "lockBoxCode",
  parking_info: "parkingInfo",
  gallery_link: "galleryLink",
  electricity_provider: "electricityProvider",
  electricity_account_id: "electricityAccountId",
  electricity_user_id: "electricityUserId",
  gas_provider: "gasProvider",
  gas_id: "gasId",
  water_source: "waterSource",
  water_provider: "waterProvider",
  wifi_isp: "wifiIsp",
  wifi_account_id: "wifiAccountId",
  wifi_ssid: "wifiSsid",
  wifi_password: "wifiPassword",
  wifi_plan: "wifiPlan",
};

// ── Numeric field sets ───────────────────────────────────────────────

const TENANT_NUMERIC_FIELDS = new Set(["nps_score"]);
const CONTRACT_NUMERIC_FIELDS = new Set(["increment_percentage", "lf_settlement_day", "number_of_units"]);
const PROPERTY_NUMERIC_FIELDS = new Set(["units", "floors", "washrooms"]);
const ROOM_NUMERIC_FIELDS = new Set<string>([]);
const TICKET_NUMERIC_FIELDS = new Set<string>([]); // tenant_rating is now RATING type, handled as text

// ── Currency field sets ──────────────────────────────────────────────

const TENANT_CURRENCY_FIELDS = new Set([
  "tenant_monthly_rent", "tenant_base_rent", "monthly_maintenance",
  "convenience_fee", "platform_fee", "tenant_gst", "furnishing_rental",
  "first_month_rent", "budget", "rent_due",
]);

const CONTRACT_CURRENCY_FIELDS = new Set([
  "monthly_license_fee", "property_base_rent", "security_deposit",
  "platform_fees", "convenience_fee", "gst", "tds_amount",
  "maintenance_amount", "settlement_amount", "tds_on_license_fee",
]);

const PROPERTY_CURRENCY_FIELDS = new Set(["monthly_license_fee", "maintenance_fee"]);

const ROOM_CURRENCY_FIELDS = new Set([
  "n3_month_lock_in_rent", "n6_month_lock_in_rent",
  "n11_month_lock_in_rent", "no_lock_in_rent",
]);

const TICKET_CURRENCY_FIELDS = new Set(["cost_associated"]);

// ── SELECT field sets (values must be SCREAMING_SNAKE_CASE) ──────────

const CONTACT_SELECT_FIELDS = new Set(["lead_source"]);
const CONTACT_MULTISELECT_FIELDS = new Set(["customer_type"]);

const TENANT_SELECT_FIELDS = new Set([
  "customer_status", "tenant_lifecycle", "reserve_status",
  "rent_status", "food_preference", "smoking_preference", "pet_preference",
]);
const TENANT_MULTISELECT_FIELDS = new Set(["preferred_area"]);

const LANDLORD_SELECT_FIELDS = new Set([
  "landlord_status", "vendor_status", "account_type",
  "penny_drop_status", "payment_control",
]);

const CONTRACT_SELECT_FIELDS = new Set([
  "contract_type", "state", "business_type", "lock_in_plan",
  "rental_cycle", "lf_settlement_cycle", "monthly_payment_status",
  "move_in_status", "move_out_status",
]);

const PROPERTY_SELECT_FIELDS = new Set([
  "area_name", "property_type", "grade", "rent_cycle",
  "maintenance_cycle", "source",
]);

const ROOM_SELECT_FIELDS = new Set(["room_status"]);

const TICKET_SELECT_FIELDS = new Set([
  "hs_pipeline", "hs_pipeline_stage", "ticket_category",
  "hs_ticket_priority", "cost_paid_by", "ticket_flag",
]);

// ── Contact Mapping (-> Person + Tenant + Landlord) ─────────────────

export function mapContact(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];
  const props = record.properties;

  const personFields = pickFields(
    props, CONTACT_PEOPLE_FIELDS, new Set(), CONTACT_KEY_OVERRIDES,
    new Set(), CONTACT_SELECT_FIELDS, CONTACT_MULTISELECT_FIELDS,
  );
  records.push({ objectType: "person", hubspotId: record.id, fields: personFields });

  const customerType = normalizeValue(props["customer_type"]);

  if (customerType && customerType.toLowerCase().includes("tenant")) {
    const tenantFields = pickFields(
      props, TENANT_FIELDS, TENANT_NUMERIC_FIELDS, TENANT_KEY_OVERRIDES,
      TENANT_CURRENCY_FIELDS, TENANT_SELECT_FIELDS, TENANT_MULTISELECT_FIELDS,
    );
    records.push({ objectType: "tenant", hubspotId: record.id, fields: tenantFields });
  }

  if (customerType && customerType.toLowerCase().includes("landlord")) {
    const landlordFields = pickFields(
      props, LANDLORD_FIELDS, new Set(), LANDLORD_KEY_OVERRIDES,
      new Set(), LANDLORD_SELECT_FIELDS,
    );
    records.push({ objectType: "landlord", hubspotId: record.id, fields: landlordFields });
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
    name: normalizeValue(props["dealname"]),
    amount: toCurrency(props["amount"]),
    closeDate: normalizeValue(props["closedate"]),
    stage: toScreamingSnake(normalizeValue(props["dealstage"])),
    pipelineType: toScreamingSnake(mappedPipeline),
    hubspotRecordId: record.id,
  };

  records.push({ objectType: "opportunity", hubspotId: record.id, fields });
  return { records, errors };
}

// ── Contract Custom Object Mapping ───────────────────────────────────

export function mapContract(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(
    record.properties, CONTRACT_FIELDS, CONTRACT_NUMERIC_FIELDS,
    CONTRACT_KEY_OVERRIDES, CONTRACT_CURRENCY_FIELDS, CONTRACT_SELECT_FIELDS,
  );
  records.push({ objectType: "contract", hubspotId: record.id, fields });
  return { records, errors };
}

// ── Property Custom Object Mapping ───────────────────────────────────

export function mapProperty(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(
    record.properties, PROPERTY_FIELDS, PROPERTY_NUMERIC_FIELDS,
    PROPERTY_KEY_OVERRIDES, PROPERTY_CURRENCY_FIELDS, PROPERTY_SELECT_FIELDS,
  );
  records.push({ objectType: "property", hubspotId: record.id, fields });
  return { records, errors };
}

// ── Room Custom Object Mapping ───────────────────────────────────────

export function mapRoom(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(
    record.properties, ROOM_FIELDS, ROOM_NUMERIC_FIELDS,
    ROOM_KEY_OVERRIDES, ROOM_CURRENCY_FIELDS, ROOM_SELECT_FIELDS,
  );
  records.push({ objectType: "room", hubspotId: record.id, fields });
  return { records, errors };
}

// ── Ticket Mapping ───────────────────────────────────────────────────

export function mapTicket(record: HubSpotRecord): MappedOutput {
  const records: TwentyRecord[] = [];
  const errors: MappingError[] = [];

  const fields = pickFields(
    record.properties, TICKET_FIELDS, TICKET_NUMERIC_FIELDS,
    TICKET_KEY_OVERRIDES, TICKET_CURRENCY_FIELDS, TICKET_SELECT_FIELDS,
  );
  records.push({ objectType: "ticket", hubspotId: record.id, fields });
  return { records, errors };
}

// ── Dispatcher ───────────────────────────────────────────────────────

export type ObjectMapper = (record: HubSpotRecord) => MappedOutput;

export const OBJECT_MAPPERS: Record<string, ObjectMapper> = {
  contacts: mapContact,
  deals: mapDeal,
  tickets: mapTicket,
  "2-174881983": mapContract,
  "2-32303497": mapProperty,
  "2-31206651": mapRoom,
};
