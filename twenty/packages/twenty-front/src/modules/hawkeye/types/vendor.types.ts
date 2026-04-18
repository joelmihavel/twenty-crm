import { type HistoryEntry } from './history.types';

export type VendorType =
  | 'Manufacturer'
  | 'Distributor'
  | 'Retailer'
  | 'Aggregate'
  | 'Freelancer'
  | 'Aggregator'
  | 'Landlord';

export type QualityTier = 'Premium' | 'Standard' | 'Budget';

export type MsmeVendor = 'Yes' | 'No';

export type Vendor = {
  id: string;
  vendor_code: string;
  vendor_name: string;
  vendor_type: VendorType;
  contact_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  gst_number: string;
  pan: string;
  specialization: string;
  tat_in_days: number;
  quality_tier: QualityTier;
  payment_terms: string;
  min_order_value: number;
  customization_capability: string;
  created_at: string;

  // Billing
  bank_name?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  msme_vendor?: MsmeVendor;
  udyam_aadhaar?: string;
  negotiation_remarks?: string;

  history: HistoryEntry[];
};

export type VendorFilters = {
  vendor_type?: VendorType;
  quality_tier?: QualityTier;
  city?: string;
  search?: string;
};
