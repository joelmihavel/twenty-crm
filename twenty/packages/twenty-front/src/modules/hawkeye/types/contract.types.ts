import { type HistoryEntry } from './history.types';

export type ContractType = 'Tenant' | 'Merchant';

export type PaymentLifecycle =
  | 'Token Paid'
  | 'FMR Paid'
  | 'SD Paid'
  | 'All Payments Done'
  | 'Pending'
  | 'Partially Paid';

export type AgreementLifecycle =
  | 'Draft'
  | 'Sent for Signing'
  | 'Signed'
  | 'Active'
  | 'Expired'
  | 'Terminated';

export type AgreementStatus = 'Negotiation' | 'Triggered' | 'Active';

export type IncrementFrequency = 'Annual' | 'Biennial' | 'None';

export type PaymentCycle = 'Prepaid' | 'Postpaid';

export type Contract = {
  id: string;
  contract_type: ContractType;
  party_name: string;
  party_id: string;
  pid: string;
  rid: string;

  // CONTRACT IDENTITY
  contract_uid: string;

  // CONTRACT TERMS
  contract_start_date: string;
  contract_end_date: string;
  service_term: number;
  lock_in_duration: number;
  lock_in_end_date?: string;
  notice_period: number;
  preferred_move_out_date?: string; // Tenant only
  key_handover_date?: string; // Merchant only
  increment_percentage?: number; // Merchant only
  increment_frequency?: IncrementFrequency; // Merchant only

  // LIFECYCLE STATUS
  payment_lifecycle: PaymentLifecycle;
  agreement_lifecycle: AgreementLifecycle;
  agreement_status?: AgreementStatus; // Merchant only

  // COMMERCIALS - COMMON
  total_retail_rent: number;
  monthly_license_fee: number;
  security_deposit: number;
  effective_retail_rent: number;

  // COMMERCIALS - TENANT
  maintenance_fee?: number;
  furnishing_fee?: number;
  convenience_fee?: number;
  gst?: number;
  discount_amount?: number;
  caution_deposit?: number;
  lock_in_fee?: number;
  exit_fee?: number;

  // COMMERCIALS - MERCHANT
  base_rent?: string; // JSON array string representing tenure+hike schedule
  merchant_security_deposit?: number;
  management_fee_per_month?: number;
  total_cogs?: number;
  contract_acquisition_cost?: number;
  payment_cycle?: PaymentCycle;
  payment_deadline?: string;

  // PAYMENT REFERENCES
  token_txn_id: string | null;
  fmr_txn_id: string | null;
  sd_txn_id: string | null;

  // DEDUCTIONS (Tenant only)
  deductions: ContractDeduction[];
  damages_deductions?: number;
  society_fees?: number;
  penalty?: number;

  // CONTRACT STATUS
  fmr_status?: string;
  deposit_paid_status?: string;

  // DOCUMENTS
  agreement_pdf?: string; // File URL
  inventory_list?: string; // Merchant only, File URL

  history: HistoryEntry[];
};

export type ContractDeduction = {
  id: string;
  description: string;
  amount: number;
  category: string;
};

export type ContractFilters = {
  contract_type?: ContractType;
  payment_lifecycle?: PaymentLifecycle;
  agreement_lifecycle?: AgreementLifecycle;
  pid?: string;
  search?: string;
};
