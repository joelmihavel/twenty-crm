import { type HistoryEntry } from './history.types';

export type TenantLifecycle =
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

export type QualificationStatus =
  | 'Qualified'
  | 'Disqualified'
  | 'Pending';

export type BgvStatus =
  | 'BGV Passed'
  | 'BGV Failed'
  | 'BGV Pending'
  | 'Not Started';

export type Tenant = {
  id: string;
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
  twitter_url?: string;
  instagram_id?: string;
  aadhaar_front_image?: string;
  aadhaar_back_image?: string;
  pan_card_image?: string;
  create_date: string;
  first_inquiry_channel: string;
  source_drilldown_1: string;
  source_drilldown_2: string;
  wax_code: string;
  google_click_id: string;
  facebook_click_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term?: string;
  preferred_micromarkets: string[];
  preferred_occupancy_type: string;
  budget_max: number;
  preferred_furnished_type?: string;
  preferred_move_in_timeline?: string;
  gender_preferences?: string;
  food_preferences?: string;
  has_pet?: boolean;
  smoking_preferences?: string;
  custom_preference?: string;
  tenant_lifecycle: TenantLifecycle;
  current_pid: string;
  current_rid: string;
  qualification_status: QualificationStatus;
  disqualification_detail?: string;
  bgv_status: BgvStatus;
  total_visits_count: number;
  visits_cancelled?: number;
  visits_completed?: number;
  first_visit_date?: string;
  rids_visited?: string;
  feedback?: string;
  nps_score: number | null;
  nps_category: string;
  csat_score: number | null;
  offboarding_csat_score?: number;
  last_nps_date?: string;
  last_nps_comment?: string;
  visit_date: string | null;
  visit_outcome: string | null;
  token_amount: number | null;
  fmr_amount: number | null;
  sd_amount: number | null;
  contract_uid: string | null;
  history: HistoryEntry[];
};

export type TenantFilters = {
  lifecycle?: TenantLifecycle;
  qualification?: QualificationStatus;
  channel?: string;
  bgv_status?: BgvStatus;
  search?: string;
};
