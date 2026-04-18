import { type HistoryEntry, type ItemState, type LocationRecord } from './history.types';

export type Item = {
  id: string;
  item_code: string;
  fsin_code: string;
  product_name: string;
  serial_no: number;
  unit_price: number;
  gst_percent: number;
  lock: boolean;
  location: string;
  state: ItemState;
  state_time: string;
  created_at: string;
  qa_flag: string;
  bill_document_id: string;
  purchase_txn_id: string | null;
  total_repair_cost: number;
  repair_ticket_count: number;
  operational_months: number;
  location_history: LocationRecord[];
  history: HistoryEntry[];
};

export type ItemFilters = {
  state?: ItemState;
  fsin_code?: string;
  location?: string;
  search?: string;
};
