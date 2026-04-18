export type CreditDebit = 'Credit' | 'Debit';

export type Transaction = {
  id: string;
  credit_debit: CreditDebit;
  transaction_date: string;
  amount: number;
  purpose_category_1: string;
  purpose_category_2: string;
  from_party: string;
  from_party_type: string;
  from_party_id: string;
  to_party: string;
  to_party_type: string;
  to_party_id: string;
  payment_channel: string;
  payment_provider: string;
  gateway_reference_id: string;
  contract_uid: string;
  pid: string;
  rid: string;
  line_item_description: string;
  created_by: string;
  created_date: string;
  authorised_by: string;
  authorised_date: string;
  from_party_info?: string;
  line_item_date?: string;
  cost_revenue_center?: string;
  contact_id?: string;
  rid_link?: string;
};

export type TransactionFilters = {
  credit_debit?: CreditDebit;
  purpose_category_1?: string;
  payment_channel?: string;
  pid?: string;
  month?: string;
  search?: string;
};
