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

// ── Tenant ─────────────────────────────────────────────────────────
export type Tenant = {
  record_id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  whatsapp_phone: string;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  aadhaar_number: string;
  pan: string;
  occupation: string;
  employer_name: string;
  linkedin_url: string;
  create_date: string;
  first_inquiry_channel: string;
  source_drilldown_1: string;
  preferred_micromarkets: string;
  preferred_occupancy_type: string;
  budget_max: number;
  tenant_lifecycle: string;
  current_pid: string;
  current_rid: string;
  qualification_status: string;
  bgv_status: string;
  nps_category: string;
};

// ── Merchant ───────────────────────────────────────────────────────
export type Merchant = {
  unique_id: string;
  merchant_type: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_city: string;
  lead_source: string;
  designation: string;
  organization: string;
  pan_number: string;
  bank_account_number: string;
  beneficiary_name: string;
  ifsc_code: string;
  signing_authority: boolean;
  potentially_multihome: boolean;
  first_added: string;
};

// ── Vendor ──────────────────────────────────────────────────────────
export type Vendor = {
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  gst_number: string;
  pan: string;
  specialization: string;
  tat_in_days: number;
  quality_tier: string;
  payment_terms: string;
  min_order_value: number;
  customization_capability: string;
  created_at: string;
};

// ── PID (Property) ─────────────────────────────────────────────────
export type Property = {
  pid: string;
  type: 'lead' | 'active' | 'churned';
  house_no: string;
  property_type: string;
  active_units_count: number;
  tier: string;
  floor: string;
  address: string;
  building_society: string;
  active_cluster: string;
  parking_type: string;
  power_backup: string;
  furnishing_status: string;
  deal_owner: string;
  psm_owner: string;
  rent_deadline: string;
};

// ── RID (Room) ──────────────────────────────────────────────────────
export type Room = {
  rid: string;
  pid: string;
  attached_bathroom: boolean;
  balcony: boolean;
  bed_type: string;
  ac: boolean;
  ac_type: string;
  study_table: boolean;
  base_rent: number;
  maintenance_fee: number;
  room_status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Blocked';
  current_contract_id: string;
  current_tenant_name: string;
  available_from: string;
};

// ── Contract ────────────────────────────────────────────────────────
export type Contract = {
  contract_uid: string;
  contract_type: string;
  party_name_tenant: string;
  party_name_merchant: string;
  rid: string;
  contract_start_date: string;
  contract_end_date: string;
  service_term: number;
  lock_in_duration: number;
  notice_period: number;
  payment_lifecycle: string;
  agreement_lifecycle: string;
  total_retail_rent: number;
  monthly_license_fee: number;
  security_deposit: number;
  effective_retail_rent: number;
};

// ── Transaction ─────────────────────────────────────────────────────
export type Transaction = {
  utn: string;
  credit_debit: 'Credit' | 'Debit';
  transaction_date: string;
  amount: number;
  purpose_category_1: string;
  purpose_category_2: string;
  from_party: string;
  from_party_type: string;
  to_party: string;
  to_party_type: string;
  payment_channel: string;
  payment_provider: string;
  gateway_reference_id: string;
  contract_uid: string;
  pid: string;
  rid: string;
  created_by: string;
  created_date: string;
};

// ── Ticket ──────────────────────────────────────────────────────────
export type Ticket = {
  ticket_id: number;
  pipeline: 'Tenant' | 'Landlord';
  ticket_name: string;
  ticket_description: string;
  ticket_owner: string;
  pid: string;
  rid: string;
  create_date: string;
  ticket_category: string;
  ticket_status: string;
  priority: string;
  assigned_vendor: string;
  total_cost: number;
  tenant_rating: number;
  resolution_notes: string;
};

// ── FSIN (Catalog) ──────────────────────────────────────────────────
export type Catalog = {
  fsin_code: string;
  vendor_code: string;
  item_name: string;
  category: string;
  uom: string;
  reorder_point: number;
  annual_depreciation: number;
  perceived_value: number;
  dimensions: string;
  material: string;
  finish: string;
  color: string;
  style: string;
  packaging: string;
  lego: number;
};

// ── ITEM ────────────────────────────────────────────────────────────
export type InventoryItem = {
  item_code: string;
  fsin_code: string;
  serial_no: number;
  unit_price: number;
  lock: boolean;
  location: string;
  state: 'BUY' | 'WIB' | 'WOB' | 'PIB' | 'POB' | 'WORK' | 'DEAD';
  state_time: string;
  created_at: string;
  qa_flag: string;
  bill_document_id: string;
};

// ── Overhead ────────────────────────────────────────────────────────
export type Overhead = {
  overhead_id: string;
  pid: string;
  category_type: string;
  object_type: 'Recurring' | 'One-Time';
  frequency: string;
  start_date: string;
  end_date: string;
  maintenance_amount: number;
  maintenance_cycle: string;
  wifi_provider: string;
  wifi_amount: number;
  electricity_provider: string;
  helper_name: string;
  helper_role: string;
  helper_salary: number;
};
