import { type HistoryEntry } from './history.types';

export type FsinCategory =
  | 'Rug'
  | 'Bed'
  | 'AC'
  | 'Geyser'
  | 'Water Purifier'
  | 'Washing Machine'
  | 'Furniture'
  | 'Electronics'
  | 'Appliance';

export type Fsin = {
  id: string;
  fsin_code: string;
  vendor_code: string;
  item_name: string;
  category: FsinCategory;
  uom: string;
  reorder_point: number;
  annual_depreciation: number;
  perceived_value: number;
  dimensions: string;
  material: string;
  finish: string;
  color: string;
  style: string;
  packaging: string;
  lego: number;
  total_stock: number;
  in_properties: number;
  in_warehouse: number;
  under_repair: number;
  dead: number;
  history: HistoryEntry[];
};

export type FsinFilters = {
  category?: FsinCategory;
  vendor_code?: string;
  search?: string;
};
