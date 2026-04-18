import { useState, useCallback } from 'react';
import { type Contract, type AgreementLifecycle, type PaymentLifecycle } from '../../types/contract.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const contractTypeOptions = [
  { value: 'Tenant', label: 'Tenant' },
  { value: 'Merchant', label: 'Merchant' },
];

const agreementOptions = [
  'Draft', 'Sent for Signing', 'Signed', 'Active', 'Expired', 'Terminated',
].map((v) => ({ value: v, label: v }));

const paymentOptions = [
  'Token Paid', 'FMR Paid', 'SD Paid', 'All Payments Done', 'Pending', 'Partially Paid',
].map((v) => ({ value: v, label: v }));

type ContractFormData = {
  contract_type: string;
  party_name: string;
  pid: string;
  rid: string;
  contract_start_date: string;
  contract_end_date: string;
  service_term: string;
  lock_in_duration: string;
  notice_period: string;
  monthly_license_fee: string;
  security_deposit: string;
  total_retail_rent: string;
  agreement_lifecycle: string;
  payment_lifecycle: string;
};

const emptyForm: ContractFormData = {
  contract_type: 'Tenant',
  party_name: '',
  pid: '',
  rid: '',
  contract_start_date: '',
  contract_end_date: '',
  service_term: '11',
  lock_in_duration: '6',
  notice_period: '1',
  monthly_license_fee: '',
  security_deposit: '',
  total_retail_rent: '',
  agreement_lifecycle: 'Draft',
  payment_lifecycle: 'Pending',
};

const fromContract = (c: Contract): ContractFormData => ({
  contract_type: c.contract_type,
  party_name: c.party_name,
  pid: c.pid,
  rid: c.rid,
  contract_start_date: c.contract_start_date.split('T')[0],
  contract_end_date: c.contract_end_date.split('T')[0],
  service_term: String(c.service_term),
  lock_in_duration: String(c.lock_in_duration),
  notice_period: String(c.notice_period),
  monthly_license_fee: String(c.monthly_license_fee),
  security_deposit: String(c.security_deposit),
  total_retail_rent: String(c.total_retail_rent),
  agreement_lifecycle: c.agreement_lifecycle,
  payment_lifecycle: c.payment_lifecycle,
});

type ContractFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Contract>) => void;
  contract?: Contract;
};

export const ContractForm = ({
  isOpen,
  onClose,
  onSave,
  contract,
}: ContractFormProps) => {
  const [form, setForm] = useState<ContractFormData>(
    contract ? fromContract(contract) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof ContractFormData>(key: K) =>
      (value: ContractFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        contract_type: form.contract_type as Contract['contract_type'],
        service_term: Number(form.service_term) || 0,
        lock_in_duration: Number(form.lock_in_duration) || 0,
        notice_period: Number(form.notice_period) || 0,
        monthly_license_fee: Number(form.monthly_license_fee) || 0,
        security_deposit: Number(form.security_deposit) || 0,
        total_retail_rent: Number(form.total_retail_rent) || 0,
        agreement_lifecycle: form.agreement_lifecycle as AgreementLifecycle,
        payment_lifecycle: form.payment_lifecycle as PaymentLifecycle,
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={contract ? 'Edit Contract' : 'New Contract'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Contract Info',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Contract Type"
                  value={form.contract_type}
                  onChange={set('contract_type')}
                  options={contractTypeOptions}
                  required
                />
                <HawkeyeFormField
                  type="text"
                  label="Party Name"
                  value={form.party_name}
                  onChange={set('party_name')}
                  required
                  placeholder="Tenant or merchant name"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Property (PID)"
                  value={form.pid}
                  onChange={set('pid')}
                  required
                  placeholder="PID-09B"
                />
                <HawkeyeFormField
                  type="text"
                  label="Room (RID)"
                  value={form.rid}
                  onChange={set('rid')}
                  placeholder="09BR1"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Duration',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="date"
                  label="Start Date"
                  value={form.contract_start_date}
                  onChange={set('contract_start_date')}
                  required
                />
                <HawkeyeFormField
                  type="date"
                  label="End Date"
                  value={form.contract_end_date}
                  onChange={set('contract_end_date')}
                  required
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Service Term (months)"
                  value={form.service_term}
                  onChange={set('service_term')}
                />
                <HawkeyeFormField
                  type="number"
                  label="Lock-in (months)"
                  value={form.lock_in_duration}
                  onChange={set('lock_in_duration')}
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="number"
                label="Notice Period (months)"
                value={form.notice_period}
                onChange={set('notice_period')}
              />
            </>
          ),
        },
        {
          title: 'Financials',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Monthly Rent (₹)"
                  value={form.monthly_license_fee}
                  onChange={set('monthly_license_fee')}
                  required
                  placeholder="15000"
                />
                <HawkeyeFormField
                  type="number"
                  label="Security Deposit (₹)"
                  value={form.security_deposit}
                  onChange={set('security_deposit')}
                  placeholder="30000"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="number"
                label="Total Retail Rent (₹)"
                value={form.total_retail_rent}
                onChange={set('total_retail_rent')}
                placeholder="Total over contract term"
              />
            </>
          ),
        },
        {
          title: 'Status',
          children: (
            <StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Agreement Status"
                value={form.agreement_lifecycle}
                onChange={set('agreement_lifecycle')}
                options={agreementOptions}
                required
              />
              <HawkeyeFormField
                type="select"
                label="Payment Status"
                value={form.payment_lifecycle}
                onChange={set('payment_lifecycle')}
                options={paymentOptions}
                required
              />
            </StyledFieldRow>
          ),
        },
      ]}
    />
  );
};
