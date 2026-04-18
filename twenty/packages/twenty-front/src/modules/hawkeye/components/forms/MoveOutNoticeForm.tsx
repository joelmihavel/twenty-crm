import { useState, useCallback } from 'react';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const reasonOptions = [
  'Job Transfer', 'Higher Studies', 'Marriage', 'Dissatisfaction', 'Rent Increase', 'Other',
].map((v) => ({ value: v, label: v }));

const refundMethodOptions = [
  'Bank Transfer', 'UPI', 'Cheque',
].map((v) => ({ value: v, label: v }));

type MoveOutNoticeFormData = {
  tenant_name: string;
  contract_id: string;
  pid: string;
  rid: string;
  notice_date: string;
  expected_move_out_date: string;
  reason: string;
  reason_details: string;
  refund_method: string;
  bank_account: string;
  ifsc_code: string;
  furniture_intact: boolean;
  keys_returned: boolean;
  dues_cleared: boolean;
  room_cleaned: boolean;
};

const emptyForm: MoveOutNoticeFormData = {
  tenant_name: '',
  contract_id: '',
  pid: '',
  rid: '',
  notice_date: '',
  expected_move_out_date: '',
  reason: '',
  reason_details: '',
  refund_method: '',
  bank_account: '',
  ifsc_code: '',
  furniture_intact: false,
  keys_returned: false,
  dues_cleared: false,
  room_cleaned: false,
};

type MoveOutNoticeFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MoveOutNoticeFormData>) => void;
};

export const MoveOutNoticeForm = ({
  isOpen,
  onClose,
  onSave,
}: MoveOutNoticeFormProps) => {
  const [form, setForm] = useState<MoveOutNoticeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof MoveOutNoticeFormData>(key: K) =>
      (value: MoveOutNoticeFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...form });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title="Move-out Notice"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Tenant Details',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Tenant Name"
                  value={form.tenant_name}
                  onChange={set('tenant_name')}
                  required
                  placeholder="Enter tenant name"
                />
                <HawkeyeFormField
                  type="text"
                  label="Contract ID"
                  value={form.contract_id}
                  onChange={set('contract_id')}
                  required
                  placeholder="Enter contract ID"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Property ID (PID)"
                  value={form.pid}
                  onChange={set('pid')}
                  placeholder="Enter PID"
                />
                <HawkeyeFormField
                  type="text"
                  label="Room ID (RID)"
                  value={form.rid}
                  onChange={set('rid')}
                  placeholder="Enter RID"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Move-out Details',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="date"
                  label="Notice Date"
                  value={form.notice_date}
                  onChange={set('notice_date')}
                  required
                />
                <HawkeyeFormField
                  type="date"
                  label="Expected Move-out Date"
                  value={form.expected_move_out_date}
                  onChange={set('expected_move_out_date')}
                  required
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Reason"
                value={form.reason}
                onChange={set('reason')}
                options={reasonOptions}
                placeholder="Select reason"
              />
              <HawkeyeFormField
                type="textarea"
                label="Reason Details"
                value={form.reason_details}
                onChange={set('reason_details')}
                placeholder="Provide additional details..."
              />
            </>
          ),
        },
        {
          title: 'Settlement Preferences',
          children: (
            <>
              <HawkeyeFormField
                type="select"
                label="Refund Method"
                value={form.refund_method}
                onChange={set('refund_method')}
                options={refundMethodOptions}
                placeholder="Select refund method"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Bank Account"
                  value={form.bank_account}
                  onChange={set('bank_account')}
                  placeholder="Enter account number"
                />
                <HawkeyeFormField
                  type="text"
                  label="IFSC Code"
                  value={form.ifsc_code}
                  onChange={set('ifsc_code')}
                  placeholder="SBIN0001234"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Checklist',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="checkbox"
                  label="Furniture Intact"
                  checked={form.furniture_intact}
                  onChange={set('furniture_intact')}
                />
                <HawkeyeFormField
                  type="checkbox"
                  label="Keys Returned"
                  checked={form.keys_returned}
                  onChange={set('keys_returned')}
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="checkbox"
                  label="Dues Cleared"
                  checked={form.dues_cleared}
                  onChange={set('dues_cleared')}
                />
                <HawkeyeFormField
                  type="checkbox"
                  label="Room Cleaned"
                  checked={form.room_cleaned}
                  onChange={set('room_cleaned')}
                />
              </StyledFieldRow>
            </>
          ),
        },
      ]}
    />
  );
};
