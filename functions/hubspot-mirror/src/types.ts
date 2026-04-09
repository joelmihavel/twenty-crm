// ── HubSpot API Types ──────────────────────────────────────────────────

export type HubSpotObjectType =
  | "contacts"
  | "deals"
  | "tickets"
  | "2-35314522"   // Contract custom object
  | "2-35314851"   // Property ID custom object
  | "2-35432178";  // Room ID custom object

export interface HubSpotRecord {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotSearchResponse {
  total: number;
  results: HubSpotRecord[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

// ── Twenty CRM Types ──────────────────────────────────────────────────

export type TwentyObjectType =
  | "person"
  | "tenant"
  | "landlord"
  | "opportunity"
  | "contract"
  | "property"
  | "room"
  | "ticket";

export interface TwentyRecord {
  objectType: TwentyObjectType;
  hubspotId: string;
  fields: Record<string, unknown>;
}

export interface TwentyUpsertResult {
  success: boolean;
  hubspotId: string;
  twentyId?: string;
  error?: string;
}

export interface TwentyBatchResult {
  successful: number;
  failed: number;
  errors: Array<{
    hubspotId: string;
    objectType: TwentyObjectType;
    error: string;
  }>;
}

// ── Field Mapping Types ───────────────────────────────────────────────

export interface MappedOutput {
  records: TwentyRecord[];
  errors: MappingError[];
}

export interface MappingError {
  hubspotId: string;
  objectType: HubSpotObjectType;
  field?: string;
  message: string;
}

// ── Checkpoint Types ──────────────────────────────────────────────────

export interface Checkpoint {
  lastSyncTimestamp: string;  // ISO 8601
  lastSyncEpochMs: number;
  objectCheckpoints: Partial<Record<HubSpotObjectType, string>>;
}

// ── Pipeline Mapping ──────────────────────────────────────────────────

export const PIPELINE_MAP: Record<string, string> = {
  "Reserve": "Reserve",
  "Occupancy Pipeline": "Occupancy",
  "F4B": "F4B",
} as const;

// ── Sync Configuration ───────────────────────────────────────────────

export interface SyncConfig {
  hubspotApiKey: string;
  twentyApiKey: string;
  gcsBucket: string;
  gcsCheckpointPath: string;
  hubspotBaseUrl: string;
  twentyApiUrl: string;
  batchSize: number;
  maxRetriesOn429: number;
}

export const DEFAULT_CONFIG: Pick<
  SyncConfig,
  "hubspotBaseUrl" | "twentyApiUrl" | "batchSize" | "maxRetriesOn429" | "gcsBucket" | "gcsCheckpointPath"
> = {
  hubspotBaseUrl: "https://api.hubapi.com",
  twentyApiUrl: "https://crm.flent.in/api/graphql",
  batchSize: 60,
  maxRetriesOn429: 3,
  gcsBucket: "flent-hubspot-mirror",
  gcsCheckpointPath: "checkpoint.json",
};

// ── Object Type IDs for Custom Objects ────────────────────────────────

export const HUBSPOT_OBJECT_IDS = {
  contacts: "contacts",
  deals: "deals",
  tickets: "tickets",
  contract: "2-35314522",
  property: "2-35314851",
  room: "2-35432178",
} as const;

// ── Whitelisted Properties per Object Type ────────────────────────────

export const CONTACT_PEOPLE_FIELDS = [
  "firstname",
  "lastname",
  "email",
  "phone",
  "customer_type",
  "city",
  "aadhar_number",
  "pan_card",
  "country_code",
  "lead_source",
  "lead_sub_source",
] as const;

export const TENANT_FIELDS = [
  "tenant_lifecycle",
  "reserve_status",
  "tenant_monthly_rent",
  "tenant_base_rent",
  "monthly_maintenance",
  "convenience_fee",
  "platform_fee",
  "tenant_gst",
  "furnishing_rental",
  "rent_due",
  "rent_status",
  "first_month_rent",
  "real_move_in_date",
  "move_out_date",
  "preferred_area",
  "budget",
  "food_preference",
  "smoking_preference",
  "pet_preference",
  "nps_score",
  "customer_status",
] as const;

export const LANDLORD_FIELDS = [
  "cashfree_vendor_id",
  "vendor_status",
  "bank_account_number",
  "ifsc_code",
  "account_holder_name",
  "account_type",
  "penny_drop_status",
] as const;

export const DEAL_FIELDS = [
  "dealname",
  "amount",
  "closedate",
  "dealstage",
  "pipeline",
] as const;

export const CONTRACT_FIELDS = [
  "contract_id",
] as const;

export const PROPERTY_FIELDS = [
  "pid",
] as const;

export const ROOM_FIELDS = [
  "roomid",
] as const;

export const TICKET_FIELDS = [
  "subject",
  "content",
  "hs_pipeline",
  "hs_pipeline_stage",
  "hs_ticket_priority",
  "hs_ticket_category",
  "createdate",
  "hs_lastmodifieddate",
] as const;
