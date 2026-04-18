import { type HistoryEntry } from './history.types';

export type MerchantDealStage =
  | 'To be contacted'
  | 'In touch'
  | 'Qualified'
  | 'Evaluation'
  | 'Negotiations'
  | 'Offer Extended'
  | 'Under Contract'
  | 'To nurture'
  | 'Churned';

export type Merchant = {
  id: string;
  unique_id: string;
  merchant_type: string;
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  current_city: string;
  lead_source: string;
  designation: string;
  organization: string;
  pan_number: string;
  pan_card_image: string;
  aadhaar_back: string;
  bank_account_number: string;
  beneficiary_name: string;
  ifsc_code: string;
  current_residential: string;
  permanent_residential?: string;
  signing_authority: boolean;
  potentially_multihome: boolean;
  deal_stage: MerchantDealStage;
  disqualification_reason?: string;
  lost_reason?: string;
  landlord_personality?: string;
  general_ll_comments?: string;
  management_email?: string;
  management_phone?: string;
  communications_permission?: boolean;
  linkedin_url?: string;
  pid_ids: string[];
  first_added: string;
  last_updated: string;
  history: HistoryEntry[];
};

export type MerchantFilters = {
  deal_stage?: MerchantDealStage;
  merchant_type?: string;
  city?: string;
  search?: string;
};
