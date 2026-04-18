import { type HistoryEntry } from './history.types';

export type TicketPipeline = 'Tenant' | 'Landlord';

export type TicketStatus =
  | 'New Request'
  | 'Waiting on Customer'
  | 'Waiting on Vendor'
  | 'Blocked'
  | 'Waiting for Payment'
  | 'Ready for Closure'
  | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type CategoryPhase = 'Pre Move-In' | 'Gestation' | 'Active';

export type TicketFlag = 'Reasonable' | 'Not Reasonable' | 'Subjective';

export type Ticket = {
  id: string;
  pipeline: TicketPipeline;
  ticket_name: string;
  ticket_description: string;
  ticket_owner: string;
  pid: string;
  rid: string;
  tenant_id: string;
  tenant_name: string;
  create_date: string;
  ticket_category: string;
  ticket_status: TicketStatus;
  priority: TicketPriority;
  assigned_vendor: string;
  assigned_vendor_id: string;
  total_cost_net: number;

  // Categorisation
  category_phase?: CategoryPhase;
  time_slot?: string;
  ticket_flag?: TicketFlag;
  flag_notes?: string;

  // Execution
  collected_from_tenant?: number;
  collected_from_merchant?: number;
  vendor_group_chat_id?: string;
  related_tickets?: string;

  // SLA & Feedback
  tenant_rating: number | null;
  first_response_mins?: number;
  time_to_first_rep_assignment?: number;
  time_to_first_response_sla_hours?: number;
  time_to_close_hours?: number;
  csat_feedback?: string;
  csat_response?: string;

  resolution_notes: string;
  transaction_id: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  history: HistoryEntry[];
};

export type TicketFilters = {
  pipeline?: TicketPipeline;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string;
  pid?: string;
  search?: string;
};
