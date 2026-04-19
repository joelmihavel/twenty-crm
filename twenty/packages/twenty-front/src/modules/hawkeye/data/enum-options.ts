// Centralized enum options for every field in the CRM.
// Sourced from HAWKEYE_FIELD_RELATIONS.md — single source of truth.

// ── Tenant ──────────────────────────────────────────────────────────

export const GENDER_OPTIONS = ['Male', 'Female'];

export const INQUIRY_CHANNEL_OPTIONS = [
  'WhatsApp', 'Website', 'Instagram', 'Facebook', 'Direct Call',
  'Walk-in', 'Platform', 'Referral', 'Offline Activation', 'LinkedIn',
];

export const SOURCE_DRILLDOWN_1_OPTIONS = [
  'Housing.com', 'MagicBricks', 'NoBroker', '99acres',
  'Google Ads', 'Meta Ads', 'Instagram Ads', 'YouTube Ads',
  'WhatsApp Organic', 'Referral', 'Direct Call', 'Walk-in', 'Other',
];

export const OCCUPANCY_TYPE_OPTIONS = ['Full Home', 'Private Room'];

export const FURNISHED_TYPE_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

export const MOVE_IN_TIMELINE_OPTIONS = ['Immediate', 'Within 2 Weeks', 'Flexible'];

export const GENDER_PREFERENCE_OPTIONS = ['Male Only', 'Female Only', 'No Preference'];

export const FOOD_PREFERENCE_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'];

export const SMOKING_PREFERENCE_OPTIONS = ['Smoker', 'Non-Smoker', 'Occasional'];

export const BGV_STATUS_OPTIONS = ['Not Started', 'In Progress', 'Passed', 'Failed'];

export const QUALIFICATION_STATUS_OPTIONS = ['Qualified', 'Not Qualified', 'Dead', 'Paused'];

export const DISQUALIFICATION_REASON_OPTIONS = [
  'Budget', 'Location', 'Availability', 'No Response',
  'Chose Competitor', 'Life Event', 'Other',
];

export const TENANT_LIFECYCLE_OPTIONS = [
  'New Inquiry', 'Visit Scheduled', 'Visit Done', 'Negotiation',
  'Converted', 'Gestation', 'Moved In', 'Notice Period', 'Moved Out', 'Churned',
];

export const NPS_CATEGORY_OPTIONS = ['Promoter', 'Passive', 'Detractor'];

export const VISIT_OUTCOME_OPTIONS = ['Liked', 'Not Liked', 'Shortlisted', 'Booked', 'Cancelled'];

export const MICROMARKET_OPTIONS = [
  'HSR Layout', 'Koramangala', 'Indiranagar', 'Bellandur', 'Whitefield',
  'Electronic City', 'Marathahalli', 'Jayanagar', 'JP Nagar', 'Bannerghatta',
];

// ── Merchant ────────────────────────────────────────────────────────

export const MERCHANT_TYPE_OPTIONS = ['Landlord', 'POC', 'Lead', 'Broker', 'Management'];

export const PREFIX_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr'];

export const MERCHANT_LEAD_SOURCE_OPTIONS = [
  'WhatsApp', 'Website', 'Referral', 'Platform', 'Cold Call', 'Walk-in', 'Other',
];

export const MERCHANT_DISQUALIFICATION_REASON_OPTIONS = [
  'Rent Mismatch', 'Location', 'Property Condition', 'Restrictions',
  'No Response', 'Chose Competitor', 'Other',
];

export const LANDLORD_PERSONALITY_OPTIONS = [
  'Cooperative', 'Difficult', 'Hands-off', 'Involved', 'Professional',
];

export const MERCHANT_DEAL_STAGE_OPTIONS = [
  'To be contacted', 'In touch', 'LL Interested', 'Qualified',
  'Evaluation', 'Negotiations', 'Offer Extended', 'Under Contract',
  'To nurture', 'Churned', 'Lost',
];

// ── PID ─────────────────────────────────────────────────────────────

export const PID_TYPE_OPTIONS = ['Lead', 'Active', 'Churned'];

export const DEAL_TYPE_OPTIONS = ['Residence Lead', 'Enterprise Lead'];

export const PROPERTY_TYPE_OPTIONS = [
  '1BHK', '2BHK', '3BHK', '4BHK', '5BHK',
  'Studio', 'Villa', 'Penthouse', 'Row House',
];

export const CLUSTER_OPTIONS = ['HSR', 'KRM', 'IDR', 'MHD', 'BLD', 'MGR', 'HBL', 'WHF'];

export const FURNISHING_STATUS_OPTIONS = [
  'Unfurnished', 'Semi-Furnished', 'Partially Furnished', 'Fully Furnished',
];

export const DEAL_STAGE_OPTIONS = [
  'To be contacted', 'In touch', 'LL Interested', 'Qualified',
  'Evaluation', 'Negotiations', 'Offer Extended', 'Under Contract', 'To nurture',
];

export const POWER_BACKUP_OPTIONS = ['Full', 'Partial', 'DG Only', 'Inverter', 'None'];

export const PAYMENT_COLLECTION_OPTIONS = ['Upfront', 'Straight Deduction', 'EMI'];

export const PROP_MGMT_APP_OPTIONS = ['MyGate', 'NoBrokerHood', 'ApnaComplex', 'None'];

// ── RID ─────────────────────────────────────────────────────────────

export const BED_TYPE_OPTIONS = ['Single', 'Double', 'Queen', 'King'];

export const AC_TYPE_OPTIONS = ['Split', 'Window', 'Portable', 'Not Possible'];

export const ROOM_STATUS_OPTIONS = ['Available', 'Occupied', 'Under Maintenance', 'Blocked'];

// ── Contracts ───────────────────────────────────────────────────────

export const CONTRACT_TYPE_OPTIONS = ['L&L', 'Authorisation', 'C&S'];

export const INCREMENT_FREQUENCY_OPTIONS = ['Annual', 'Biennial', 'None'];

export const PAYMENT_CYCLE_OPTIONS = ['Prepaid', 'Postpaid'];

export const PAYMENT_LIFECYCLE_OPTIONS = [
  'Token Pending', 'Token Paid', 'FMR Pending', 'FMR Paid',
  'SD Pending', 'SD Paid', 'Active', 'Settled',
];

export const AGREEMENT_LIFECYCLE_OPTIONS = [
  'Draft', 'Sent', 'Signed', 'Active', 'Expired', 'Terminated',
];

export const FMR_STATUS_OPTIONS = ['Pending', 'Paid', 'Waived'];

export const DEPOSIT_PAID_STATUS_OPTIONS = ['Pending', 'Partial', 'Paid', 'Refunded'];

// ── Transactions ────────────────────────────────────────────────────

export const CREDIT_DEBIT_OPTIONS = ['Credit', 'Debit'];

export const PURPOSE_CATEGORY_1_OPTIONS = [
  'OPEX', 'CAPEX', 'INTEREST', 'SALARY', 'REIMBURSEMENT',
  'REVENUE', 'REFUNDS', 'COGS',
];

export const PURPOSE_CATEGORY_2_OPTIONS = [
  'TRANSPORT', 'OFFICE', 'TECH', 'MARKETING', 'FOOD AND BEVERAGES',
  'CUSTOMER EXPERIENCE', 'ON/OFF-BOARDING', 'RUNNING EXPENSE',
  'FIXTURES', 'INVENTORY', 'RENT', 'DEPOSIT',
  'EMPLOYEE', 'CONSULTANT', 'CONTRACTOR', 'OTHER',
];

export const FROM_PARTY_TYPE_OPTIONS = [
  'Tenant', 'Landlord', 'Vendor', 'Platform', 'Third Party', 'Government',
];

export const TO_PARTY_TYPE_OPTIONS = FROM_PARTY_TYPE_OPTIONS;

export const PAYMENT_CHANNEL_OPTIONS = [
  'UPI', 'NEFT', 'RTGS', 'IMPS', 'Auto-debit (NACH)',
  'Virtual Account', 'Cheque', 'Card', 'Cash', 'Other',
];

export const PAYMENT_PROVIDER_OPTIONS = [
  'Kotak', 'IDFC', 'Razorpayx', 'Volopay', 'CASHFREE', 'Mobiqwik',
];

export const COST_REVENUE_CENTER_OPTIONS = [
  'Operations', 'Sales', 'Marketing', 'Finance', 'Tech', 'CX',
];

// ── Tickets ─────────────────────────────────────────────────────────

export const PIPELINE_OPTIONS = ['Tenant', 'Landlord'];

export const TICKET_CATEGORY_OPTIONS = [
  'Plumbing', 'Carpentry', 'Electrical', 'Utility', 'Inventory',
  'Appliance', 'Agreement', 'Reimbursement', 'OO', 'Other',
];

export const TICKET_STATUS_OPTIONS = [
  'New', 'Open', 'In Progress', 'Waiting on Vendor',
  'Waiting on Tenant', 'Resolved', 'Closed',
];

export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent', 'Critical'];

export const CATEGORY_PHASE_OPTIONS = ['Pre Move-In', 'Gestation', 'Active'];

export const TICKET_FLAG_OPTIONS = ['Reasonable', 'Not Reasonable', 'Subjective'];

// ── Vendors ─────────────────────────────────────────────────────────

export const VENDOR_TYPE_OPTIONS = [
  'Manufacturer', 'Wholesaler', 'Distributor', 'Freelancer',
  'Aggregator', 'Retailer', 'Landlord',
];

export const MSME_OPTIONS = ['Yes', 'No'];

export const CUSTOMIZATION_CAPABILITY_OPTIONS = ['Low', 'Medium', 'High'];

export const STANDARDISATION_FIT_OPTIONS = ['C1', 'C2', 'C3'];

export const QUALITY_TIER_OPTIONS = ['T1', 'T2', 'T3'];

// ── FSIN ────────────────────────────────────────────────────────────

export const FSIN_CATEGORY_OPTIONS = [
  'Furniture', 'Appliance', 'Rug', 'Linen', 'Fixture', 'Electronics', 'Other',
];

export const UOM_OPTIONS = ['Piece', 'Set', 'Pair', 'Box'];

export const PACKAGING_OPTIONS = ['Flatpack', 'Assembled'];

// ── Items ───────────────────────────────────────────────────────────

export const ITEM_STATE_OPTIONS = ['BUY', 'WIB', 'WOB', 'PIB', 'POB', 'WORK', 'DEAD'];

export const QA_FLAG_OPTIONS = ['Pass', 'Fail', 'Pending'];

// ── Overheads ───────────────────────────────────────────────────────

export const OVERHEAD_CATEGORY_OPTIONS = [
  'Maintenance', 'WiFi', 'DG (Generator)', 'Water',
  'Water Purifier', 'Gas Connection', 'Electricity', 'Helper',
];

export const OVERHEAD_OBJECT_TYPE_OPTIONS = ['Recurring', 'One-Time'];

export const OVERHEAD_FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Bi-Annually', 'Annually'];

export const WIFI_PROVIDER_OPTIONS = ['ACT', 'Airtel', 'Tata'];

export const MAINTENANCE_CYCLE_OPTIONS = ['Prepaid', 'Postpaid'];

export const PURIFIER_TYPE_OPTIONS = ['Rented', 'Owned'];

export const HELPER_ROLE_OPTIONS = [
  'Caretaker', 'Cleaner', 'Security', 'Cook', 'Maintenance', 'Other',
];

// ── Approvals ───────────────────────────────────────────────────────

export const APPROVAL_STATUS_OPTIONS = [
  'Pending Review', 'Under Review', 'Approved', 'Rejected', 'Changes Requested',
];

export const MOVE_IN_STATUS_OPTIONS = [
  'Not Started', 'In Progress', 'Ready', 'Completed', 'On Hold',
];

export const MOVE_OUT_STATUS_OPTIONS = [
  'Notice Received', 'Inspection Scheduled', 'Inspection Done',
  'SD Settlement', 'Completed',
];

export const SD_SETTLEMENT_STATUS_OPTIONS = [
  'Pending Inspection', 'Inspection Done', 'Deductions Calculated',
  'Approved', 'Refund Initiated', 'Settled',
];

export const PO_TYPE_OPTIONS = [
  'Fixture', 'Repair', 'Maintenance', 'Furnishing', 'Appliance', 'Other',
];

export const URGENCY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
