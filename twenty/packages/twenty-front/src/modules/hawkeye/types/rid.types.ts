import { type HistoryEntry } from './history.types';

export type RoomStatus =
  | 'Available'
  | 'Occupied'
  | 'Under Maintenance'
  | 'Blocked';

export type Rid = {
  id: string;
  pid: string;
  attached_bathroom: boolean;
  balcony: boolean;
  bed_type: string;
  ac: boolean;
  ac_type: string;
  study_table: boolean;
  base_rent: number;
  maintenance_fee: number;
  room_status: RoomStatus;
  current_contract_id: string;
  current_tenant_id: string;
  current_tenant_name: string;
  available_from: string;
  history: HistoryEntry[];
  occupancy_history: OccupancyRecord[];
};

export type OccupancyRecord = {
  id: string;
  tenant_id: string;
  tenant_name: string;
  contract_uid: string;
  rent: number;
  move_in: string;
  move_out: string | null;
  days: number | null;
};

export type RidFilters = {
  status?: RoomStatus;
  pid?: string;
  bed_type?: string;
  search?: string;
};
