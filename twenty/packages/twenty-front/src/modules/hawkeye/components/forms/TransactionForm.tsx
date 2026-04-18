import { useState, useCallback } from 'react';
import { type Transaction } from '../../types/transaction.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const creditDebitOptions = [
  { value: 'Credit', label: 'Credit' },
  { value: 'Debit', label: 'Debit' },
];

type TransactionFormData = {
  credit_debit: string;
  transaction_date: string;
  amount: string;
  purpose_category_1: string;
  purpose_category_2: string;
  from_party: string;
  from_party_type: string;
  to_party: string;
  to_party_type: string;
  payment_channel: string;
  payment_provider: string;
  contract_uid: string;
  pid: string;
  rid: string;
  line_item_description: string;
  created_by: string;
  authorised_by: string;
};

const emptyForm: TransactionFormData = {
  credit_debit: 'Credit',
  transaction_date: new Date().toISOString().split('T')[0],
  amount: '',
  purpose_category_1: '',
  purpose_category_2: '',
  from_party: '',
  from_party_type: '',
  to_party: '',
  to_party_type: '',
  payment_channel: '',
  payment_provider: '',
  contract_uid: '',
  pid: '',
  rid: '',
  line_item_description: '',
  created_by: '',
  authorised_by: '',
};

const fromTransaction = (t: Transaction): TransactionFormData => ({
  credit_debit: t.credit_debit,
  transaction_date: t.transaction_date.split('T')[0],
  amount: String(t.amount),
  purpose_category_1: t.purpose_category_1,
  purpose_category_2: t.purpose_category_2,
  from_party: t.from_party,
  from_party_type: t.from_party_type,
  to_party: t.to_party,
  to_party_type: t.to_party_type,
  payment_channel: t.payment_channel,
  payment_provider: t.payment_provider,
  contract_uid: t.contract_uid,
  pid: t.pid,
  rid: t.rid,
  line_item_description: t.line_item_description,
  created_by: t.created_by,
  authorised_by: t.authorised_by,
});

type TransactionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Transaction>) => void;
  transaction?: Transaction;
};

export const TransactionForm = ({
  isOpen,
  onClose,
  onSave,
  transaction,
}: TransactionFormProps) => {
  const [form, setForm] = useState<TransactionFormData>(
    transaction ? fromTransaction(transaction) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof TransactionFormData>(key: K) =>
      (value: TransactionFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        amount: Number(form.amount) || 0,
        credit_debit: form.credit_debit as Transaction['credit_debit'],
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={transaction ? 'Edit Transaction' : 'New Transaction'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Transaction Details',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Type"
                  value={form.credit_debit}
                  onChange={set('credit_debit')}
                  options={creditDebitOptions}
                  required
                />
                <HawkeyeFormField
                  type="number"
                  label="Amount (₹)"
                  value={form.amount}
                  onChange={set('amount')}
                  required
                  placeholder="0"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="date"
                label="Transaction Date"
                value={form.transaction_date}
                onChange={set('transaction_date')}
                required
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Purpose Category"
                  value={form.purpose_category_1}
                  onChange={set('purpose_category_1')}
                  required
                  placeholder="REVENUE, EXPENSE, etc."
                />
                <HawkeyeFormField
                  type="text"
                  label="Sub-category"
                  value={form.purpose_category_2}
                  onChange={set('purpose_category_2')}
                  placeholder="Token, Rent, Repair, etc."
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Description"
                value={form.line_item_description}
                onChange={set('line_item_description')}
                placeholder="Line item description"
              />
            </>
          ),
        },
        {
          title: 'Parties',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="From Party"
                  value={form.from_party}
                  onChange={set('from_party')}
                  placeholder="Name"
                />
                <HawkeyeFormField
                  type="text"
                  label="From Type"
                  value={form.from_party_type}
                  onChange={set('from_party_type')}
                  placeholder="Tenant, Flent, etc."
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="To Party"
                  value={form.to_party}
                  onChange={set('to_party')}
                  placeholder="Name"
                />
                <HawkeyeFormField
                  type="text"
                  label="To Type"
                  value={form.to_party_type}
                  onChange={set('to_party_type')}
                  placeholder="Flent, Vendor, etc."
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Payment',
          children: (
            <StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Payment Channel"
                value={form.payment_channel}
                onChange={set('payment_channel')}
                placeholder="UPI, NEFT, etc."
              />
              <HawkeyeFormField
                type="text"
                label="Payment Provider"
                value={form.payment_provider}
                onChange={set('payment_provider')}
                placeholder="Razorpayx, etc."
              />
            </StyledFieldRow>
          ),
        },
        {
          title: 'References',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Contract ID"
                  value={form.contract_uid}
                  onChange={set('contract_uid')}
                  placeholder="CNT-T-2025-001"
                />
                <HawkeyeFormField
                  type="text"
                  label="Property (PID)"
                  value={form.pid}
                  onChange={set('pid')}
                  placeholder="PID-09B"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Room (RID)"
                  value={form.rid}
                  onChange={set('rid')}
                  placeholder="09BR1"
                />
                <HawkeyeFormField
                  type="text"
                  label="Created By"
                  value={form.created_by}
                  onChange={set('created_by')}
                  placeholder="Creator name"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Authorised By"
                value={form.authorised_by}
                onChange={set('authorised_by')}
                placeholder="Authoriser name"
              />
            </>
          ),
        },
      ]}
    />
  );
};
