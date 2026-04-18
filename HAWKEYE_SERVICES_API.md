# HAWKEYE_SERVICES_API.md
# Complete service layer reference — every function signature, endpoint, return type, and filter
# Audience: Claude Code (frontend build) + Backend engineering team (API implementation)

---

## PURPOSE

The frontend calls **service functions**. Those functions currently return mock data.
When the backend is ready, each function **body** is replaced with a real `fetch()` call —
the function name, parameters, and return type never change.

**Claude Code:** build every component against these function signatures. Never import
from `/src/mock/` directly in a component or page file.

**Backend team:** implement every endpoint in the summary table at the bottom.
Match the TypeScript return types exactly. Zero frontend changes required on your end.

---

## GLOBAL CONFIG

```ts
// src/services/config.ts

// ─── BACKEND PLUG ────────────────────────────────────────────────────────────
// 1. Set BASE_URL to your API root when going live.
//    e.g.  export const BASE_URL = 'https://api.flent.co/v1';
// 2. Remove simulateLatency() calls from every service function.
// 3. Everything else stays the same.
// ─────────────────────────────────────────────────────────────────────────────
export const BASE_URL = ''; // empty string = mock mode

/** Simulates realistic API latency in mock mode. DELETE when going live. */
export function simulateLatency(ms = 80 + Math.random() * 120): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Converts a filters object into a URL query string, skipping undefined/null. */
export function toQueryString(filters: Record<string, unknown>): string {
  return new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => [k, String(v)])
  ).toString();
}
```

---

## SHARED TYPES

```ts
// src/types/shared.types.ts

export type HistoryEntryType =
  | 'stage_change'
  | 'field_update'
  | 'linked_event'
  | 'note'
  | 'payment'
  | 'document'
  | 'assignment';

export type HistoryEntry = {
  id: string;
  timestamp: string; // ISO datetime
  type: HistoryEntryType;
  actor: string;     // internal team member name
  summary: string;   // one-line display text
  detail?: string;   // optional expanded text
  linkedObject?: {
    type:
      | 'tenant' | 'merchant' | 'pid' | 'rid'
      | 'contract' | 'transaction' | 'ticket'
      | 'vendor' | 'item';
    id: string;
    label: string;
  };
  previousValue?: string;
  newValue?: string;
};

export type LocationRecord = {
  id: string;
  from_date: string;  // ISO date
  to_date?: string;   // null = current location
  location: string;   // '09BR2' | 'WH01-R3' etc.
  state: ItemState;
  tenant_id?: string;
  tenant_name?: string;
};

export type TenantLifecycleStage =
  | 'New Inquiry'
  | 'Visit Scheduled'
  | 'Visit Done'
  | 'Negotiation'
  | 'Converted'
  | 'Gestation'
  | 'Moved In'
  | 'Notice Period'
  | 'Moved Out'
  | 'Dead Lead';

export type ItemState =
  | 'BUY' | 'WIB' | 'WOB' | 'PIB' | 'POB' | 'WORK' | 'DEAD';
```

---

## SERVICE 1 — TENANTS

**File:** `src/services/tenants.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/tenants?${toQueryString(filters)}`)
export async function getTenants(filters?: TenantFilters): Promise<Tenant[]>

// MOCK — replace with: fetch(`${BASE_URL}/tenants/${id}`)
export async function getTenantById(id: string): Promise<Tenant | null>

// MOCK — replace with: fetch(`${BASE_URL}/tenants/${id}/history`)
export async function getTenantHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: POST fetch(`${BASE_URL}/tenants`, body)
export async function createTenant(data: Partial<Tenant>): Promise<Tenant>

// MOCK — replace with: PATCH fetch(`${BASE_URL}/tenants/${id}`, { tenant_lifecycle: stage })
export async function updateTenantLifecycle(
  id: string,
  stage: TenantLifecycleStage
): Promise<Tenant>
```

### Filter type

```ts
export type TenantFilters = Partial<{
  lifecycle: TenantLifecycleStage;
  qualification_status: 'Qualified' | 'Not Qualified' | 'Dead' | 'Paused';
  channel: string;
  bgv_status: 'Not Started' | 'In Progress' | 'Passed' | 'Failed';
  rent_status: 'Paid' | 'Overdue' | 'Upcoming';
  aging_bucket: '1-5' | '6-10' | '11-15' | '15+';
  pid: string;
  month: string;   // YYYY-MM — used for dashboard click-through drill-downs
  search: string;  // matches first_name + last_name + mobile_phone
}>;
```

### Return type (all 62 fields from taxonomy)

```ts
export type Tenant = {
  // Identity
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  whatsapp_phone?: string;
  gender: 'Male' | 'Female';
  date_of_birth?: string;
  aadhaar_number?: string;
  aadhaar_front_image?: string;   // File URL
  aadhaar_back_image?: string;    // File URL
  pan?: string;
  pan_card_image?: string;        // File URL
  linkedin_url?: string;
  twitter_url?: string;
  instagram_id?: string;
  occupation?: string;
  employer_name?: string;

  // Attribution — locked at first touch, never overwritten
  create_date: string;
  first_inquiry_channel: string;
  source_drilldown_1?: string;
  source_drilldown_2?: string;
  wax_code?: string;
  google_click_id?: string;
  facebook_click_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;

  // Requirements
  preferred_micromarkets?: string[];
  preferred_occupancy_type?: string;
  preferred_furnished_type?: string;
  preferred_move_in_timeline?: string;
  gender_preferences?: string;
  food_preferences?: string;
  has_pet?: boolean;
  smoking_preferences?: string;
  custom_preference?: string;
  budget_max?: number;

  // Lifecycle
  tenant_lifecycle: TenantLifecycleStage;
  current_pid?: string;
  current_rid?: string;

  // Qualification
  qualification_status?: 'Qualified' | 'Not Qualified' | 'Dead' | 'Paused';
  disqualification_reason?: string;
  disqualification_detail?: string;
  bgv_status?: 'Not Started' | 'In Progress' | 'Passed' | 'Failed';
  bgv_report?: string;            // File URL
  bgv_completed_date?: string;

  // Visit summary
  total_visits_count: number;
  visits_cancelled?: number;
  visits_completed?: number;
  first_visit_date?: string;
  rids_visited?: string;
  feedback?: string;

  // Satisfaction
  onboarding_csat_score?: number;
  offboarding_csat_score?: number;
  last_nps_score?: number;
  last_nps_date?: string;
  nps_category?: 'Promoter' | 'Passive' | 'Detractor';
  last_nps_comment?: string;

  history: HistoryEntry[];
};
```

---

## SERVICE 2 — MERCHANTS

**File:** `src/services/merchants.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/merchants?${toQueryString(filters)}`)
export async function getMerchants(filters?: MerchantFilters): Promise<Merchant[]>

// MOCK — replace with: fetch(`${BASE_URL}/merchants/${id}`)
export async function getMerchantById(id: string): Promise<Merchant | null>

// MOCK — replace with: fetch(`${BASE_URL}/merchants/${id}/history`)
export async function getMerchantHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: POST fetch(`${BASE_URL}/merchants`, body)
export async function createMerchant(data: Partial<Merchant>): Promise<Merchant>
```

### Filter type

```ts
export type MerchantFilters = Partial<{
  merchant_type: 'Landlord' | 'POC' | 'Lead' | 'Broker' | 'Management';
  deal_stage: string;
  city: string;
  search: string;  // matches first_name + last_name + phone
}>;
```

### Return type (all 32 fields from taxonomy)

```ts
export type Merchant = {
  id: string;
  merchant_type: 'Landlord' | 'POC' | 'Lead' | 'Broker' | 'Management';

  // Lead info
  lead_source?: string;
  prefix?: 'Mr' | 'Mrs' | 'Ms' | 'Dr';
  first_name: string;
  last_name: string;
  email?: string;
  country_code: string;
  phone: string;
  current_city?: string;
  unique_id?: string;
  disqualification_reason?: string;
  lost_reason?: string;

  // Psychographics
  landlord_personality?: string;
  general_ll_comments?: string;
  potentially_multihome?: boolean;

  // Demographics
  designation?: string;
  organization?: string;

  // Identity documents
  aadhaar_back?: string;          // File URL
  pan_number?: string;
  pan_card_image?: string;        // File URL

  // Payment details
  bank_account_number?: string;
  beneficiary_name?: string;
  ifsc_code?: string;

  // Address
  current_residential?: string;
  permanent_residential?: string;

  // Management contact
  management_email?: string;
  management_phone?: string;

  // Permissions & meta
  communications_permission?: boolean;
  signing_authority: boolean;
  linkedin_url?: string;
  first_added: string;
  last_updated: string;

  history: HistoryEntry[];
};
```

---

## SERVICE 3 — PIDs

**File:** `src/services/pids.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/pids?${toQueryString(filters)}`)
export async function getPids(filters?: PidFilters): Promise<PID[]>

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}`)
export async function getPidById(id: string): Promise<PID | null>

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/history`)
export async function getPidHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/rids`)
// Used by Active Occupancy Block on PID detail right sidebar
export async function getRidsByPid(pid: string): Promise<RID[]>

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/tenants/current`)
// Used by "All Time Tenants" sidebar panel
export async function getCurrentTenantsByPid(pid: string): Promise<Tenant[]>
```

### Filter type

```ts
export type PidFilters = Partial<{
  pid_type: 'lead' | 'active' | 'churned';
  cluster: string;
  deal_stage: string;
  deal_owner: string;
  search: string;  // matches pid, address, building_society
}>;
```

### Return type (all 51 fields from taxonomy, conditional on pid_type)

```ts
export type PID = {
  id: string;
  pid_type: 'lead' | 'active' | 'churned';
  merchant_id?: string;

  // Lead stage block (relevant when pid_type === 'lead')
  ppid?: string;
  date_added?: string;
  units_count?: number;
  deal_type?: 'Residence Lead' | 'Enterprise Lead';
  apartment_count?: number;
  property_type_lead?: string;
  cluster?: string;
  deal_owner?: string;
  furnishing_lead?: string;
  expected_rent?: number;
  google_map_location_lead?: string;
  deal_stage?: string;
  disqualification_reason?: string;
  lost_reason?: string;
  exploratory_visit_score?: number;
  potential_report?: string;        // File URL

  // Active block (relevant when pid_type === 'active' | 'churned')
  pid?: string;
  house_no?: string;
  property_type?: string;
  active_units_count?: number;
  tier?: string;
  floor?: string;
  google_map_location?: string;     // Google Maps URL
  address?: string;
  building_society?: string;
  active_cluster?: string;
  parking_type?: string[];
  parking_number?: string;
  power_backup?: string;
  water_source?: string[];
  restrictions?: string;
  other_notes?: string;
  furniture_movement?: string;
  furnishing_status?: string;
  ll_extra_clauses?: string;
  final_approved_amt?: number;
  final_invoice?: string;           // File URL
  payment_collection?: 'Upfront' | 'Straight Deduction' | 'EMI';
  emi_period?: number;
  opex_collections?: number;
  prop_mgmt_app?: string;
  rules_regulations?: string;       // File URL
  garbage_disposal?: string;
  timing_restrictions?: string;
  move_in_out_formalities?: string;
  rent_deadline?: string;
  overheads_deadline?: string;
  active_deal_owner?: string;
  psm_owner?: string;

  // Churned block (relevant when pid_type === 'churned')
  deposit_refunded?: boolean;
  exit_cost_opx?: number;

  history: HistoryEntry[];
};
```

---

## SERVICE 4 — RIDs

**File:** `src/services/rids.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/rids?${toQueryString(filters)}`)
export async function getRids(filters?: RidFilters): Promise<RID[]>

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}`)
export async function getRidById(id: string): Promise<RID | null>

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}/history`)
export async function getRidHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}/items`)
// Used by Current Inventory panel + Inspection Checklist form
export async function getItemsByRid(rid: string): Promise<Item[]>
```

### Filter type

```ts
export type RidFilters = Partial<{
  pid: string;
  room_status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Blocked';
  bed_type: 'Single' | 'Double' | 'Queen' | 'King';
  ac: boolean;
  search: string;  // matches rid
}>;
```

### Return type (all 17 fields from taxonomy)

```ts
export type RID = {
  id: string;
  rid: string;                  // e.g. '09BR2'
  pid: string;                  // e.g. 'PID9'

  // Specifications
  attached_bathroom?: boolean;
  balcony?: boolean;

  // Furnishing & inventory
  bed_type?: 'Single' | 'Double' | 'Queen' | 'King';
  ac?: boolean;
  ac_type?: 'Split' | 'Window' | 'Portable' | 'Not Possible';
  ac_feasibility?: string;
  study_table?: boolean;
  annexure?: string;            // File URL
  annexure_last_update_date?: string;

  // Commercials
  base_rent: number;
  maintenance_fee?: number;

  // Availability
  room_status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Blocked';
  current_contract_id?: string;
  current_tenant_name?: string;
  available_from?: string;

  history: HistoryEntry[];
};
```

---

## SERVICE 5 — CONTRACTS

**File:** `src/services/contracts.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/contracts?${toQueryString(filters)}`)
export async function getContracts(filters?: ContractFilters): Promise<Contract[]>

// MOCK — replace with: fetch(`${BASE_URL}/contracts/${id}`)
export async function getContractById(id: string): Promise<Contract | null>

// MOCK — replace with: fetch(`${BASE_URL}/contracts/${id}/history`)
export async function getContractHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/contracts?tenant_id=${tenantId}`)
// Used by Tenant Detail "All Tenancies" sidebar panel
export async function getContractsByTenant(tenantId: string): Promise<Contract[]>

// MOCK — replace with: fetch(`${BASE_URL}/contracts?pid=${pid}`)
// Used by PID Detail Financials tab
export async function getContractsByPid(pid: string): Promise<Contract[]>
```

### Filter type

```ts
export type ContractFilters = Partial<{
  applies_to: 'Tenant' | 'Merchant';
  contract_type: 'L&L' | 'Authorisation' | 'C&S';
  payment_lifecycle: string;
  pid: string;
  rid: string;
  search: string;  // matches contract_uid, party name
}>;
```

### Return type (all 46 fields from taxonomy)

```ts
export type Contract = {
  id: string;
  contract_uid: string;
  applies_to: 'Tenant' | 'Merchant';
  contract_type: 'L&L' | 'Authorisation' | 'C&S';

  // Identity
  party_name_tenant?: string;
  tenant_id?: string;
  party_name_merchant?: string;
  merchant_id?: string;
  rid?: string;
  pid?: string;

  // Terms
  contract_start_date: string;
  contract_end_date: string;
  service_term: number;
  lock_in_duration?: number;
  lock_in_end_date?: string;          // Auto-calculated
  preferred_move_out_date?: string;   // Tenant only
  notice_period?: number;
  key_handover_date?: string;         // Merchant only
  increment_percentage?: number;      // Merchant only
  increment_frequency?: 'Annual' | 'Biennial' | 'None'; // Merchant only

  // Lifecycle status
  payment_lifecycle?:
    | 'Token Paid'
    | 'FMR Paid'
    | 'SD Paid'
    | 'FMR and SD Cleared'
    | 'Payments Done';                // Tenant only
  agreement_lifecycle?:
    | 'L&L and C&S Released'
    | 'L&L Signed'
    | 'C&S Signed'
    | 'All agreements signed';        // Tenant only
  agreement_status?:
    | 'Negotiation'
    | 'Triggered'
    | 'Active';                       // Merchant only

  // Tenant commercials
  total_retail_rent?: number;
  monthly_license_fee?: number;
  maintenance_fee?: number;
  furnishing_fee?: number;
  convenience_fee?: number;
  gst?: number;
  discount_amount?: number;
  effective_retail_rent?: number;     // Auto-calculated: total - discount
  security_deposit?: number;
  caution_deposit?: number;
  lock_in_fee?: number;
  exit_fee?: number;

  // Merchant commercials
  base_rent?: Array<{ period_months: number; amount: number }>; // hike schedule array
  merchant_security_deposit?: number;
  management_fee_per_month?: number;
  total_cogs?: number;
  contract_acquisition_cost?: number;
  contract_acquisition_cost_paid_to?: number;
  payment_cycle?: 'Prepaid' | 'Postpaid';
  payment_deadline?: string;

  // Deductions (Tenant only)
  damages_deductions?: number;
  society_fees?: number;
  penalty?: number;

  // Contract status (Tenant only)
  fmr_status?: string;
  deposit_paid_status?: string;

  // Documents
  agreement_pdf?: string;             // File URL
  inventory_list?: string;            // File URL, Merchant only

  history: HistoryEntry[];
};
```

---

## SERVICE 6 — TRANSACTIONS

**File:** `src/services/transactions.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/transactions?${toQueryString(filters)}`)
export async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]>

// MOCK — replace with: fetch(`${BASE_URL}/transactions/${id}`)
export async function getTransactionById(id: string): Promise<Transaction | null>

// MOCK — replace with: fetch(`${BASE_URL}/transactions?contract_uid=${uid}`)
// Used by Contract Detail sidebar + Transaction Drawer "other transactions"
export async function getTransactionsByContract(contractUid: string): Promise<Transaction[]>

// MOCK — replace with: fetch(`${BASE_URL}/transactions?contact_id=${id}`)
// Used by Transaction Drawer "all transactions for this contact"
export async function getTransactionsByContact(contactId: string): Promise<Transaction[]>

// MOCK — replace with: fetch(`${BASE_URL}/transactions?pid=${pid}`)
export async function getTransactionsByPid(pid: string): Promise<Transaction[]>
```

### Filter type

```ts
export type TransactionFilters = Partial<{
  credit_debit: 'Credit' | 'Debit';
  purpose_category_1: string;
  pid: string;
  rid: string;
  month: string;    // YYYY-MM
  search: string;   // matches utn, from_party, to_party, description
}>;
```

### Return type (all 25 fields from taxonomy)

```ts
export type Transaction = {
  id: string;
  utn: string;                        // Unique Transaction Number — monospace
  credit_debit: 'Credit' | 'Debit';
  transaction_date: string;
  amount: number;                     // Always positive

  // Classification
  purpose_category_1: string;         // OPEX/CAPEX/REVENUE/COGS/REFUNDS/etc.
  purpose_category_2: string;         // DEPOSIT/RENT/CUSTOMER EXPERIENCE/etc.

  // Parties
  from_party: string;
  from_party_type: string;
  from_party_info?: string;
  to_party: string;
  to_party_type: string;

  // Payment details
  payment_channel?: string;
  payment_provider?: string;
  gateway_reference_id?: string;      // monospace

  // Audit
  created_by: string;
  created_date: string;
  authorised_by?: string;
  authorised_date?: string;

  // Line items
  line_item_date?: string;
  cost_revenue_center?: string;
  line_item_description?: string;     // format: "[work], [RID], [owner], [cost_code]"

  // Links
  contract_uid?: string;
  contact_id?: string;
  pid?: string;
  rid?: string;
};
```

---

## SERVICE 7 — TICKETS

**File:** `src/services/tickets.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/tickets?${toQueryString(filters)}`)
export async function getTickets(filters?: TicketFilters): Promise<Ticket[]>

// MOCK — replace with: fetch(`${BASE_URL}/tickets/${id}`)
export async function getTicketById(id: string): Promise<Ticket | null>

// MOCK — replace with: fetch(`${BASE_URL}/tickets/${id}/history`)
export async function getTicketHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/tickets?tenant_id=${id}`)
// Used by Tenant Detail sidebar + analytics
export async function getTicketsByTenant(tenantId: string): Promise<Ticket[]>

// MOCK — replace with: fetch(`${BASE_URL}/tickets?pid=${pid}`)
// Used by PID Detail sidebar + ticket category chart
export async function getTicketsByPid(pid: string): Promise<Ticket[]>

// MOCK — replace with: PATCH fetch(`${BASE_URL}/tickets/${id}`, { ticket_status: status })
// Used by inline status Tag click-to-edit on Ticket Detail
export async function updateTicketStatus(id: string, status: string): Promise<Ticket>
```

### Filter type

```ts
export type TicketFilters = Partial<{
  pipeline: 'Tenant' | 'Landlord';
  ticket_status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  ticket_category: string;
  ticket_owner: string;
  pid: string;
  search: string;  // matches ticket_id, ticket_name, description
}>;
```

### Return type (all 33 fields from taxonomy)

```ts
export type Ticket = {
  id: string;

  // Identity
  pipeline: 'Tenant' | 'Landlord';
  ticket_id: string;                  // monospace
  create_date: string;
  created_by: string;
  ticket_name?: string;               // Tenant tickets only
  ticket_description: string;
  ticket_owner: string;
  conversation_id?: string;
  pid: string;
  rid?: string;

  // Categorisation
  ticket_category: string;
  ticket_status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
  category_phase?: 'Pre Move-In' | 'Gestation' | 'Active';
  time_slot?: string;
  ticket_flag?: 'Reasonable' | 'Not Reasonable' | 'Subjective';
  flag_notes?: string;

  // Execution
  resolution_notes?: string;          // editable on detail page
  notes?: string;                     // append-only timeline log
  collected_from_tenant?: number;
  collected_from_merchant?: number;
  total_cost?: number;                // Auto-calculated
  transaction_id?: string;
  assigned_vendor?: string;
  vendor_group_chat_id?: string;
  related_tickets?: string;           // comma-separated IDs

  // SLA & feedback
  first_response_mins?: number;
  time_to_first_rep_assignment?: number;
  time_to_first_response_sla_hours?: number;
  time_to_close_hours?: number;
  tenant_rating?: number;             // 1-5 stars
  csat_feedback?: string;
  csat_response?: string;

  history: HistoryEntry[];
};
```

---

## SERVICE 8 — VENDORS

**File:** `src/services/vendors.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/vendors?${toQueryString(filters)}`)
export async function getVendors(filters?: VendorFilters): Promise<Vendor[]>

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}`)
export async function getVendorById(id: string): Promise<Vendor | null>

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/history`)
export async function getVendorHistory(id: string): Promise<HistoryEntry[]>
```

### Filter type

```ts
export type VendorFilters = Partial<{
  vendor_type: string;
  city: string;
  quality_tier: 'T1' | 'T2' | 'T3';
  search: string;  // matches vendor_code, vendor_name, contact_name
}>;
```

### Return type (all 27 fields from taxonomy)

```ts
export type Vendor = {
  id: string;
  vendor_code: string;        // 2-letter code e.g. 'GR', 'MA' — monospace
  vendor_name: string;
  vendor_type: 'Manufacturer' | 'Wholesaler' | 'Distributor' | 'Freelancer' | 'Aggregator' | 'Retailer' | 'Landlord';

  // Contact
  contact_name: string;
  phone: string;
  alternate_phone?: string;
  email: string;
  city: string;
  address: string;

  // Billing
  gst_number?: string;
  pan?: string;
  billing_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  msme_vendor?: 'Yes' | 'No';
  udyam_aadhaar?: string;

  // Capability
  specialization: string;
  tat_in_days: number;
  customization_capability: 'Low' | 'Medium' | 'High';
  standardisation_fit: 'C1' | 'C2' | 'C3';

  // Commercials
  quality_tier: 'T1' | 'T2' | 'T3';
  payment_terms?: string;
  min_order_value?: number;
  negotiation_remarks?: string;

  // Meta
  created_at: string;
  updated_at: string;

  history: HistoryEntry[];
};
```

---

## SERVICE 9 — FSINs

**File:** `src/services/fsins.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/fsins?${toQueryString(filters)}`)
export async function getFsins(filters?: FsinFilters): Promise<FSIN[]>

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}`)
export async function getFsinById(id: string): Promise<FSIN | null>

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}/history`)
export async function getFsinHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}/items`)
// Used by FSIN Detail Physical Units sidebar panel
export async function getItemsByFsin(fsinId: string): Promise<Item[]>
```

### Filter type

```ts
export type FsinFilters = Partial<{
  category: string;
  vendor_code: string;
  packaging: 'Flatpack' | 'Assembled';
  stock_status: 'Sufficient' | 'Reorder';  // derived: count vs reorder_point
  search: string;  // matches fsin_code, item_name
}>;
```

### Return type (all 17 fields from taxonomy)

```ts
export type FSIN = {
  id: string;
  fsin_code: string;          // e.g. 'AA10001' — monospace
  vendor_code: string;
  item_name: string;
  category: string;
  uom: string;
  image: string;              // URL — render as 48×48 placeholder box
  reorder_point?: number;
  annual_depreciation: number;
  perceived_value?: number;

  // Specification
  dimensions?: string;
  material?: string;
  finish?: string;
  color?: string;
  style?: string;
  attribute?: string;

  // Others
  packaging: 'Flatpack' | 'Assembled';
  lego: number;

  history: HistoryEntry[];
};
```

---

## SERVICE 10 — ITEMS

**File:** `src/services/items.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/items?${toQueryString(filters)}`)
export async function getItems(filters?: ItemFilters): Promise<Item[]>

// MOCK — replace with: fetch(`${BASE_URL}/items/${id}`)
export async function getItemById(id: string): Promise<Item | null>

// MOCK — replace with: fetch(`${BASE_URL}/items/${id}/history`)
// History tab is the PRIMARY view on Item Detail — serves Location History Table + Timeline
export async function getItemHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/items?location=${rid}`)
// Used by RID Detail inventory panel + Inspection Checklist form
export async function getItemsByRid(rid: string): Promise<Item[]>
```

### Filter type

```ts
export type ItemFilters = Partial<{
  state: ItemState;
  fsin_code: string;
  qa_flag: 'Yes' | 'No';
  search: string;  // matches item_code, serial_no
}>;
```

### Return type (all 17 fields + derived fields from taxonomy)

```ts
export type Item = {
  id: string;
  item_code: string;          // monospace
  fsin_code: string;
  po_line_id: string;         // monospace
  created_at: string;
  serial_no: number;
  unit_price: number;         // from PO, never changes
  gst_percent?: number;       // derived from PO

  // State
  lock: boolean;
  lock_by_pfs?: string;
  locked_at?: string;
  location?: string;          // '09BR2' | 'WH01-R3' etc.
  state: ItemState;
  state_time?: string;
  latest_snapshot_date?: string;
  snapshot?: string;          // URL — render as 80×80 image placeholder
  utilised_at?: string;

  // Quality
  qa_flag?: 'Yes' | 'No';

  // Transaction links
  bill_document_id?: string;  // File URL
  txn_no?: string;            // UTN — opens Transaction Drawer

  history: HistoryEntry[];
  location_history: LocationRecord[];  // drives Location History Table on Item Detail
};
```

---

## SERVICE 11 — OVERHEADS

**File:** `src/services/overheads.service.ts`

### Functions

```ts
// MOCK — replace with: fetch(`${BASE_URL}/overheads?${toQueryString(filters)}`)
export async function getOverheads(filters?: OverheadFilters): Promise<Overhead[]>

// MOCK — replace with: fetch(`${BASE_URL}/overheads/${id}`)
export async function getOverheadById(id: string): Promise<Overhead | null>

// MOCK — replace with: fetch(`${BASE_URL}/overheads/${id}/history`)
export async function getOverheadHistory(id: string): Promise<HistoryEntry[]>

// MOCK — replace with: fetch(`${BASE_URL}/overheads?pid=${pid}`)
// Used by PID Detail Overheads sidebar panel
export async function getOverheadsByPid(pid: string): Promise<Overhead[]>
```

### Filter type

```ts
export type OverheadFilters = Partial<{
  pid: string;
  category_type: OverheadCategoryType;
  object_type: 'Recurring' | 'One-Time';
  frequency: 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annually';
}>;

export type OverheadCategoryType =
  | 'Maintenance'
  | 'WiFi'
  | 'DG (Generator)'
  | 'Water'
  | 'Water Purifier'
  | 'Gas Connection'
  | 'Electricity'
  | 'Helper';
```

### Return type (base + all 8 category-specific blocks from taxonomy)

```ts
export type Overhead = {
  id: string;

  // Base fields — always present
  pid: string;
  category_type: OverheadCategoryType;
  object_type: 'Recurring' | 'One-Time';
  frequency?: 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annually';
  start_date?: string;
  end_date?: string;
  document?: string;                  // File URL

  // Maintenance (category_type === 'Maintenance')
  maintenance_amount?: number;
  maintenance_cutoff_date?: string;   // e.g. '10th'
  maintenance_cycle?: 'Prepaid' | 'Postpaid';
  maintenance_pay_to_ll?: boolean;
  maintenance_collect_tenant?: boolean;

  // WiFi (category_type === 'WiFi')
  wifi_provider?: 'ACT' | 'Airtel' | 'Tata';
  wifi_account_id?: string;
  wifi_start_date?: string;
  wifi_plan_duration?: number;
  wifi_end_date?: string;
  wifi_plan_cost?: number;
  wifi_ssid?: string;
  wifi_password?: string;             // ALWAYS masked in UI: ••••••
  wifi_ownership?: string;
  wifi_amount?: number;
  wifi_registered_number?: string;
  wifi_collect_tenant?: boolean;

  // Electricity (category_type === 'Electricity')
  electricity_provider?: string;
  electricity_connection_type?: string;
  electricity_account_no?: string;
  electricity_password?: string;      // ALWAYS masked in UI: ••••••
  electricity_ownership?: string;
  electricity_pay_to_ll?: boolean;
  electricity_collect_tenant?: boolean;

  // DG / Generator (category_type === 'DG (Generator)')
  dg_brand_details?: string;
  dg_capacity_kva?: number;
  dg_maintenance_schedule?: string;
  dg_fuel_tank_capacity?: number;
  dg_refill_unit_litres?: number;
  dg_amount?: number;
  dg_pay_to_ll?: boolean;
  dg_collect_tenant?: boolean;

  // Water (category_type === 'Water')
  water_account_no?: string;
  water_password?: string;            // ALWAYS masked in UI: ••••••
  water_ownership?: string;
  water_payments_dues?: number;
  water_pay_to_ll?: boolean;
  water_collect_tenant?: boolean;

  // Water Purifier (category_type === 'Water Purifier')
  purifier_type?: string;             // Rented | Owned
  purifier_brand?: string;
  purifier_serial_no?: string;
  purifier_cost?: number;
  purifier_ownership?: string;
  purifier_start_date?: string;
  purifier_duration?: number;
  purifier_pay_to_ll?: boolean;
  purifier_collect_tenant?: boolean;

  // Gas Connection (category_type === 'Gas Connection')
  gas_connection_type?: string;       // Pipeline | Cylinder | LPG
  gas_account_no?: string;
  gas_password?: string;              // ALWAYS masked in UI: ••••••
  gas_ownership?: string;
  gas_pay_to_ll?: boolean;
  gas_collect_tenant?: boolean;

  // Helper (category_type === 'Helper')
  helper_name?: string;
  helper_phone?: string;
  helper_role?: 'Caretaker' | 'Cleaner' | 'Security' | 'Cook' | 'Maintenance' | 'Other';
  helper_salary?: number;
  helper_hours?: string;
  helper_responsibilities?: string;
  helper_pay_to_ll?: boolean;
  helper_collect_tenant?: boolean;

  history: HistoryEntry[];
};
```

---

## SERVICE 12 — ANALYTICS

**File:** `src/services/analytics.service.ts`

All analytics functions power charts. They accept optional params for filtering by time range or entity ID. Return types are listed inline — define them all in `src/types/analytics.types.ts`.

```ts
// ─── BACKEND PLUG ────────────────────────────────────────────────────────────
// Implement all analytics endpoints under: ${BASE_URL}/analytics/
// Entity-level analytics live under the entity route:
//   ${BASE_URL}/tenants/:id/analytics/...
//   ${BASE_URL}/pids/:id/analytics/...   etc.
// ─────────────────────────────────────────────────────────────────────────────

// — Demand Dashboard charts —

// MOCK — replace with: fetch(`${BASE_URL}/analytics/lead-sources?${month ? 'month='+month : ''}`)
export async function getLeadSources(month?: string): Promise<LeadSourceData[]>
// LeadSourceData = { channel: string; count: number; percentage: number }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/demand-funnel`)
export async function getDemandFunnel(): Promise<FunnelStageData[]>
// FunnelStageData = { stage: string; count: number; fill: string }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/conversion-trend?months=6`)
export async function getConversionTrend(months?: number): Promise<MonthlyConversionData[]>
// MonthlyConversionData = { month: string; conversions: number }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/pipeline-stage-breakdown`)
export async function getPipelineBreakdown(): Promise<StageBreakdownData[]>
// StageBreakdownData = { stage: string; count: number; color: string }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/visit-conversion?months=6`)
export async function getVisitConversionData(months?: number): Promise<VisitConversionData[]>
// VisitConversionData = { month: string; visits: number; conversions: number; rate: number }

// — Rent Dashboard charts —

// MOCK — replace with: fetch(`${BASE_URL}/analytics/collection-trend?months=6`)
export async function getCollectionTrend(months?: number): Promise<MonthlyCollectionData[]>
// MonthlyCollectionData = { month: string; collected: number; target: number }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/collection-status`)
export async function getCollectionStatus(): Promise<CollectionStatusData[]>
// CollectionStatusData = { status: 'Paid' | 'Overdue' | 'Upcoming'; count: number; amount: number }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/overdue-aging`)
export async function getOverdueAging(): Promise<OverdueAgingData[]>
// OverdueAgingData = { bucket: string; count: number; totalAmount: number; color: string }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/landlord-payout-by-cluster`)
export async function getLandlordPayoutByCluster(): Promise<LandlordPayoutData[]>
// LandlordPayoutData = { cluster: string; paid: number; pending: number; overdue: number }

// — Tenant Detail charts —

// MOCK — replace with: fetch(`${BASE_URL}/tenants/${id}/analytics/nps-trend`)
export async function getTenantNpsTrend(tenantId: string): Promise<NpsDataPoint[]>
// NpsDataPoint = { date: string; score: number; category: 'Promoter' | 'Passive' | 'Detractor' }

// MOCK — replace with: fetch(`${BASE_URL}/tenants/${id}/analytics/ticket-volume?months=6`)
export async function getTenantTicketVolume(tenantId: string, months?: number): Promise<MonthlyTicketData[]>
// MonthlyTicketData = { month: string; count: number }

// — PID Detail charts —

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/analytics/revenue-cogs?months=6`)
export async function getPidRevenueCogs(pidId: string, months?: number): Promise<RevenueCOGSData[]>
// RevenueCOGSData = { month: string; revenue: number; cogs: number; margin: number }

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/analytics/occupancy-timeline?months=12`)
export async function getPidOccupancyTimeline(pidId: string, months?: number): Promise<OccupancyTimelineData[]>
// OccupancyTimelineData = { rid: string; periods: Array<{ month: string; status: string; tenantName?: string; tenantId?: string; rent?: number }> }

// MOCK — replace with: fetch(`${BASE_URL}/pids/${id}/analytics/ticket-categories`)
export async function getPidTicketCategories(pidId: string): Promise<TicketCategoryData[]>
// TicketCategoryData = { category: string; count: number }

// — RID Detail charts —

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}/analytics/rent-trajectory`)
export async function getRidRentTrajectory(ridId: string): Promise<RentTrajectoryData[]>
// RentTrajectoryData = { contractStart: string; rent: number; tenantName: string; tenantId: string; duration: number }

// MOCK — replace with: fetch(`${BASE_URL}/rids/${id}/analytics/occupancy-rate`)
export async function getRidOccupancyRate(ridId: string): Promise<OccupancyRateData>
// OccupancyRateData = { rate: number; occupiedMonths: number; vacantMonths: number; maintenanceMonths: number }

// — Item Detail chart —

// MOCK — replace with: fetch(`${BASE_URL}/items/${id}/analytics/repair-cost`)
export async function getItemRepairCost(itemId: string): Promise<RepairCostData[]>
// RepairCostData = { date: string; incident: string; cost: number; cumulative: number; size: 'small' | 'medium' | 'large' }

// — Vendor Detail charts —

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/analytics/ticket-volume?months=6`)
export async function getVendorTicketVolume(vendorId: string, months?: number): Promise<MonthlyTicketData[]>
// MonthlyTicketData = { month: string; count: number }

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/analytics/resolution-time`)
export async function getVendorResolutionTime(vendorId: string): Promise<ResolutionTimeData[]>
// ResolutionTimeData = { bucket: string; count: number; color: string }

// MOCK — replace with: fetch(`${BASE_URL}/vendors/${id}/analytics/category-breakdown`)
export async function getVendorCategoryBreakdown(vendorId: string): Promise<CategoryData[]>
// CategoryData = { category: string; count: number }

// — FSIN Detail charts —

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}/analytics/unit-states`)
export async function getFsinUnitStates(fsinId: string): Promise<UnitStateData[]>
// UnitStateData = { state: ItemState; count: number; color: string }

// MOCK — replace with: fetch(`${BASE_URL}/fsins/${id}/analytics/procurement-history`)
export async function getFsinProcurementHistory(fsinId: string): Promise<ProcurementData[]>
// ProcurementData = { month: string; units: number; cumulative: number }

// — Resolution Board charts —

// MOCK — replace with: fetch(`${BASE_URL}/analytics/board/ticket-status`)
export async function getBoardTicketStatus(): Promise<BoardStatusData[]>
// BoardStatusData = { status: string; count: number; color: string }

// MOCK — replace with: fetch(`${BASE_URL}/analytics/board/sla-breach-rate`)
export async function getBoardSlaBreachRate(): Promise<SlaBreachData>
// SlaBreachData = { rate: number; breached: number; total: number }
```

---

## BACKEND ENDPOINT SUMMARY

Complete list of all endpoints the backend team must implement, in priority order.

### Core object endpoints (required for launch)

| Method | Path | Service function | Response type |
|---|---|---|---|
| GET | `/tenants` | `getTenants` | `Tenant[]` |
| GET | `/tenants/:id` | `getTenantById` | `Tenant` |
| GET | `/tenants/:id/history` | `getTenantHistory` | `HistoryEntry[]` |
| POST | `/tenants` | `createTenant` | `Tenant` |
| PATCH | `/tenants/:id` | `updateTenantLifecycle` | `Tenant` |
| GET | `/merchants` | `getMerchants` | `Merchant[]` |
| GET | `/merchants/:id` | `getMerchantById` | `Merchant` |
| GET | `/merchants/:id/history` | `getMerchantHistory` | `HistoryEntry[]` |
| POST | `/merchants` | `createMerchant` | `Merchant` |
| GET | `/pids` | `getPids` | `PID[]` |
| GET | `/pids/:id` | `getPidById` | `PID` |
| GET | `/pids/:id/history` | `getPidHistory` | `HistoryEntry[]` |
| GET | `/pids/:id/rids` | `getRidsByPid` | `RID[]` |
| GET | `/pids/:id/tenants/current` | `getCurrentTenantsByPid` | `Tenant[]` |
| GET | `/rids` | `getRids` | `RID[]` |
| GET | `/rids/:id` | `getRidById` | `RID` |
| GET | `/rids/:id/history` | `getRidHistory` | `HistoryEntry[]` |
| GET | `/rids/:id/items` | `getItemsByRid` | `Item[]` |
| GET | `/contracts` | `getContracts` | `Contract[]` |
| GET | `/contracts/:id` | `getContractById` | `Contract` |
| GET | `/contracts/:id/history` | `getContractHistory` | `HistoryEntry[]` |
| GET | `/transactions` | `getTransactions` | `Transaction[]` |
| GET | `/transactions/:id` | `getTransactionById` | `Transaction` |
| GET | `/tickets` | `getTickets` | `Ticket[]` |
| GET | `/tickets/:id` | `getTicketById` | `Ticket` |
| GET | `/tickets/:id/history` | `getTicketHistory` | `HistoryEntry[]` |
| PATCH | `/tickets/:id` | `updateTicketStatus` | `Ticket` |
| GET | `/vendors` | `getVendors` | `Vendor[]` |
| GET | `/vendors/:id` | `getVendorById` | `Vendor` |
| GET | `/vendors/:id/history` | `getVendorHistory` | `HistoryEntry[]` |
| GET | `/fsins` | `getFsins` | `FSIN[]` |
| GET | `/fsins/:id` | `getFsinById` | `FSIN` |
| GET | `/fsins/:id/history` | `getFsinHistory` | `HistoryEntry[]` |
| GET | `/fsins/:id/items` | `getItemsByFsin` | `Item[]` |
| GET | `/items` | `getItems` | `Item[]` |
| GET | `/items/:id` | `getItemById` | `Item` |
| GET | `/items/:id/history` | `getItemHistory` | `HistoryEntry[]` |
| GET | `/overheads` | `getOverheads` | `Overhead[]` |
| GET | `/overheads/:id` | `getOverheadById` | `Overhead` |
| GET | `/overheads/:id/history` | `getOverheadHistory` | `HistoryEntry[]` |
| GET | `/overheads?pid=:pid` | `getOverheadsByPid` | `Overhead[]` |

### Cross-entity convenience endpoints

| Method | Path | Service function | Response type |
|---|---|---|---|
| GET | `/contracts?tenant_id=:id` | `getContractsByTenant` | `Contract[]` |
| GET | `/contracts?pid=:pid` | `getContractsByPid` | `Contract[]` |
| GET | `/transactions?contract_uid=:uid` | `getTransactionsByContract` | `Transaction[]` |
| GET | `/transactions?contact_id=:id` | `getTransactionsByContact` | `Transaction[]` |
| GET | `/transactions?pid=:pid` | `getTransactionsByPid` | `Transaction[]` |
| GET | `/tickets?tenant_id=:id` | `getTicketsByTenant` | `Ticket[]` |
| GET | `/tickets?pid=:pid` | `getTicketsByPid` | `Ticket[]` |

### Analytics endpoints (required for charts)

| Method | Path | Service function | Response type |
|---|---|---|---|
| GET | `/analytics/lead-sources` | `getLeadSources` | `LeadSourceData[]` |
| GET | `/analytics/demand-funnel` | `getDemandFunnel` | `FunnelStageData[]` |
| GET | `/analytics/conversion-trend` | `getConversionTrend` | `MonthlyConversionData[]` |
| GET | `/analytics/pipeline-stage-breakdown` | `getPipelineBreakdown` | `StageBreakdownData[]` |
| GET | `/analytics/visit-conversion` | `getVisitConversionData` | `VisitConversionData[]` |
| GET | `/analytics/collection-trend` | `getCollectionTrend` | `MonthlyCollectionData[]` |
| GET | `/analytics/collection-status` | `getCollectionStatus` | `CollectionStatusData[]` |
| GET | `/analytics/overdue-aging` | `getOverdueAging` | `OverdueAgingData[]` |
| GET | `/analytics/landlord-payout-by-cluster` | `getLandlordPayoutByCluster` | `LandlordPayoutData[]` |
| GET | `/analytics/board/ticket-status` | `getBoardTicketStatus` | `BoardStatusData[]` |
| GET | `/analytics/board/sla-breach-rate` | `getBoardSlaBreachRate` | `SlaBreachData` |
| GET | `/tenants/:id/analytics/nps-trend` | `getTenantNpsTrend` | `NpsDataPoint[]` |
| GET | `/tenants/:id/analytics/ticket-volume` | `getTenantTicketVolume` | `MonthlyTicketData[]` |
| GET | `/pids/:id/analytics/revenue-cogs` | `getPidRevenueCogs` | `RevenueCOGSData[]` |
| GET | `/pids/:id/analytics/occupancy-timeline` | `getPidOccupancyTimeline` | `OccupancyTimelineData[]` |
| GET | `/pids/:id/analytics/ticket-categories` | `getPidTicketCategories` | `TicketCategoryData[]` |
| GET | `/rids/:id/analytics/rent-trajectory` | `getRidRentTrajectory` | `RentTrajectoryData[]` |
| GET | `/rids/:id/analytics/occupancy-rate` | `getRidOccupancyRate` | `OccupancyRateData` |
| GET | `/items/:id/analytics/repair-cost` | `getItemRepairCost` | `RepairCostData[]` |
| GET | `/vendors/:id/analytics/ticket-volume` | `getVendorTicketVolume` | `MonthlyTicketData[]` |
| GET | `/vendors/:id/analytics/resolution-time` | `getVendorResolutionTime` | `ResolutionTimeData[]` |
| GET | `/vendors/:id/analytics/category-breakdown` | `getVendorCategoryBreakdown` | `CategoryData[]` |
| GET | `/fsins/:id/analytics/unit-states` | `getFsinUnitStates` | `UnitStateData[]` |
| GET | `/fsins/:id/analytics/procurement-history` | `getFsinProcurementHistory` | `ProcurementData[]` |

---

## HANDOFF CHECKLIST

### For Claude Code — verify before marking any service file complete

- [ ] Every function has `await simulateLatency()` as first line
- [ ] Every function has `// MOCK — replace with:` comment showing exact endpoint
- [ ] No component or page file imports from `/src/mock/` directly
- [ ] `src/services/config.ts` exists with `BASE_URL = ''` and `simulateLatency()`
- [ ] All filter types exported from the service file or a shared types file
- [ ] Loading state (`CircularProgressBar`) shown in every component while awaiting
- [ ] Error state shown when service throws

### For backend team — verify before frontend handoff

- [ ] Every endpoint in the summary table is implemented
- [ ] Response shapes match the TypeScript types exactly (field names, types, optionality)
- [ ] Filter params accepted as query strings (not request body for GET requests)
- [ ] `history` array included in every entity GET /:id response
- [ ] Analytics endpoints return empty arrays `[]` (not 404) when no data exists
- [ ] Passwords in Overhead responses are not returned in plaintext — return masked or omit
