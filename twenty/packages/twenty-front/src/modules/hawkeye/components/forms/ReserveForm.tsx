import { useState, useCallback } from 'react';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const bedTypeOptions = [
  'Single', 'Double', 'Triple',
].map((v) => ({ value: v, label: v }));

const occupancyTypeOptions = [
  'Single', 'Sharing', 'Family',
].map((v) => ({ value: v, label: v }));

type ReserveFormData = {
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  pid: string;
  rid: string;
  bed_type: string;
  occupancy_type: string;
  check_in_date: string;
  duration_months: string;
  monthly_rent: string;
  security_deposit: string;
  token_amount: string;
  special_requests: string;
};

const emptyForm: ReserveFormData = {
  tenant_name: '',
  tenant_phone: '',
  tenant_email: '',
  pid: '',
  rid: '',
  bed_type: '',
  occupancy_type: '',
  check_in_date: '',
  duration_months: '',
  monthly_rent: '',
  security_deposit: '',
  token_amount: '',
  special_requests: '',
};

type ReserveFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ReserveFormData>) => void;
};

export const ReserveForm = ({
  isOpen,
  onClose,
  onSave,
}: ReserveFormProps) => {
  const [form, setForm] = useState<ReserveFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof ReserveFormData>(key: K) =>
      (value: ReserveFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        duration_months: form.duration_months,
        monthly_rent: form.monthly_rent,
        security_deposit: form.security_deposit,
        token_amount: form.token_amount,
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title="Reserve a Room"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Tenant Selection',
          children: (
            <>
              <HawkeyeFormField
                type="text"
                label="Tenant Name"
                value={form.tenant_name}
                onChange={set('tenant_name')}
                placeholder="Enter tenant name"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="tel"
                  label="Tenant Phone"
                  value={form.tenant_phone}
                  onChange={set('tenant_phone')}
                  placeholder="+91 9876543210"
                />
                <HawkeyeFormField
                  type="email"
                  label="Tenant Email"
                  value={form.tenant_email}
                  onChange={set('tenant_email')}
                  placeholder="email@example.com"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Room Selection',
          children: (
            <>
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
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Bed Type"
                  value={form.bed_type}
                  onChange={set('bed_type')}
                  options={bedTypeOptions}
                  placeholder="Select bed type"
                />
                <HawkeyeFormField
                  type="select"
                  label="Occupancy Type"
                  value={form.occupancy_type}
                  onChange={set('occupancy_type')}
                  options={occupancyTypeOptions}
                  placeholder="Select occupancy type"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Reservation Details',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="date"
                  label="Check-in Date"
                  value={form.check_in_date}
                  onChange={set('check_in_date')}
                />
                <HawkeyeFormField
                  type="number"
                  label="Duration (Months)"
                  value={form.duration_months}
                  onChange={set('duration_months')}
                  placeholder="12"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Monthly Rent (₹)"
                  value={form.monthly_rent}
                  onChange={set('monthly_rent')}
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
                label="Token Amount (₹)"
                value={form.token_amount}
                onChange={set('token_amount')}
                placeholder="5000"
              />
            </>
          ),
        },
        {
          title: 'Notes',
          children: (
            <HawkeyeFormField
              type="textarea"
              label="Special Requests"
              value={form.special_requests}
              onChange={set('special_requests')}
              placeholder="Any special requests or notes..."
            />
          ),
        },
      ]}
    />
  );
};
