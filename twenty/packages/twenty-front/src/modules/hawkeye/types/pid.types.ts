import { type HistoryEntry } from './history.types';

export type PidType = 'lead' | 'active' | 'churned';

export type PidDealStage =
  | 'To be contacted'
  | 'In touch'
  | 'Qualified'
  | 'Evaluation'
  | 'Negotiations'
  | 'Offer Extended'
  | 'Under Contract'
  | 'To nurture';

export type PidDealType = 'Residence Lead' | 'Enterprise Lead';

export type PidPaymentCollection = 'Upfront' | 'Straight Deduction' | 'EMI';

export type Pid = {
  id: string;
  type: PidType;
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
  overheads_deadline: string;
  merchant_id: string;
  deal_stage: PidDealStage;

  // --- Lead stage fields ---
  ppid?: string;
  date_added?: string;
  units_count?: number;
  deal_type?: PidDealType;
  apartment_count?: number;
  property_type_lead?: string;
  furnishing_lead?: string;
  expected_rent?: number;
  google_map_location_lead?: string;
  exploratory_visit_score?: number;
  potential_report?: string;

  // --- Active: property details ---
  parking_number?: string;
  water_source?: string;
  restrictions?: string;
  furniture_movement?: string;
  ll_extra_clauses?: string;

  // --- Fixture costs ---
  final_approved_amt?: number;
  final_invoice?: string;
  payment_collection?: PidPaymentCollection;
  emi_period?: number;
  opex_collections?: number;

  // --- Building context ---
  prop_mgmt_app: string;
  rules_regulations: string;
  garbage_disposal: string;
  timing_restrictions: string;
  move_in_formalities: string;
  move_out_formalities: string;
  move_in_out_formalities?: string;

  // --- Payment deadlines ---
  // rent_deadline and overheads_deadline already declared above

  // --- Churned fields ---
  deposit_refunded: boolean | null;
  exit_cost_opx: number | null;

  history: HistoryEntry[];
};

export type PidFilters = {
  type?: PidType;
  deal_stage?: PidDealStage;
  cluster?: string;
  deal_owner?: string;
  search?: string;
};
