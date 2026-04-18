export type HistoryEntryType =
  | 'stage_change'
  | 'field_update'
  | 'linked_event'
  | 'note'
  | 'payment'
  | 'document'
  | 'assignment';

export type HistoryEntry = {
  id: string;
  timestamp: string;
  type: HistoryEntryType;
  actor: string;
  summary: string;
  detail?: string;
  linkedObject?: {
    type:
      | 'tenant'
      | 'merchant'
      | 'pid'
      | 'rid'
      | 'contract'
      | 'transaction'
      | 'ticket'
      | 'vendor'
      | 'item';
    id: string;
    label: string;
  };
  previousValue?: string;
  newValue?: string;
};

export type ItemState =
  | 'BUY'
  | 'WIB'
  | 'WOB'
  | 'PIB'
  | 'POB'
  | 'WORK'
  | 'DEAD';

export type LocationRecord = {
  id: string;
  from_date: string;
  to_date?: string;
  location: string;
  state: ItemState;
  tenant_id?: string;
  tenant_name?: string;
};
