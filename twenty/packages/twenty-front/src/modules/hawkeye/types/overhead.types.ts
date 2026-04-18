import { type HistoryEntry } from './history.types';

export type OverheadCategoryType =
  | 'Maintenance'
  | 'WiFi'
  | 'DG (Generator)'
  | 'Water'
  | 'Water Purifier'
  | 'Gas Connection'
  | 'Electricity'
  | 'Helper';

export type OverheadObjectType = 'Recurring' | 'One-Time';

export type Overhead = {
  id: string;
  pid: string;
  category_type: OverheadCategoryType;
  object_type: OverheadObjectType;
  frequency: string;
  start_date: string;
  end_date: string;
  pay_to_landlord: boolean;
  collect_from_tenant: boolean;
  history: HistoryEntry[];

  // Base fields
  document?: string;

  // Maintenance fields
  maintenance_amount?: number;
  maintenance_cutoff_date?: string;
  maintenance_cycle?: string;
  maintenance_pay_to_ll?: boolean;
  maintenance_collect_tenant?: boolean;
  // Legacy maintenance fields (kept for backward compatibility)
  maintenance_cutoff?: string;
  maintenance_bank_account?: string;
  maintenance_ifsc?: string;

  // WiFi fields
  wifi_provider?: string;
  wifi_account_id?: string;
  wifi_start_date?: string;
  wifi_plan_duration?: number;
  wifi_end_date?: string;
  wifi_plan_cost?: number;
  wifi_ssid?: string;
  wifi_password?: string;
  wifi_ownership?: string;
  wifi_amount?: number;
  wifi_registered_number?: string;
  wifi_collect_tenant?: boolean;

  // Electricity fields
  electricity_provider?: string;
  electricity_connection_type?: string;
  electricity_account_no?: string;
  electricity_password?: string;
  electricity_ownership?: string;
  electricity_pay_to_ll?: boolean;
  electricity_collect_tenant?: boolean;
  // Legacy electricity fields (kept for backward compatibility)
  electricity_account_id?: string;

  // DG/Generator fields
  dg_brand_details?: string;
  dg_capacity_kva?: number;
  dg_maintenance_schedule?: string;
  dg_fuel_tank_capacity?: number;
  dg_refill_unit_litres?: number;
  dg_amount?: number;
  dg_pay_to_ll?: boolean;
  dg_collect_tenant?: boolean;

  // Water fields
  water_account_no?: string;
  water_password?: string;
  water_ownership?: string;
  water_payments_dues?: number;
  water_pay_to_ll?: boolean;
  water_collect_tenant?: boolean;

  // Water Purifier fields
  purifier_type?: string;
  purifier_brand?: string;
  purifier_serial_no?: string;
  purifier_cost?: number;
  purifier_ownership?: string;
  purifier_start_date?: string;
  purifier_duration?: number;
  purifier_pay_to_ll?: boolean;
  purifier_collect_tenant?: boolean;

  // Gas Connection fields
  gas_connection_type?: string;
  gas_account_no?: string;
  gas_password?: string;
  gas_ownership?: string;
  gas_pay_to_ll?: boolean;
  gas_collect_tenant?: boolean;

  // Helper fields
  helper_name?: string;
  helper_phone?: string;
  helper_role?: string;
  helper_salary?: number;
  helper_hours?: string;
  helper_responsibilities?: string;
  helper_pay_to_ll?: boolean;
  helper_collect_tenant?: boolean;
};

export type OverheadFilters = {
  category_type?: OverheadCategoryType;
  object_type?: OverheadObjectType;
  pid?: string;
  search?: string;
};
