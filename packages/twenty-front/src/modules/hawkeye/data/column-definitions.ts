import {
  Icon123,
  IconCalendarEvent,
  IconCheckbox,
  IconCurrencyDollar,
  IconLink,
  IconMail,
  IconPhone,
  IconTag,
  IconTextSize,
} from 'twenty-ui/display';

import {
  type HawkeyeColumn,
  type FieldGroup,
  type Tenant,
  type Merchant,
  type Vendor,
  type Property,
  type Room,
  type Contract,
  type Transaction,
  type Ticket,
  type Catalog,
  type InventoryItem,
  type Overhead,
} from '../types/entities';

// Map column type to the corresponding field-type icon (matches Twenty's pattern)
const typeIconMap = {
  text: IconTextSize,
  email: IconMail,
  phone: IconPhone,
  date: IconCalendarEvent,
  currency: IconCurrencyDollar,
  enum: IconTag,
  boolean: IconCheckbox,
  number: Icon123,
  url: IconLink,
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
  { key: 'tenant_lifecycle', label: 'Stage', type: 'enum', width: 100 },
  { key: 'current_pid', label: 'PID', width: 100 },
  { key: 'current_rid', label: 'RID', width: 80 },
  { key: 'occupation', label: 'Occupation', width: 150 },
  { key: 'employer_name', label: 'Employer', width: 140 },
  { key: 'budget_max', label: 'Budget Max', type: 'currency', width: 120 },
  { key: 'qualification_status', label: 'Qualification', type: 'enum', width: 120 },
  { key: 'bgv_status', label: 'BGV', type: 'enum', width: 100 },
  { key: 'nps_category', label: 'NPS', type: 'enum', width: 100 },
]);

export const tenantFieldGroups: FieldGroup<Tenant>[] = [
  {
    label: 'Identity',
    fields: [
      { key: 'record_id', label: 'Record ID' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'mobile_phone', label: 'Mobile Phone', type: 'phone' },
      { key: 'whatsapp_phone', label: 'WhatsApp Phone', type: 'phone' },
      { key: 'gender', label: 'Gender', type: 'enum' },
      { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { key: 'aadhaar_number', label: 'Aadhaar Number' },
      { key: 'pan', label: 'PAN' },
      { key: 'occupation', label: 'Occupation' },
      { key: 'employer_name', label: 'Employer' },
      { key: 'linkedin_url', label: 'LinkedIn', type: 'url' },
    ],
  },
  {
    label: 'Attribution',
    fields: [
      { key: 'create_date', label: 'Create Date', type: 'date' },
      { key: 'first_inquiry_channel', label: 'Channel', type: 'enum' },
      { key: 'source_drilldown_1', label: 'Source', type: 'enum' },
    ],
  },
  {
    label: 'Requirements',
    fields: [
      { key: 'preferred_micromarkets', label: 'Preferred Micromarkets' },
      { key: 'preferred_occupancy_type', label: 'Occupancy Type', type: 'enum' },
      { key: 'budget_max', label: 'Budget Max (INR)', type: 'currency' },
    ],
  },
  {
    label: 'Lifecycle & Qualification',
    fields: [
      { key: 'tenant_lifecycle', label: 'Lifecycle Stage', type: 'enum' },
      { key: 'current_pid', label: 'Current PID' },
      { key: 'current_rid', label: 'Current RID' },
      { key: 'qualification_status', label: 'Qualification Status', type: 'enum' },
      { key: 'bgv_status', label: 'BGV Status', type: 'enum' },
      { key: 'nps_category', label: 'NPS Category', type: 'enum' },
    ],
  },
];

// ── Merchant ───────────────────────────────────────────────────────

export const merchantColumns: HawkeyeColumn<Merchant>[] = withIcons([
  { key: 'unique_id', label: 'ID', width: 100 },
  { key: 'prefix', label: 'Prefix', width: 60 },
  { key: 'first_name', label: 'First Name', width: 120 },
  { key: 'last_name', label: 'Last Name', width: 120 },
  { key: 'merchant_type', label: 'Type', type: 'enum', width: 120 },
  { key: 'email', label: 'Email', type: 'email', width: 200 },
  { key: 'phone', label: 'Phone', type: 'phone', width: 140 },
  { key: 'current_city', label: 'City', width: 100 },
  { key: 'lead_source', label: 'Lead Source', type: 'enum', width: 120 },
  { key: 'signing_authority', label: 'Signing Auth', type: 'boolean', width: 100 },
]);

export const merchantFieldGroups: FieldGroup<Merchant>[] = [
  {
    label: 'Lead Info',
    fields: [
      { key: 'unique_id', label: 'Unique ID' },
      { key: 'merchant_type', label: 'Merchant Type', type: 'enum' },
      { key: 'lead_source', label: 'Lead Source', type: 'enum' },
      { key: 'prefix', label: 'Prefix', type: 'enum' },
      { key: 'first_name', label: 'First Name' },
      { key: 'last_name', label: 'Last Name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'current_city', label: 'City' },
    ],
  },
  {
    label: 'Demographics',
    fields: [
      { key: 'designation', label: 'Designation' },
      { key: 'organization', label: 'Organization' },
    ],
  },
  {
    label: 'Payment Details',
    fields: [
      { key: 'pan_number', label: 'PAN' },
      { key: 'bank_account_number', label: 'Bank Account' },
      { key: 'beneficiary_name', label: 'Beneficiary Name' },
      { key: 'ifsc_code', label: 'IFSC Code' },
    ],
  },
  {
    label: 'Permissions & Meta',
    fields: [
      { key: 'signing_authority', label: 'Signing Authority', type: 'boolean' },
      { key: 'potentially_multihome', label: 'Multi-home Potential', type: 'boolean' },
      { key: 'first_added', label: 'First Added', type: 'date' },
    ],
  },
];

// ── Vendor ──────────────────────────────────────────────────────────

export const vendorColumns: HawkeyeColumn<Vendor>[] = withIcons([
  { key: 'vendor_code', label: 'Code', width: 100 },
  { key: 'vendor_name', label: 'Name', width: 180 },
  { key: 'vendor_type', label: 'Type', type: 'enum', width: 120 },
  { key: 'contact_name', label: 'Contact', width: 140 },
  { key: 'phone', label: 'Phone', type: 'phone', width: 140 },
  { key: 'city', label: 'City', width: 100 },
  { key: 'specialization', label: 'Specialization', width: 160 },
  { key: 'quality_tier', label: 'Tier', type: 'enum', width: 80 },
  { key: 'tat_in_days', label: 'TAT (days)', type: 'number', width: 90 },
  { key: 'min_order_value', label: 'Min Order', type: 'currency', width: 120 },
]);

export const vendorFieldGroups: FieldGroup<Vendor>[] = [
  {
    label: 'Identification',
    fields: [
      { key: 'vendor_code', label: 'Vendor Code' },
      { key: 'vendor_name', label: 'Vendor Name' },
      { key: 'vendor_type', label: 'Type', type: 'enum' },
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
    label: 'Billing',
    fields: [
      { key: 'gst_number', label: 'GST Number' },
      { key: 'pan', label: 'PAN' },
    ],
  },
  {
    label: 'Capability & Commercials',
    fields: [
      { key: 'specialization', label: 'Specialization', type: 'longtext' },
      { key: 'tat_in_days', label: 'TAT (Days)', type: 'number' },
      { key: 'customization_capability', label: 'Customization', type: 'enum' },
      { key: 'quality_tier', label: 'Quality Tier', type: 'enum' },
      { key: 'payment_terms', label: 'Payment Terms' },
      { key: 'min_order_value', label: 'Min Order Value', type: 'currency' },
    ],
  },
];

// ── Property (PID) ─────────────────────────────────────────────────

export const propertyColumns: HawkeyeColumn<Property>[] = withIcons([
  { key: 'pid', label: 'PID', width: 100 },
  { key: 'type', label: 'Status', type: 'enum', width: 90 },
  { key: 'house_no', label: 'House No.', width: 100 },
  { key: 'property_type', label: 'Type', type: 'enum', width: 100 },
  { key: 'building_society', label: 'Building / Society', width: 180 },
  { key: 'active_cluster', label: 'Cluster', type: 'enum', width: 80 },
  { key: 'active_units_count', label: 'Units', type: 'number', width: 70 },
  { key: 'floor', label: 'Floor', width: 70 },
  { key: 'furnishing_status', label: 'Furnishing', type: 'enum', width: 120 },
  { key: 'deal_owner', label: 'Deal Owner', width: 120 },
]);

export const propertyFieldGroups: FieldGroup<Property>[] = [
  {
    label: 'Property Details',
    fields: [
      { key: 'pid', label: 'PID' },
      { key: 'type', label: 'Status', type: 'enum' },
      { key: 'house_no', label: 'House No.' },
      { key: 'property_type', label: 'Property Type', type: 'enum' },
      { key: 'active_units_count', label: 'Units', type: 'number' },
      { key: 'tier', label: 'Tier' },
      { key: 'floor', label: 'Floor' },
      { key: 'address', label: 'Address', type: 'longtext' },
      { key: 'building_society', label: 'Building / Society' },
      { key: 'active_cluster', label: 'Cluster', type: 'enum' },
    ],
  },
  {
    label: 'Amenities',
    fields: [
      { key: 'parking_type', label: 'Parking' },
      { key: 'power_backup', label: 'Power Backup', type: 'enum' },
      { key: 'furnishing_status', label: 'Furnishing Status', type: 'enum' },
    ],
  },
  {
    label: 'Ownership',
    fields: [
      { key: 'deal_owner', label: 'Deal Owner' },
      { key: 'psm_owner', label: 'PSM Owner' },
      { key: 'rent_deadline', label: 'Rent Deadline' },
    ],
  },
];

// ── Room (RID) ──────────────────────────────────────────────────────

export const roomColumns: HawkeyeColumn<Room>[] = withIcons([
  { key: 'rid', label: 'RID', width: 80 },
  { key: 'pid', label: 'PID', width: 100 },
  { key: 'room_status', label: 'Status', type: 'enum', width: 130 },
  { key: 'bed_type', label: 'Bed', type: 'enum', width: 90 },
  { key: 'ac', label: 'AC', type: 'boolean', width: 60 },
  { key: 'attached_bathroom', label: 'Bath', type: 'boolean', width: 60 },
  { key: 'balcony', label: 'Balcony', type: 'boolean', width: 70 },
  { key: 'base_rent', label: 'Base Rent', type: 'currency', width: 120 },
  { key: 'maintenance_fee', label: 'Maintenance', type: 'currency', width: 120 },
  { key: 'current_tenant_name', label: 'Current Tenant', width: 150 },
  { key: 'available_from', label: 'Available From', type: 'date', width: 120 },
]);

export const roomFieldGroups: FieldGroup<Room>[] = [
  {
    label: 'Room Identity',
    fields: [
      { key: 'rid', label: 'RID' },
      { key: 'pid', label: 'PID' },
    ],
  },
  {
    label: 'Specifications',
    fields: [
      { key: 'attached_bathroom', label: 'Attached Bathroom', type: 'boolean' },
      { key: 'balcony', label: 'Balcony', type: 'boolean' },
      { key: 'bed_type', label: 'Bed Type', type: 'enum' },
      { key: 'ac', label: 'AC', type: 'boolean' },
      { key: 'ac_type', label: 'AC Type', type: 'enum' },
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
      { key: 'room_status', label: 'Room Status', type: 'enum' },
      { key: 'current_contract_id', label: 'Current Contract' },
      { key: 'current_tenant_name', label: 'Current Tenant' },
      { key: 'available_from', label: 'Available From', type: 'date' },
    ],
  },
];

// ── Contract ────────────────────────────────────────────────────────

export const contractColumns: HawkeyeColumn<Contract>[] = withIcons([
  { key: 'contract_uid', label: 'Contract UID', width: 220 },
  { key: 'contract_type', label: 'Type', type: 'enum', width: 110 },
  { key: 'party_name_tenant', label: 'Tenant', width: 140 },
  { key: 'party_name_merchant', label: 'Merchant', width: 140 },
  { key: 'rid', label: 'RID', width: 80 },
  { key: 'contract_start_date', label: 'Start', type: 'date', width: 110 },
  { key: 'contract_end_date', label: 'End', type: 'date', width: 110 },
  { key: 'monthly_license_fee', label: 'Monthly Fee', type: 'currency', width: 120 },
  { key: 'security_deposit', label: 'Deposit', type: 'currency', width: 120 },
  { key: 'payment_lifecycle', label: 'Payment Status', type: 'enum', width: 130 },
]);

export const contractFieldGroups: FieldGroup<Contract>[] = [
  {
    label: 'Contract Identity',
    fields: [
      { key: 'contract_uid', label: 'Contract UID' },
      { key: 'contract_type', label: 'Type', type: 'enum' },
      { key: 'party_name_tenant', label: 'Party (Tenant)' },
      { key: 'party_name_merchant', label: 'Party (Merchant)' },
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
      { key: 'notice_period', label: 'Notice Period (Days)', type: 'number' },
    ],
  },
  {
    label: 'Lifecycle',
    fields: [
      { key: 'payment_lifecycle', label: 'Payment Status', type: 'enum' },
      { key: 'agreement_lifecycle', label: 'Agreement Status', type: 'enum' },
    ],
  },
  {
    label: 'Commercials',
    fields: [
      { key: 'total_retail_rent', label: 'Total Retail Rent', type: 'currency' },
      { key: 'monthly_license_fee', label: 'Monthly License Fee', type: 'currency' },
      { key: 'effective_retail_rent', label: 'Effective Rent', type: 'currency' },
      { key: 'security_deposit', label: 'Security Deposit', type: 'currency' },
    ],
  },
];

// ── Transaction ─────────────────────────────────────────────────────

export const transactionColumns: HawkeyeColumn<Transaction>[] = withIcons([
  { key: 'utn', label: 'UTN', width: 180 },
  { key: 'credit_debit', label: 'Cr/Dr', type: 'enum', width: 80 },
  { key: 'transaction_date', label: 'Date', type: 'date', width: 110 },
  { key: 'amount', label: 'Amount', type: 'currency', width: 130 },
  { key: 'purpose_category_1', label: 'Category', type: 'enum', width: 110 },
  { key: 'from_party', label: 'From', width: 140 },
  { key: 'to_party', label: 'To', width: 140 },
  { key: 'payment_channel', label: 'Channel', type: 'enum', width: 100 },
  { key: 'payment_provider', label: 'Provider', type: 'enum', width: 110 },
  { key: 'pid', label: 'PID', width: 90 },
]);

export const transactionFieldGroups: FieldGroup<Transaction>[] = [
  {
    label: 'Transaction Core',
    fields: [
      { key: 'utn', label: 'UTN' },
      { key: 'credit_debit', label: 'Credit / Debit', type: 'enum' },
      { key: 'transaction_date', label: 'Transaction Date', type: 'date' },
      { key: 'amount', label: 'Amount (INR)', type: 'currency' },
    ],
  },
  {
    label: 'Classification',
    fields: [
      { key: 'purpose_category_1', label: 'Purpose Category 1', type: 'enum' },
      { key: 'purpose_category_2', label: 'Purpose Category 2', type: 'enum' },
    ],
  },
  {
    label: 'Parties',
    fields: [
      { key: 'from_party', label: 'From (Payer)' },
      { key: 'from_party_type', label: 'From Type', type: 'enum' },
      { key: 'to_party', label: 'To (Payee)' },
      { key: 'to_party_type', label: 'To Type', type: 'enum' },
    ],
  },
  {
    label: 'Payment Details',
    fields: [
      { key: 'payment_channel', label: 'Channel', type: 'enum' },
      { key: 'payment_provider', label: 'Provider', type: 'enum' },
      { key: 'gateway_reference_id', label: 'Gateway Ref' },
    ],
  },
  {
    label: 'Links',
    fields: [
      { key: 'contract_uid', label: 'Contract UID' },
      { key: 'pid', label: 'PID' },
      { key: 'rid', label: 'RID' },
      { key: 'created_by', label: 'Created By' },
      { key: 'created_date', label: 'Created Date', type: 'date' },
    ],
  },
];

// ── Ticket ──────────────────────────────────────────────────────────

export const ticketColumns: HawkeyeColumn<Ticket>[] = withIcons([
  { key: 'ticket_id', label: 'ID', type: 'number', width: 70 },
  { key: 'pipeline', label: 'Pipeline', type: 'enum', width: 90 },
  { key: 'ticket_name', label: 'Name', width: 200 },
  { key: 'ticket_status', label: 'Status', type: 'enum', width: 150 },
  { key: 'priority', label: 'Priority', type: 'enum', width: 90 },
  { key: 'ticket_category', label: 'Category', type: 'enum', width: 110 },
  { key: 'ticket_owner', label: 'Owner', width: 120 },
  { key: 'pid', label: 'PID', width: 90 },
  { key: 'assigned_vendor', label: 'Vendor', width: 150 },
  { key: 'create_date', label: 'Created', type: 'date', width: 110 },
  { key: 'total_cost', label: 'Cost', type: 'currency', width: 100 },
]);

export const ticketFieldGroups: FieldGroup<Ticket>[] = [
  {
    label: 'Ticket Identity',
    fields: [
      { key: 'ticket_id', label: 'Ticket ID', type: 'number' },
      { key: 'pipeline', label: 'Pipeline', type: 'enum' },
      { key: 'ticket_name', label: 'Ticket Name' },
      { key: 'ticket_description', label: 'Description', type: 'longtext' },
      { key: 'ticket_owner', label: 'Owner' },
      { key: 'pid', label: 'PID' },
      { key: 'rid', label: 'RID' },
      { key: 'create_date', label: 'Create Date', type: 'date' },
    ],
  },
  {
    label: 'Categorisation',
    fields: [
      { key: 'ticket_category', label: 'Category', type: 'enum' },
      { key: 'ticket_status', label: 'Status', type: 'enum' },
      { key: 'priority', label: 'Priority', type: 'enum' },
    ],
  },
  {
    label: 'Execution',
    fields: [
      { key: 'assigned_vendor', label: 'Assigned Vendor' },
      { key: 'total_cost', label: 'Total Cost', type: 'currency' },
      { key: 'resolution_notes', label: 'Resolution Notes', type: 'longtext' },
    ],
  },
  {
    label: 'Feedback',
    fields: [
      { key: 'tenant_rating', label: 'Tenant Rating', type: 'number' },
    ],
  },
];

// ── Catalog (FSIN) ──────────────────────────────────────────────────

export const catalogColumns: HawkeyeColumn<Catalog>[] = withIcons([
  { key: 'fsin_code', label: 'FSIN Code', width: 140 },
  { key: 'item_name', label: 'Item Name', width: 180 },
  { key: 'category', label: 'Category', type: 'enum', width: 100 },
  { key: 'vendor_code', label: 'Vendor', width: 100 },
  { key: 'material', label: 'Material', width: 120 },
  { key: 'dimensions', label: 'Dimensions', width: 130 },
  { key: 'color', label: 'Color', width: 90 },
  { key: 'perceived_value', label: 'Value', type: 'currency', width: 110 },
  { key: 'reorder_point', label: 'Reorder Pt', type: 'number', width: 90 },
  { key: 'packaging', label: 'Packaging', type: 'enum', width: 100 },
]);

export const catalogFieldGroups: FieldGroup<Catalog>[] = [
  {
    label: 'Identification',
    fields: [
      { key: 'fsin_code', label: 'FSIN Code' },
      { key: 'vendor_code', label: 'Vendor Code' },
      { key: 'item_name', label: 'Item Name' },
      { key: 'category', label: 'Category', type: 'enum' },
      { key: 'uom', label: 'UOM', type: 'enum' },
      { key: 'reorder_point', label: 'Reorder Point', type: 'number' },
      { key: 'annual_depreciation', label: 'Annual Depreciation', type: 'currency' },
      { key: 'perceived_value', label: 'Perceived Value', type: 'currency' },
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
    ],
  },
  {
    label: 'Others',
    fields: [
      { key: 'packaging', label: 'Packaging', type: 'enum' },
      { key: 'lego', label: 'Lego (Tag Count)', type: 'number' },
    ],
  },
];

// ── Inventory Item ──────────────────────────────────────────────────

export const itemColumns: HawkeyeColumn<InventoryItem>[] = withIcons([
  { key: 'item_code', label: 'Item Code', width: 120 },
  { key: 'fsin_code', label: 'FSIN', width: 140 },
  { key: 'serial_no', label: 'Serial', type: 'number', width: 80 },
  { key: 'state', label: 'State', type: 'enum', width: 80 },
  { key: 'location', label: 'Location', width: 150 },
  { key: 'unit_price', label: 'Unit Price', type: 'currency', width: 120 },
  { key: 'lock', label: 'Locked', type: 'boolean', width: 70 },
  { key: 'qa_flag', label: 'QA', type: 'enum', width: 60 },
  { key: 'created_at', label: 'Created', type: 'date', width: 110 },
  { key: 'state_time', label: 'State Since', type: 'date', width: 110 },
]);

export const itemFieldGroups: FieldGroup<InventoryItem>[] = [
  {
    label: 'Identification',
    fields: [
      { key: 'item_code', label: 'Item Code' },
      { key: 'fsin_code', label: 'FSIN Code' },
      { key: 'serial_no', label: 'Serial No.', type: 'number' },
      { key: 'unit_price', label: 'Unit Price (excl GST)', type: 'currency' },
      { key: 'created_at', label: 'Created At', type: 'date' },
    ],
  },
  {
    label: 'State',
    fields: [
      { key: 'lock', label: 'Locked', type: 'boolean' },
      { key: 'location', label: 'Location' },
      { key: 'state', label: 'State', type: 'enum' },
      { key: 'state_time', label: 'State Time', type: 'date' },
      { key: 'qa_flag', label: 'QA Flag', type: 'enum' },
    ],
  },
  {
    label: 'Transaction Links',
    fields: [
      { key: 'bill_document_id', label: 'Bill Document ID' },
    ],
  },
];

// ── Overhead ────────────────────────────────────────────────────────

export const overheadColumns: HawkeyeColumn<Overhead>[] = withIcons([
  { key: 'pid', label: 'PID', width: 100 },
  { key: 'category_type', label: 'Category', type: 'enum', width: 130 },
  { key: 'object_type', label: 'Type', type: 'enum', width: 100 },
  { key: 'frequency', label: 'Frequency', type: 'enum', width: 100 },
  { key: 'start_date', label: 'Start', type: 'date', width: 110 },
  { key: 'end_date', label: 'End', type: 'date', width: 110 },
  { key: 'maintenance_amount', label: 'Amount', type: 'currency', width: 110 },
  { key: 'wifi_provider', label: 'WiFi Provider', type: 'enum', width: 120 },
  { key: 'helper_name', label: 'Helper', width: 130 },
  { key: 'helper_salary', label: 'Helper Salary', type: 'currency', width: 120 },
]);

export const overheadFieldGroups: FieldGroup<Overhead>[] = [
  {
    label: 'Overhead Identity',
    fields: [
      { key: 'pid', label: 'PID' },
      { key: 'category_type', label: 'Category Type', type: 'enum' },
      { key: 'object_type', label: 'Object Type', type: 'enum' },
      { key: 'frequency', label: 'Frequency', type: 'enum' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' },
    ],
  },
  {
    label: 'Maintenance',
    fields: [
      { key: 'maintenance_amount', label: 'Amount', type: 'currency' },
      { key: 'maintenance_cycle', label: 'Cycle', type: 'enum' },
    ],
  },
  {
    label: 'WiFi',
    fields: [
      { key: 'wifi_provider', label: 'Provider', type: 'enum' },
      { key: 'wifi_amount', label: 'Amount', type: 'currency' },
    ],
  },
  {
    label: 'Electricity',
    fields: [
      { key: 'electricity_provider', label: 'Provider' },
    ],
  },
  {
    label: 'Helper',
    fields: [
      { key: 'helper_name', label: 'Name' },
      { key: 'helper_role', label: 'Role', type: 'enum' },
      { key: 'helper_salary', label: 'Salary', type: 'currency' },
    ],
  },
];
