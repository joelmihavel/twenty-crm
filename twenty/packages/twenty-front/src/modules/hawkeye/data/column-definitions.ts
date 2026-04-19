import {
  Icon123,
  IconCalendarEvent,
  IconCheckbox,
  IconCurrencyRupee,
  IconFile,
  IconLink,
  IconMail,
  IconPhone,
  IconTag,
  IconTextSize,
} from 'twenty-ui/display';

import { type HawkeyeColumn, type FieldGroup } from '../types/entities';
import { type Tenant } from '../types/tenant.types';
import { type Merchant } from '../types/merchant.types';
import { type Vendor } from '../types/vendor.types';
import { type Pid } from '../types/pid.types';
import { type Rid } from '../types/rid.types';
import { type Contract } from '../types/contract.types';
import { type Transaction } from '../types/transaction.types';
import { type Ticket } from '../types/ticket.types';
import { type Fsin } from '../types/fsin.types';
import { type Item } from '../types/item.types';
import { type Overhead } from '../types/overhead.types';
import {
  GENDER_OPTIONS,
  INQUIRY_CHANNEL_OPTIONS,
  SOURCE_DRILLDOWN_1_OPTIONS,
  OCCUPANCY_TYPE_OPTIONS,
  FURNISHED_TYPE_OPTIONS,
  MOVE_IN_TIMELINE_OPTIONS,
  GENDER_PREFERENCE_OPTIONS,
  FOOD_PREFERENCE_OPTIONS,
  SMOKING_PREFERENCE_OPTIONS,
  BGV_STATUS_OPTIONS,
  QUALIFICATION_STATUS_OPTIONS,
  TENANT_LIFECYCLE_OPTIONS,
  NPS_CATEGORY_OPTIONS,
  VISIT_OUTCOME_OPTIONS,
  MERCHANT_TYPE_OPTIONS,
  PREFIX_OPTIONS,
  MERCHANT_LEAD_SOURCE_OPTIONS,
  MERCHANT_DISQUALIFICATION_REASON_OPTIONS,
  LANDLORD_PERSONALITY_OPTIONS,
  MERCHANT_DEAL_STAGE_OPTIONS,
  VENDOR_TYPE_OPTIONS,
  MSME_OPTIONS,
  CUSTOMIZATION_CAPABILITY_OPTIONS,
  QUALITY_TIER_OPTIONS,
  PID_TYPE_OPTIONS,
  DEAL_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  CLUSTER_OPTIONS,
  FURNISHING_STATUS_OPTIONS,
  DEAL_STAGE_OPTIONS,
  POWER_BACKUP_OPTIONS,
  PAYMENT_COLLECTION_OPTIONS,
  BED_TYPE_OPTIONS,
  AC_TYPE_OPTIONS,
  ROOM_STATUS_OPTIONS,
  CONTRACT_TYPE_OPTIONS,
  INCREMENT_FREQUENCY_OPTIONS,
  PAYMENT_LIFECYCLE_OPTIONS,
  AGREEMENT_LIFECYCLE_OPTIONS,
  FMR_STATUS_OPTIONS,
  DEPOSIT_PAID_STATUS_OPTIONS,
  PAYMENT_CYCLE_OPTIONS,
  CREDIT_DEBIT_OPTIONS,
  PURPOSE_CATEGORY_1_OPTIONS,
  PURPOSE_CATEGORY_2_OPTIONS,
  FROM_PARTY_TYPE_OPTIONS,
  TO_PARTY_TYPE_OPTIONS,
  PAYMENT_CHANNEL_OPTIONS,
  PAYMENT_PROVIDER_OPTIONS,
  COST_REVENUE_CENTER_OPTIONS,
  PIPELINE_OPTIONS,
  TICKET_CATEGORY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CATEGORY_PHASE_OPTIONS,
  TICKET_FLAG_OPTIONS,
  FSIN_CATEGORY_OPTIONS,
  UOM_OPTIONS,
  PACKAGING_OPTIONS,
  ITEM_STATE_OPTIONS,
  QA_FLAG_OPTIONS,
  OVERHEAD_CATEGORY_OPTIONS,
  OVERHEAD_OBJECT_TYPE_OPTIONS,
  OVERHEAD_FREQUENCY_OPTIONS,
  WIFI_PROVIDER_OPTIONS,
  MAINTENANCE_CYCLE_OPTIONS,
  PURIFIER_TYPE_OPTIONS,
  HELPER_ROLE_OPTIONS,
} from './enum-options';

// Map column type to the corresponding field-type icon (matches Twenty's pattern)
const typeIconMap = {
  text: IconTextSize,
  email: IconMail,
  phone: IconPhone,
  date: IconCalendarEvent,
  currency: IconCurrencyRupee,
  enum: IconTag,
  boolean: IconCheckbox,
  number: Icon123,
  url: IconLink,
  file: IconFile,
} as const;

// Auto-assign Icon based on column type
const withIcons = <T,>(cols: HawkeyeColumn<T>[]): HawkeyeColumn<T>[] =>
  cols.map((col) => ({
    ...col,
    Icon: col.Icon ?? typeIconMap[col.type ?? 'text'],
  }));

// ── Tenant ─────────────────────────────────────────────────────────

export const tenantColumns: HawkeyeColumn<Tenant>[] = withIcons([
  { key: 'first_name', label: 'First Name', width: 120 },
  { key: 'last_name', label: 'Last Name', width: 120 },
  { key: 'email', label: 'Email', type: 'email', width: 200 },
  { key: 'mobile_phone', label: 'Phone', type: 'phone', width: 140 },
  { key: 'tenant_lifecycle', label: 'Stage', type: 'enum', width: 120, options: TENANT_LIFECYCLE_OPTIONS },
  { key: 'current_pid', label: 'PID', width: 100 },
  { key: 'current_rid', label: 'RID', width: 80 },
  { key: 'occupation', label: 'Occupation', width: 150 },
  { key: 'employer_name', label: 'Employer', width: 140 },
  { key: 'budget_max', label: 'Budget Max', type: 'currency', width: 120 },
  { key: 'qualification_status', label: 'Qualification', type: 'enum', width: 120, options: QUALIFICATION_STATUS_OPTIONS },
  { key: 'bgv_status', label: 'BGV', type: 'enum', width: 100, options: BGV_STATUS_OPTIONS },
  { key: 'nps_category', label: 'NPS', type: 'enum', width: 100, options: NPS_CATEGORY_OPTIONS },
]);

export const tenantFieldGroups: FieldGroup<Tenant>[] = [
  {
    label: 'Identity',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'mobile_phone', label: 'Mobile Phone', type: 'phone' },
      { key: 'whatsapp_phone', label: 'WhatsApp Phone', type: 'phone' },
      { key: 'gender', label: 'Gender', type: 'enum', options: GENDER_OPTIONS },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { key: 'aadhaar_number', label: 'Aadhaar Number' },
      { key: 'aadhaar_front_image', label: 'Aadhaar Front', type: 'file' },
      { key: 'aadhaar_back_image', label: 'Aadhaar Back', type: 'file' },
      { key: 'pan', label: 'PAN' },
      { key: 'pan_card_image', label: 'PAN Card', type: 'file' },
      { key: 'occupation', label: 'Occupation' },
      { key: 'employer_name', label: 'Employer' },
      { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
      { key: 'twitter_url', label: 'Twitter (X)', type: 'url' },
      { key: 'instagram_id', label: 'Instagram', type: 'url' },
    ],
  },
  {
    label: 'Attribution',
    fields: [
      { key: 'create_date', label: 'Create Date', type: 'date' },
      { key: 'first_inquiry_channel', label: 'Channel', type: 'enum', options: INQUIRY_CHANNEL_OPTIONS },
      { key: 'source_drilldown_1', label: 'Source', type: 'enum', options: SOURCE_DRILLDOWN_1_OPTIONS },
      { key: 'source_drilldown_2', label: 'Source Detail' },
      { key: 'wax_code', label: 'WAX Code' },
      { key: 'google_click_id', label: 'Google Click ID' },
      { key: 'facebook_click_id', label: 'Facebook Click ID' },
      { key: 'utm_source', label: 'UTM Source' },
      { key: 'utm_medium', label: 'UTM Medium' },
      { key: 'utm_campaign', label: 'UTM Campaign' },
      { key: 'utm_content', label: 'UTM Content' },
      { key: 'utm_term', label: 'UTM Term' },
    ],
  },
  {
    label: 'Requirements',
    fields: [
      { key: 'preferred_micromarkets', label: 'Preferred Micromarkets' },
      { key: 'preferred_occupancy_type', label: 'Occupancy Type', type: 'enum', options: OCCUPANCY_TYPE_OPTIONS },
      { key: 'preferred_furnished_type', label: 'Furnished Type', type: 'enum', options: FURNISHED_TYPE_OPTIONS },
      { key: 'preferred_move_in_timeline', label: 'Move-in Timeline', type: 'enum', options: MOVE_IN_TIMELINE_OPTIONS },
      { key: 'gender_preferences', label: 'Gender Preferences', type: 'enum', options: GENDER_PREFERENCE_OPTIONS },
      { key: 'food_preferences', label: 'Food Preferences', type: 'enum', options: FOOD_PREFERENCE_OPTIONS },
      { key: 'has_pet', label: 'Has Pet', type: 'boolean' },
      { key: 'smoking_preferences', label: 'Smoking', type: 'enum', options: SMOKING_PREFERENCE_OPTIONS },
      { key: 'custom_preference', label: 'Custom Preference', type: 'longtext' },
      { key: 'budget_max', label: 'Budget Max (INR)', type: 'currency' },
    ],
  },
  {
    label: 'Lifecycle & Qualification',
    fields: [
      { key: 'tenant_lifecycle', label: 'Lifecycle Stage', type: 'enum', options: TENANT_LIFECYCLE_OPTIONS },
      { key: 'current_pid', label: 'Current PID' },
      { key: 'current_rid', label: 'Current RID' },
      { key: 'qualification_status', label: 'Qualification Status', type: 'enum', options: QUALIFICATION_STATUS_OPTIONS },
      { key: 'disqualification_detail', label: 'Disqualification Detail', type: 'longtext' },
      { key: 'bgv_status', label: 'BGV Status', type: 'enum', options: BGV_STATUS_OPTIONS },
      { key: 'contract_uid', label: 'Contract UID' },
    ],
  },
  {
    label: 'Visit Summary',
    fields: [
      { key: 'total_visits_count', label: 'Total Visits', type: 'number' },
      { key: 'visits_cancelled', label: 'Visits Cancelled', type: 'number' },
      { key: 'visits_completed', label: 'Visits Completed', type: 'number' },
      { key: 'first_visit_date', label: 'First Visit Date', type: 'date' },
      { key: 'rids_visited', label: 'RIDs Visited' },
      { key: 'visit_date', label: 'Visit Date', type: 'date' },
      { key: 'visit_outcome', label: 'Visit Outcome', type: 'enum', options: VISIT_OUTCOME_OPTIONS },
      { key: 'feedback', label: 'Feedback', type: 'longtext' },
    ],
  },
  {
    label: 'Satisfaction',
    fields: [
      { key: 'csat_score', label: 'CSAT Score', type: 'number' },
      { key: 'offboarding_csat_score', label: 'Offboarding CSAT', type: 'number' },
      { key: 'nps_score', label: 'NPS Score', type: 'number' },
      { key: 'last_nps_date', label: 'Last NPS Date', type: 'date' },
      { key: 'nps_category', label: 'NPS Category', type: 'enum', options: NPS_CATEGORY_OPTIONS },
      { key: 'last_nps_comment', label: 'Last NPS Comment', type: 'longtext' },
    ],
  },
  {
    label: 'Payments',
    fields: [
      { key: 'token_amount', label: 'Token Amount', type: 'currency' },
      { key: 'fmr_amount', label: 'FMR Amount', type: 'currency' },
      { key: 'sd_amount', label: 'SD Amount', type: 'currency' },
    ],
  },
];

// ── Merchant ───────────────────────────────────────────────────────

export const merchantColumns: HawkeyeColumn<Merchant>[] = withIcons([
  { key: 'id', label: 'ID', width: 100 },
  { key: 'prefix', label: 'Prefix', width: 60 },
  { key: 'first_name', label: 'First Name', width: 120 },
  { key: 'last_name', label: 'Last Name', width: 120 },
  { key: 'merchant_type', label: 'Type', type: 'enum', width: 120, options: MERCHANT_TYPE_OPTIONS },
  { key: 'deal_stage', label: 'Deal Stage', type: 'enum', width: 130, options: MERCHANT_DEAL_STAGE_OPTIONS },
  { key: 'email', label: 'Email', type: 'email', width: 200 },
  { key: 'phone', label: 'Phone', type: 'phone', width: 140 },
  { key: 'current_city', label: 'City', width: 100 },
  { key: 'lead_source', label: 'Lead Source', type: 'enum', width: 120, options: MERCHANT_LEAD_SOURCE_OPTIONS },
  { key: 'signing_authority', label: 'Signing Auth', type: 'boolean', width: 100 },
]);

export const merchantFieldGroups: FieldGroup<Merchant>[] = [
  {
    label: 'Identity',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'unique_id', label: 'Unique ID' },
      { key: 'merchant_type', label: 'Merchant Type', type: 'enum', options: MERCHANT_TYPE_OPTIONS },
      { key: 'deal_stage', label: 'Deal Stage', type: 'enum', options: MERCHANT_DEAL_STAGE_OPTIONS },
      { key: 'lead_source', label: 'Lead Source', type: 'enum', options: MERCHANT_LEAD_SOURCE_OPTIONS },
      { key: 'prefix', label: 'Prefix', type: 'enum', options: PREFIX_OPTIONS },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'country_code', label: 'Country Code' },
      { key: 'current_city', label: 'City' },
      { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
    ],
  },
  {
    label: 'Demographics',
    fields: [
      { key: 'designation', label: 'Designation' },
      { key: 'organization', label: 'Organization' },
      { key: 'current_residential', label: 'Current Residential Address', type: 'longtext' },
      { key: 'permanent_residential', label: 'Permanent Residential Address', type: 'longtext' },
    ],
  },
  {
    label: 'Documents & Payment',
    fields: [
      { key: 'pan_number', label: 'PAN' },
      { key: 'pan_card_image', label: 'PAN Card', type: 'file' },
      { key: 'aadhaar_back', label: 'Aadhaar Back', type: 'file' },
      { key: 'bank_account_number', label: 'Bank Account' },
      { key: 'beneficiary_name', label: 'Beneficiary Name' },
      { key: 'ifsc_code', label: 'IFSC Code' },
    ],
  },
  {
    label: 'Qualification & Deal',
    fields: [
      { key: 'disqualification_reason', label: 'Disqualification Reason', type: 'enum', options: MERCHANT_DISQUALIFICATION_REASON_OPTIONS },
      { key: 'lost_reason', label: 'Lost Reason', type: 'longtext' },
      { key: 'landlord_personality', label: 'Landlord Personality', type: 'enum', options: LANDLORD_PERSONALITY_OPTIONS },
      { key: 'general_ll_comments', label: 'General LL Comments', type: 'longtext' },
    ],
  },
  {
    label: 'Management & Permissions',
    fields: [
      { key: 'management_email', label: 'Management Email', type: 'email' },
      { key: 'management_phone', label: 'Management Phone', type: 'phone' },
      { key: 'communications_permission', label: 'Communications Permission', type: 'boolean' },
      { key: 'signing_authority', label: 'Signing Authority', type: 'boolean' },
      { key: 'potentially_multihome', label: 'Multi-home Potential', type: 'boolean' },
    ],
  },
  {
    label: 'Meta',
    fields: [
      { key: 'pid_ids', label: 'Property IDs' },
      { key: 'first_added', label: 'First Added', type: 'date' },
      { key: 'last_updated', label: 'Last Updated', type: 'date' },
    ],
  },
];

// ── Vendor ──────────────────────────────────────────────────────────

export const vendorColumns: HawkeyeColumn<Vendor>[] = withIcons([
  { key: 'vendor_code', label: 'Code', width: 100 },
  { key: 'vendor_name', label: 'Name', width: 180 },
  { key: 'vendor_type', label: 'Type', type: 'enum', width: 120, options: VENDOR_TYPE_OPTIONS },
  { key: 'contact_name', label: 'Contact', width: 140 },
  { key: 'phone', label: 'Phone', type: 'phone', width: 140 },
  { key: 'city', label: 'City', width: 100 },
  { key: 'specialization', label: 'Specialization', width: 160 },
  { key: 'quality_tier', label: 'Tier', type: 'enum', width: 80, options: QUALITY_TIER_OPTIONS },
  { key: 'tat_in_days', label: 'TAT (days)', type: 'number', width: 90 },
  { key: 'min_order_value', label: 'Min Order', type: 'currency', width: 120 },
]);

export const vendorFieldGroups: FieldGroup<Vendor>[] = [
  {
    label: 'Identification',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'vendor_code', label: 'Vendor Code' },
      { key: 'vendor_name', label: 'Vendor Name' },
      { key: 'vendor_type', label: 'Type', type: 'enum', options: VENDOR_TYPE_OPTIONS },
      { key: 'created_at', label: 'Created At', type: 'date' },
    ],
  },
  {
    label: 'Contact & Info',
    fields: [
      { key: 'contact_name', label: 'Contact Name' },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'city', label: 'City' },
      { key: 'address', label: 'Address', type: 'longtext' },
    ],
  },
  {
    label: 'Billing & Banking',
    fields: [
      { key: 'gst_number', label: 'GST Number' },
      { key: 'pan', label: 'PAN' },
      { key: 'bank_name', label: 'Bank Name' },
      { key: 'bank_account_number', label: 'Bank Account Number' },
      { key: 'ifsc_code', label: 'IFSC Code' },
      { key: 'msme_vendor', label: 'MSME Vendor', type: 'enum', options: MSME_OPTIONS },
      { key: 'udyam_aadhaar', label: 'Udyam Aadhaar' },
    ],
  },
  {
    label: 'Capability & Commercials',
    fields: [
      { key: 'specialization', label: 'Specialization', type: 'longtext' },
      { key: 'tat_in_days', label: 'TAT (Days)', type: 'number' },
      { key: 'customization_capability', label: 'Customization', type: 'enum', options: CUSTOMIZATION_CAPABILITY_OPTIONS },
      { key: 'quality_tier', label: 'Quality Tier', type: 'enum', options: QUALITY_TIER_OPTIONS },
      { key: 'payment_terms', label: 'Payment Terms' },
      { key: 'min_order_value', label: 'Min Order Value', type: 'currency' },
      { key: 'negotiation_remarks', label: 'Negotiation Remarks', type: 'longtext' },
    ],
  },
];

// ── Property (PID) ─────────────────────────────────────────────────

export const propertyColumns: HawkeyeColumn<Pid>[] = withIcons([
  { key: 'id', label: 'PID', width: 100 },
  { key: 'type', label: 'Status', type: 'enum', width: 90, options: PID_TYPE_OPTIONS },
  { key: 'house_no', label: 'House No.', width: 100 },
  { key: 'property_type', label: 'Type', type: 'enum', width: 100, options: PROPERTY_TYPE_OPTIONS },
  { key: 'building_society', label: 'Building / Society', width: 180 },
  { key: 'active_cluster', label: 'Cluster', type: 'enum', width: 80, options: CLUSTER_OPTIONS },
  { key: 'active_units_count', label: 'Units', type: 'number', width: 70 },
  { key: 'floor', label: 'Floor', width: 70 },
  { key: 'furnishing_status', label: 'Furnishing', type: 'enum', width: 120, options: FURNISHING_STATUS_OPTIONS },
  { key: 'deal_owner', label: 'Deal Owner', width: 120 },
  { key: 'deal_stage', label: 'Deal Stage', type: 'enum', width: 120, options: DEAL_STAGE_OPTIONS },
]);

export const propertyFieldGroups: FieldGroup<Pid>[] = [
  {
    label: 'Property Details',
    fields: [
      { key: 'id', label: 'PID' },
      { key: 'ppid', label: 'PPID' },
      { key: 'type', label: 'Status', type: 'enum', options: PID_TYPE_OPTIONS },
      { key: 'house_no', label: 'House No.' },
      { key: 'property_type', label: 'Property Type', type: 'enum', options: PROPERTY_TYPE_OPTIONS },
      { key: 'active_units_count', label: 'Units', type: 'number' },
      { key: 'tier', label: 'Tier' },
      { key: 'floor', label: 'Floor' },
      { key: 'address', label: 'Address', type: 'longtext' },
      { key: 'building_society', label: 'Building / Society' },
      { key: 'active_cluster', label: 'Cluster', type: 'enum', options: CLUSTER_OPTIONS },
      { key: 'date_added', label: 'Date Added', type: 'date' },
    ],
  },
  {
    label: 'Lead Stage',
    fields: [
      { key: 'deal_type', label: 'Deal Type', type: 'enum', options: DEAL_TYPE_OPTIONS },
      { key: 'units_count', label: 'Units Count', type: 'number' },
      { key: 'apartment_count', label: 'Apartment Count', type: 'number' },
      { key: 'property_type_lead', label: 'Property Type (Lead)', type: 'enum', options: PROPERTY_TYPE_OPTIONS },
      { key: 'furnishing_lead', label: 'Furnishing (Lead)', type: 'enum', options: FURNISHING_STATUS_OPTIONS },
      { key: 'expected_rent', label: 'Expected Rent', type: 'currency' },
      { key: 'google_map_location_lead', label: 'Google Map Location', type: 'url' },
      { key: 'exploratory_visit_score', label: 'Exploratory Visit Score', type: 'number' },
      { key: 'potential_report', label: 'Potential Report', type: 'longtext' },
    ],
  },
  {
    label: 'Amenities & Details',
    fields: [
      { key: 'parking_type', label: 'Parking' },
      { key: 'parking_number', label: 'Parking Number' },
      { key: 'power_backup', label: 'Power Backup', type: 'enum', options: POWER_BACKUP_OPTIONS },
      { key: 'furnishing_status', label: 'Furnishing Status', type: 'enum', options: FURNISHING_STATUS_OPTIONS },
      { key: 'water_source', label: 'Water Source' },
      { key: 'restrictions', label: 'Restrictions', type: 'longtext' },
      { key: 'furniture_movement', label: 'Furniture Movement' },
      { key: 'll_extra_clauses', label: 'LL Extra Clauses', type: 'longtext' },
    ],
  },
  {
    label: 'Fixture Costs',
    fields: [
      { key: 'final_approved_amt', label: 'Final Approved Amount', type: 'currency' },
      { key: 'final_invoice', label: 'Final Invoice', type: 'file' },
      { key: 'payment_collection', label: 'Payment Collection', type: 'enum', options: PAYMENT_COLLECTION_OPTIONS },
      { key: 'emi_period', label: 'EMI Period (Months)', type: 'number' },
      { key: 'opex_collections', label: 'OPEX Collections', type: 'currency' },
    ],
  },
  {
    label: 'Ownership & Deal',
    fields: [
      { key: 'deal_owner', label: 'Deal Owner' },
      { key: 'psm_owner', label: 'PSM Owner' },
      { key: 'merchant_id', label: 'Merchant ID' },
      { key: 'deal_stage', label: 'Deal Stage', type: 'enum', options: DEAL_STAGE_OPTIONS },
      { key: 'rent_deadline', label: 'Rent Deadline' },
      { key: 'overheads_deadline', label: 'Overheads Deadline' },
    ],
  },
  {
    label: 'Building Context',
    fields: [
      { key: 'prop_mgmt_app', label: 'Property Mgmt App' },
      { key: 'rules_regulations', label: 'Rules & Regulations', type: 'longtext' },
      { key: 'garbage_disposal', label: 'Garbage Disposal' },
      { key: 'timing_restrictions', label: 'Timing Restrictions' },
      { key: 'move_in_formalities', label: 'Move-in Formalities', type: 'longtext' },
      { key: 'move_out_formalities', label: 'Move-out Formalities', type: 'longtext' },
      { key: 'move_in_out_formalities', label: 'Move-in/out Formalities', type: 'longtext' },
    ],
  },
  {
    label: 'Churned',
    fields: [
      { key: 'deposit_refunded', label: 'Deposit Refunded', type: 'boolean' },
      { key: 'exit_cost_opx', label: 'Exit Cost OPX', type: 'currency' },
    ],
  },
];

// ── Room (RID) ──────────────────────────────────────────────────────

export const roomColumns: HawkeyeColumn<Rid>[] = withIcons([
  { key: 'id', label: 'RID', width: 80 },
  { key: 'pid', label: 'PID', width: 100 },
  { key: 'room_status', label: 'Status', type: 'enum', width: 130, options: ROOM_STATUS_OPTIONS },
  { key: 'bed_type', label: 'Bed', type: 'enum', width: 90, options: BED_TYPE_OPTIONS },
  { key: 'ac', label: 'AC', type: 'boolean', width: 60 },
  { key: 'attached_bathroom', label: 'Bath', type: 'boolean', width: 60 },
  { key: 'balcony', label: 'Balcony', type: 'boolean', width: 70 },
  { key: 'base_rent', label: 'Base Rent', type: 'currency', width: 120 },
  { key: 'maintenance_fee', label: 'Maintenance', type: 'currency', width: 120 },
  { key: 'current_tenant_name', label: 'Current Tenant', width: 150 },
  { key: 'available_from', label: 'Available From', type: 'date', width: 120 },
]);

export const roomFieldGroups: FieldGroup<Rid>[] = [
  {
    label: 'Room Identity',
    fields: [
      { key: 'id', label: 'RID' },
      { key: 'pid', label: 'PID' },
    ],
  },
  {
    label: 'Specifications',
    fields: [
      { key: 'attached_bathroom', label: 'Attached Bathroom', type: 'boolean' },
      { key: 'balcony', label: 'Balcony', type: 'boolean' },
      { key: 'bed_type', label: 'Bed Type', type: 'enum', options: BED_TYPE_OPTIONS },
      { key: 'ac', label: 'AC', type: 'boolean' },
      { key: 'ac_type', label: 'AC Type', type: 'enum', options: AC_TYPE_OPTIONS },
      { key: 'study_table', label: 'Study Table', type: 'boolean' },
    ],
  },
  {
    label: 'Commercials',
    fields: [
      { key: 'base_rent', label: 'Base Rent', type: 'currency' },
      { key: 'maintenance_fee', label: 'Maintenance Fee', type: 'currency' },
    ],
  },
  {
    label: 'Availability',
    fields: [
      { key: 'room_status', label: 'Room Status', type: 'enum', options: ROOM_STATUS_OPTIONS },
      { key: 'current_contract_id', label: 'Current Contract' },
      { key: 'current_tenant_id', label: 'Current Tenant ID' },
      { key: 'current_tenant_name', label: 'Current Tenant' },
      { key: 'available_from', label: 'Available From', type: 'date' },
    ],
  },
];

// ── Contract ────────────────────────────────────────────────────────

export const contractColumns: HawkeyeColumn<Contract>[] = withIcons([
  { key: 'id', label: 'Contract ID', width: 160 },
  { key: 'contract_type', label: 'Type', type: 'enum', width: 110, options: CONTRACT_TYPE_OPTIONS },
  { key: 'party_name', label: 'Party', width: 160 },
  { key: 'pid', label: 'PID', width: 80 },
  { key: 'rid', label: 'RID', width: 80 },
  { key: 'contract_start_date', label: 'Start', type: 'date', width: 110 },
  { key: 'contract_end_date', label: 'End', type: 'date', width: 110 },
  { key: 'monthly_license_fee', label: 'Monthly Fee', type: 'currency', width: 120 },
  { key: 'security_deposit', label: 'Deposit', type: 'currency', width: 120 },
  { key: 'payment_lifecycle', label: 'Payment Status', type: 'enum', width: 130, options: PAYMENT_LIFECYCLE_OPTIONS },
  { key: 'agreement_lifecycle', label: 'Agreement', type: 'enum', width: 120, options: AGREEMENT_LIFECYCLE_OPTIONS },
]);

export const contractFieldGroups: FieldGroup<Contract>[] = [
  {
    label: 'Contract Identity',
    fields: [
      { key: 'id', label: 'Contract ID' },
      { key: 'contract_uid', label: 'Contract UID' },
      { key: 'contract_type', label: 'Type', type: 'enum', options: CONTRACT_TYPE_OPTIONS },
      { key: 'party_name', label: 'Party Name' },
      { key: 'party_id', label: 'Party ID' },
      { key: 'pid', label: 'PID' },
      { key: 'rid', label: 'RID' },
    ],
  },
  {
    label: 'Terms',
    fields: [
      { key: 'contract_start_date', label: 'Start Date', type: 'date' },
      { key: 'contract_end_date', label: 'End Date', type: 'date' },
      { key: 'service_term', label: 'Term (Months)', type: 'number' },
      { key: 'lock_in_duration', label: 'Lock-in (Months)', type: 'number' },
      { key: 'lock_in_end_date', label: 'Lock-in End Date', type: 'date' },
      { key: 'notice_period', label: 'Notice Period (Months)', type: 'number' },
      { key: 'preferred_move_out_date', label: 'Preferred Move-out Date', type: 'date' },
      { key: 'key_handover_date', label: 'Key Handover Date', type: 'date' },
      { key: 'increment_percentage', label: 'Increment %', type: 'number' },
      { key: 'increment_frequency', label: 'Increment Frequency', type: 'enum', options: INCREMENT_FREQUENCY_OPTIONS },
    ],
  },
  {
    label: 'Lifecycle',
    fields: [
      { key: 'payment_lifecycle', label: 'Payment Status', type: 'enum', options: PAYMENT_LIFECYCLE_OPTIONS },
      { key: 'agreement_lifecycle', label: 'Agreement Status', type: 'enum', options: AGREEMENT_LIFECYCLE_OPTIONS },
      { key: 'agreement_status', label: 'Agreement Status (Merchant)', type: 'enum', options: AGREEMENT_LIFECYCLE_OPTIONS },
      { key: 'fmr_status', label: 'FMR Status', type: 'enum', options: FMR_STATUS_OPTIONS },
      { key: 'deposit_paid_status', label: 'Deposit Paid Status', type: 'enum', options: DEPOSIT_PAID_STATUS_OPTIONS },
    ],
  },
  {
    label: 'Tenant Commercials',
    fields: [
      { key: 'total_retail_rent', label: 'Total Retail Rent', type: 'currency' },
      { key: 'monthly_license_fee', label: 'Monthly License Fee', type: 'currency' },
      { key: 'effective_retail_rent', label: 'Effective Rent', type: 'currency' },
      { key: 'security_deposit', label: 'Security Deposit', type: 'currency' },
      { key: 'maintenance_fee', label: 'Maintenance Fee', type: 'currency' },
      { key: 'furnishing_fee', label: 'Furnishing Fee', type: 'currency' },
      { key: 'convenience_fee', label: 'Convenience Fee', type: 'currency' },
      { key: 'gst', label: 'GST', type: 'currency' },
      { key: 'discount_amount', label: 'Discount', type: 'currency' },
      { key: 'caution_deposit', label: 'Caution Deposit', type: 'currency' },
      { key: 'lock_in_fee', label: 'Lock-in Fee', type: 'currency' },
      { key: 'exit_fee', label: 'Exit Fee', type: 'currency' },
    ],
  },
  {
    label: 'Merchant Commercials',
    fields: [
      { key: 'base_rent', label: 'Base Rent Schedule' },
      { key: 'merchant_security_deposit', label: 'Merchant SD', type: 'currency' },
      { key: 'management_fee_per_month', label: 'Management Fee/Month', type: 'currency' },
      { key: 'total_cogs', label: 'Total COGS', type: 'currency' },
      { key: 'contract_acquisition_cost', label: 'Acquisition Cost', type: 'currency' },
      { key: 'payment_cycle', label: 'Payment Cycle', type: 'enum', options: PAYMENT_CYCLE_OPTIONS },
      { key: 'payment_deadline', label: 'Payment Deadline' },
    ],
  },
  {
    label: 'Deductions',
    fields: [
      { key: 'damages_deductions', label: 'Damages Deductions', type: 'currency' },
      { key: 'society_fees', label: 'Society Fees', type: 'currency' },
      { key: 'penalty', label: 'Penalty', type: 'currency' },
    ],
  },
  {
    label: 'Transaction Links',
    fields: [
      { key: 'token_txn_id', label: 'Token Txn ID' },
      { key: 'fmr_txn_id', label: 'FMR Txn ID' },
      { key: 'sd_txn_id', label: 'SD Txn ID' },
    ],
  },
  {
    label: 'Documents',
    fields: [
      { key: 'agreement_pdf', label: 'Agreement PDF', type: 'file' },
      { key: 'inventory_list', label: 'Inventory List', type: 'file' },
    ],
  },
];

// ── Transaction ─────────────────────────────────────────────────────

export const transactionColumns: HawkeyeColumn<Transaction>[] = withIcons([
  { key: 'id', label: 'ID', width: 180 },
  { key: 'credit_debit', label: 'Cr/Dr', type: 'enum', width: 80, options: CREDIT_DEBIT_OPTIONS },
  { key: 'transaction_date', label: 'Date', type: 'date', width: 110 },
  { key: 'amount', label: 'Amount', type: 'currency', width: 130 },
  { key: 'purpose_category_1', label: 'Category', type: 'enum', width: 110, options: PURPOSE_CATEGORY_1_OPTIONS },
  { key: 'purpose_category_2', label: 'Sub-category', type: 'enum', width: 120, options: PURPOSE_CATEGORY_2_OPTIONS },
  { key: 'from_party', label: 'From', width: 140 },
  { key: 'to_party', label: 'To', width: 140 },
  { key: 'payment_channel', label: 'Channel', type: 'enum', width: 100, options: PAYMENT_CHANNEL_OPTIONS },
  { key: 'pid', label: 'PID', width: 90 },
]);

export const transactionFieldGroups: FieldGroup<Transaction>[] = [
  {
    label: 'Transaction Core',
    fields: [
      { key: 'id', label: 'Transaction ID' },
      { key: 'credit_debit', label: 'Credit / Debit', type: 'enum', options: CREDIT_DEBIT_OPTIONS },
      { key: 'transaction_date', label: 'Transaction Date', type: 'date' },
      { key: 'amount', label: 'Amount (INR)', type: 'currency' },
      { key: 'line_item_description', label: 'Description', type: 'longtext' },
      { key: 'line_item_date', label: 'Line Item Date', type: 'date' },
    ],
  },
  {
    label: 'Classification',
    fields: [
      { key: 'purpose_category_1', label: 'Purpose Category 1', type: 'enum', options: PURPOSE_CATEGORY_1_OPTIONS },
      { key: 'purpose_category_2', label: 'Purpose Category 2', type: 'enum', options: PURPOSE_CATEGORY_2_OPTIONS },
      { key: 'cost_revenue_center', label: 'Cost / Revenue Center', type: 'enum', options: COST_REVENUE_CENTER_OPTIONS },
    ],
  },
  {
    label: 'Parties',
    fields: [
      { key: 'from_party', label: 'From (Payer)' },
      { key: 'from_party_type', label: 'From Type', type: 'enum', options: FROM_PARTY_TYPE_OPTIONS },
      { key: 'from_party_id', label: 'From ID' },
      { key: 'from_party_info', label: 'From Party Info', type: 'longtext' },
      { key: 'to_party', label: 'To (Payee)' },
      { key: 'to_party_type', label: 'To Type', type: 'enum', options: TO_PARTY_TYPE_OPTIONS },
      { key: 'to_party_id', label: 'To ID' },
      { key: 'contact_id', label: 'Contact ID' },
    ],
  },
  {
    label: 'Payment Details',
    fields: [
      { key: 'payment_channel', label: 'Channel', type: 'enum', options: PAYMENT_CHANNEL_OPTIONS },
      { key: 'payment_provider', label: 'Provider', type: 'enum', options: PAYMENT_PROVIDER_OPTIONS },
      { key: 'gateway_reference_id', label: 'Gateway Ref' },
    ],
  },
  {
    label: 'Links & Audit',
    fields: [
      { key: 'contract_uid', label: 'Contract UID' },
      { key: 'pid', label: 'PID' },
      { key: 'rid', label: 'RID' },
      { key: 'rid_link', label: 'RID Link' },
      { key: 'created_by', label: 'Created By' },
      { key: 'created_date', label: 'Created Date', type: 'date' },
      { key: 'authorised_by', label: 'Authorised By' },
      { key: 'authorised_date', label: 'Authorised Date', type: 'date' },
    ],
  },
];

// ── Ticket ──────────────────────────────────────────────────────────

export const ticketColumns: HawkeyeColumn<Ticket>[] = withIcons([
  { key: 'id', label: 'ID', width: 90 },
  { key: 'pipeline', label: 'Pipeline', type: 'enum', width: 90, options: PIPELINE_OPTIONS },
  { key: 'ticket_name', label: 'Name', width: 200 },
  { key: 'ticket_status', label: 'Status', type: 'enum', width: 150, options: TICKET_STATUS_OPTIONS },
  { key: 'priority', label: 'Priority', type: 'enum', width: 90, options: PRIORITY_OPTIONS },
  { key: 'ticket_category', label: 'Category', type: 'enum', width: 110, options: TICKET_CATEGORY_OPTIONS },
  { key: 'ticket_owner', label: 'Owner', width: 120 },
  { key: 'pid', label: 'PID', width: 90 },
  { key: 'assigned_vendor', label: 'Vendor', width: 150 },
  { key: 'create_date', label: 'Created', type: 'date', width: 110 },
  { key: 'total_cost_net', label: 'Cost', type: 'currency', width: 100 },
]);

export const ticketFieldGroups: FieldGroup<Ticket>[] = [
  {
    label: 'Ticket Identity',
    fields: [
      { key: 'id', label: 'Ticket ID' },
      { key: 'pipeline', label: 'Pipeline', type: 'enum', options: PIPELINE_OPTIONS },
      { key: 'ticket_name', label: 'Ticket Name' },
      { key: 'ticket_description', label: 'Description', type: 'longtext' },
      { key: 'ticket_owner', label: 'Owner' },
      { key: 'pid', label: 'PID' },
      { key: 'rid', label: 'RID' },
      { key: 'tenant_id', label: 'Tenant ID' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'create_date', label: 'Create Date', type: 'date' },
    ],
  },
  {
    label: 'Categorisation',
    fields: [
      { key: 'ticket_category', label: 'Category', type: 'enum', options: TICKET_CATEGORY_OPTIONS },
      { key: 'category_phase', label: 'Category Phase', type: 'enum', options: CATEGORY_PHASE_OPTIONS },
      { key: 'ticket_status', label: 'Status', type: 'enum', options: TICKET_STATUS_OPTIONS },
      { key: 'priority', label: 'Priority', type: 'enum', options: PRIORITY_OPTIONS },
      { key: 'time_slot', label: 'Time Slot' },
      { key: 'ticket_flag', label: 'Ticket Flag', type: 'enum', options: TICKET_FLAG_OPTIONS },
      { key: 'flag_notes', label: 'Flag Notes', type: 'longtext' },
    ],
  },
  {
    label: 'Execution',
    fields: [
      { key: 'assigned_vendor', label: 'Assigned Vendor' },
      { key: 'assigned_vendor_id', label: 'Vendor ID' },
      { key: 'vendor_group_chat_id', label: 'Vendor Group Chat ID' },
      { key: 'total_cost_net', label: 'Total Cost', type: 'currency' },
      { key: 'collected_from_tenant', label: 'Collected from Tenant', type: 'currency' },
      { key: 'collected_from_merchant', label: 'Collected from Merchant', type: 'currency' },
      { key: 'resolution_notes', label: 'Resolution Notes', type: 'longtext' },
      { key: 'transaction_id', label: 'Transaction ID' },
      { key: 'related_tickets', label: 'Related Tickets' },
    ],
  },
  {
    label: 'SLA Metrics',
    fields: [
      { key: 'first_response_at', label: 'First Response At', type: 'date' },
      { key: 'first_response_mins', label: 'First Response (mins)', type: 'number' },
      { key: 'time_to_first_rep_assignment', label: 'Time to First Assignment (mins)', type: 'number' },
      { key: 'time_to_first_response_sla_hours', label: 'First Response SLA (hrs)', type: 'number' },
      { key: 'time_to_close_hours', label: 'Time to Close (hrs)', type: 'number' },
      { key: 'resolved_at', label: 'Resolved At', type: 'date' },
    ],
  },
  {
    label: 'Feedback',
    fields: [
      { key: 'tenant_rating', label: 'Tenant Rating', type: 'number' },
      { key: 'csat_feedback', label: 'CSAT Feedback', type: 'longtext' },
      { key: 'csat_response', label: 'CSAT Response', type: 'longtext' },
    ],
  },
];

// ── Catalog (FSIN) ──────────────────────────────────────────────────

export const catalogColumns: HawkeyeColumn<Fsin>[] = withIcons([
  { key: 'fsin_code', label: 'FSIN Code', width: 140 },
  { key: 'item_name', label: 'Item Name', width: 180 },
  { key: 'category', label: 'Category', type: 'enum', width: 100, options: FSIN_CATEGORY_OPTIONS },
  { key: 'vendor_code', label: 'Vendor', width: 100 },
  { key: 'material', label: 'Material', width: 120 },
  { key: 'dimensions', label: 'Dimensions', width: 130 },
  { key: 'color', label: 'Color', width: 90 },
  { key: 'perceived_value', label: 'Value', type: 'currency', width: 110 },
  { key: 'total_stock', label: 'Total Stock', type: 'number', width: 90 },
  { key: 'in_properties', label: 'In Properties', type: 'number', width: 90 },
  { key: 'in_warehouse', label: 'In Warehouse', type: 'number', width: 90 },
]);

export const catalogFieldGroups: FieldGroup<Fsin>[] = [
  {
    label: 'Identification',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'fsin_code', label: 'FSIN Code' },
      { key: 'vendor_code', label: 'Vendor Code' },
      { key: 'item_name', label: 'Item Name' },
      { key: 'category', label: 'Category', type: 'enum', options: FSIN_CATEGORY_OPTIONS },
      { key: 'uom', label: 'UOM', type: 'enum', options: UOM_OPTIONS },
    ],
  },
  {
    label: 'Specification',
    fields: [
      { key: 'dimensions', label: 'Dimensions' },
      { key: 'material', label: 'Material' },
      { key: 'finish', label: 'Finish' },
      { key: 'color', label: 'Color' },
      { key: 'style', label: 'Style' },
      { key: 'packaging', label: 'Packaging', type: 'enum', options: PACKAGING_OPTIONS },
    ],
  },
  {
    label: 'Commercials',
    fields: [
      { key: 'perceived_value', label: 'Perceived Value', type: 'currency' },
      { key: 'annual_depreciation', label: 'Annual Depreciation (%)', type: 'number' },
      { key: 'reorder_point', label: 'Reorder Point', type: 'number' },
      { key: 'lego', label: 'Lego (Tag Count)', type: 'number' },
    ],
  },
  {
    label: 'Stock',
    fields: [
      { key: 'total_stock', label: 'Total Stock', type: 'number' },
      { key: 'in_properties', label: 'In Properties', type: 'number' },
      { key: 'in_warehouse', label: 'In Warehouse', type: 'number' },
      { key: 'under_repair', label: 'Under Repair', type: 'number' },
      { key: 'dead', label: 'Dead', type: 'number' },
    ],
  },
];

// ── Inventory Item ──────────────────────────────────────────────────

export const itemColumns: HawkeyeColumn<Item>[] = withIcons([
  { key: 'item_code', label: 'Item Code', width: 120 },
  { key: 'product_name', label: 'Product', width: 180 },
  { key: 'fsin_code', label: 'FSIN', width: 140 },
  { key: 'serial_no', label: 'Serial', type: 'number', width: 80 },
  { key: 'state', label: 'State', type: 'enum', width: 80, options: ITEM_STATE_OPTIONS },
  { key: 'location', label: 'Location', width: 150 },
  { key: 'unit_price', label: 'Unit Price', type: 'currency', width: 120 },
  { key: 'lock', label: 'Locked', type: 'boolean', width: 70 },
  { key: 'qa_flag', label: 'QA', type: 'enum', width: 80, options: QA_FLAG_OPTIONS },
  { key: 'total_repair_cost', label: 'Repair Cost', type: 'currency', width: 110 },
  { key: 'operational_months', label: 'Op Months', type: 'number', width: 90 },
]);

export const itemFieldGroups: FieldGroup<Item>[] = [
  {
    label: 'Identification',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'item_code', label: 'Item Code' },
      { key: 'fsin_code', label: 'FSIN Code' },
      { key: 'product_name', label: 'Product Name' },
      { key: 'serial_no', label: 'Serial No.', type: 'number' },
      { key: 'unit_price', label: 'Unit Price (excl GST)', type: 'currency' },
      { key: 'gst_percent', label: 'GST %', type: 'number' },
      { key: 'created_at', label: 'Created At', type: 'date' },
    ],
  },
  {
    label: 'State',
    fields: [
      { key: 'lock', label: 'Locked', type: 'boolean' },
      { key: 'location', label: 'Location' },
      { key: 'state', label: 'State', type: 'enum', options: ITEM_STATE_OPTIONS },
      { key: 'state_time', label: 'State Time', type: 'date' },
      { key: 'qa_flag', label: 'QA Flag', type: 'enum', options: QA_FLAG_OPTIONS },
    ],
  },
  {
    label: 'Repair & Operations',
    fields: [
      { key: 'total_repair_cost', label: 'Total Repair Cost', type: 'currency' },
      { key: 'repair_ticket_count', label: 'Repair Tickets', type: 'number' },
      { key: 'operational_months', label: 'Operational Months', type: 'number' },
    ],
  },
  {
    label: 'Transaction Links',
    fields: [
      { key: 'bill_document_id', label: 'Bill Document ID' },
      { key: 'purchase_txn_id', label: 'Purchase Txn ID' },
    ],
  },
];

// ── Overhead ────────────────────────────────────────────────────────

export const overheadColumns: HawkeyeColumn<Overhead>[] = withIcons([
  { key: 'id', label: 'ID', width: 80 },
  { key: 'pid', label: 'PID', width: 100 },
  { key: 'category_type', label: 'Category', type: 'enum', width: 130, options: OVERHEAD_CATEGORY_OPTIONS },
  { key: 'object_type', label: 'Type', type: 'enum', width: 100, options: OVERHEAD_OBJECT_TYPE_OPTIONS },
  { key: 'frequency', label: 'Frequency', type: 'enum', width: 100, options: OVERHEAD_FREQUENCY_OPTIONS },
  { key: 'start_date', label: 'Start', type: 'date', width: 110 },
  { key: 'end_date', label: 'End', type: 'date', width: 110 },
  { key: 'maintenance_amount', label: 'Amount', type: 'currency', width: 110 },
  { key: 'wifi_provider', label: 'WiFi Provider', type: 'enum', width: 120, options: WIFI_PROVIDER_OPTIONS },
  { key: 'helper_name', label: 'Helper', width: 130 },
  { key: 'pay_to_landlord', label: 'Pay to LL', type: 'boolean', width: 90 },
  { key: 'collect_from_tenant', label: 'Collect', type: 'boolean', width: 80 },
]);

export const overheadFieldGroups: FieldGroup<Overhead>[] = [
  {
    label: 'Overhead Identity',
    fields: [
      { key: 'id', label: 'ID' },
      { key: 'pid', label: 'PID' },
      { key: 'category_type', label: 'Category Type', type: 'enum', options: OVERHEAD_CATEGORY_OPTIONS },
      { key: 'object_type', label: 'Object Type', type: 'enum', options: OVERHEAD_OBJECT_TYPE_OPTIONS },
      { key: 'frequency', label: 'Frequency', type: 'enum', options: OVERHEAD_FREQUENCY_OPTIONS },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
      { key: 'pay_to_landlord', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'collect_from_tenant', label: 'Collect from Tenant', type: 'boolean' },
      { key: 'document', label: 'Document', type: 'file' },
    ],
  },
  {
    label: 'Maintenance',
    fields: [
      { key: 'maintenance_amount', label: 'Amount', type: 'currency' },
      { key: 'maintenance_cycle', label: 'Cycle', type: 'enum', options: MAINTENANCE_CYCLE_OPTIONS },
      { key: 'maintenance_cutoff_date', label: 'Cutoff Date' },
      { key: 'maintenance_cutoff', label: 'Cutoff (Legacy)' },
      { key: 'maintenance_bank_account', label: 'Bank Account' },
      { key: 'maintenance_ifsc', label: 'IFSC' },
      { key: 'maintenance_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'maintenance_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'WiFi',
    fields: [
      { key: 'wifi_provider', label: 'Provider', type: 'enum', options: WIFI_PROVIDER_OPTIONS },
      { key: 'wifi_account_id', label: 'Account ID' },
      { key: 'wifi_start_date', label: 'Start Date', type: 'date' },
      { key: 'wifi_plan_duration', label: 'Plan Duration (months)' },
      { key: 'wifi_end_date', label: 'End Date', type: 'date' },
      { key: 'wifi_plan_cost', label: 'Plan Cost', type: 'currency' },
      { key: 'wifi_ssid', label: 'SSID' },
      { key: 'wifi_password', label: 'Password' },
      { key: 'wifi_ownership', label: 'Ownership' },
      { key: 'wifi_amount', label: 'Amount', type: 'currency' },
      { key: 'wifi_registered_number', label: 'Registered Number', type: 'phone' },
      { key: 'wifi_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'Electricity',
    fields: [
      { key: 'electricity_provider', label: 'Provider' },
      { key: 'electricity_connection_type', label: 'Connection Type' },
      { key: 'electricity_account_no', label: 'Account No' },
      { key: 'electricity_password', label: 'Password' },
      { key: 'electricity_ownership', label: 'Ownership' },
      { key: 'electricity_account_id', label: 'Account ID' },
      { key: 'electricity_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'electricity_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'DG (Generator)',
    fields: [
      { key: 'dg_brand_details', label: 'Brand / Details' },
      { key: 'dg_capacity_kva', label: 'Capacity (KVA)' },
      { key: 'dg_maintenance_schedule', label: 'Maintenance Schedule' },
      { key: 'dg_fuel_tank_capacity', label: 'Fuel Tank Capacity (L)' },
      { key: 'dg_refill_unit_litres', label: 'Refill Unit (L)' },
      { key: 'dg_amount', label: 'Amount', type: 'currency' },
      { key: 'dg_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'dg_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'Water',
    fields: [
      { key: 'water_account_no', label: 'Account No' },
      { key: 'water_password', label: 'Password' },
      { key: 'water_ownership', label: 'Ownership' },
      { key: 'water_payments_dues', label: 'Payments / Dues', type: 'currency' },
      { key: 'water_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'water_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'Water Purifier',
    fields: [
      { key: 'purifier_type', label: 'Type', type: 'enum', options: PURIFIER_TYPE_OPTIONS },
      { key: 'purifier_brand', label: 'Brand' },
      { key: 'purifier_serial_no', label: 'Serial No' },
      { key: 'purifier_cost', label: 'Cost', type: 'currency' },
      { key: 'purifier_ownership', label: 'Ownership' },
      { key: 'purifier_start_date', label: 'Start Date', type: 'date' },
      { key: 'purifier_duration', label: 'Duration (months)' },
      { key: 'purifier_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'purifier_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'Gas Connection',
    fields: [
      { key: 'gas_connection_type', label: 'Connection Type' },
      { key: 'gas_account_no', label: 'Account No' },
      { key: 'gas_password', label: 'Password' },
      { key: 'gas_ownership', label: 'Ownership' },
      { key: 'gas_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'gas_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
  {
    label: 'Helper',
    fields: [
      { key: 'helper_name', label: 'Name' },
      { key: 'helper_phone', label: 'Phone', type: 'phone' },
      { key: 'helper_role', label: 'Role', type: 'enum', options: HELPER_ROLE_OPTIONS },
      { key: 'helper_salary', label: 'Salary', type: 'currency' },
      { key: 'helper_hours', label: 'Hours' },
      { key: 'helper_responsibilities', label: 'Responsibilities' },
      { key: 'helper_pay_to_ll', label: 'Pay to Landlord', type: 'boolean' },
      { key: 'helper_collect_tenant', label: 'Collect from Tenant', type: 'boolean' },
    ],
  },
];
