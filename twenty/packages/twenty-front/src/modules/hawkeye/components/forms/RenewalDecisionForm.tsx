import { useState, useCallback } from 'react';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const decisionOptions = [
  'Renew', 'Negotiate', 'Terminate',
].map((v) => ({ value: v, label: v }));

type RenewalDecisionFormData = {
  contract_id: string;
  tenant_name: string;
  current_rent: string;
  contract_end_date: string;
  decision: string;
  new_rent_proposed: string;
  rent_escalation_percent: string;
  new_lock_in_months: string;
  new_notice_period_months: string;
  renewal_start_date: string;
  renewal_duration_months: string;
  special_conditions: string;
  approved_by: string;
  approval_notes: string;
};

const emptyForm: RenewalDecisionFormData = {
  contract_id: '',
  tenant_name: '',
  current_rent: '',
  contract_end_date: '',
  decision: '',
  new_rent_proposed: '',
  rent_escalation_percent: '',
  new_lock_in_months: '',
  new_notice_period_months: '',
  renewal_start_date: '',
  renewal_duration_months: '',
  special_conditions: '',
  approved_by: '',
  approval_notes: '',
};

type RenewalDecisionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<RenewalDecisionFormData>) => void;
};

export const RenewalDecisionForm = ({
  isOpen,
  onClose,
  onSave,
}: RenewalDecisionFormProps) => {
  const [form, setForm] = useState<RenewalDecisionFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof RenewalDecisionFormData>(key: K) =>
      (value: RenewalDecisionFormData[K]) =>
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
      title="Renewal Decision"
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
                  type="text"
                  label="Contract ID"
                  value={form.contract_id}
                  onChange={set('contract_id')}
                  required
                  placeholder="Enter contract ID"
                />
                <HawkeyeFormField
                  type="text"
                  label="Tenant Name"
                  value={form.tenant_name}
                  onChange={set('tenant_name')}
                  placeholder="Enter tenant name"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Current Rent (₹)"
                  value={form.current_rent}
                  onChange={set('current_rent')}
                  placeholder="15000"
                />
                <HawkeyeFormField
                  type="date"
                  label="Contract End Date"
                  value={form.contract_end_date}
                  onChange={set('contract_end_date')}
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Renewal Decision',
          children: (
            <>
              <HawkeyeFormField
                type="select"
                label="Decision"
                value={form.decision}
                onChange={set('decision')}
                options={decisionOptions}
                required
                placeholder="Select decision"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="New Rent Proposed (₹)"
                  value={form.new_rent_proposed}
                  onChange={set('new_rent_proposed')}
                  placeholder="16000"
                />
                <HawkeyeFormField
                  type="number"
                  label="Rent Escalation (%)"
                  value={form.rent_escalation_percent}
                  onChange={set('rent_escalation_percent')}
                  placeholder="5"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="New Lock-in (Months)"
                  value={form.new_lock_in_months}
                  onChange={set('new_lock_in_months')}
                  placeholder="6"
                />
                <HawkeyeFormField
                  type="number"
                  label="New Notice Period (Months)"
                  value={form.new_notice_period_months}
                  onChange={set('new_notice_period_months')}
                  placeholder="1"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Terms',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="date"
                  label="Renewal Start Date"
                  value={form.renewal_start_date}
                  onChange={set('renewal_start_date')}
                />
                <HawkeyeFormField
                  type="number"
                  label="Renewal Duration (Months)"
                  value={form.renewal_duration_months}
                  onChange={set('renewal_duration_months')}
                  placeholder="11"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="textarea"
                label="Special Conditions"
                value={form.special_conditions}
                onChange={set('special_conditions')}
                placeholder="Any special conditions or clauses..."
              />
            </>
          ),
        },
        {
          title: 'Approval',
          children: (
            <>
              <HawkeyeFormField
                type="text"
                label="Approved By"
                value={form.approved_by}
                onChange={set('approved_by')}
                placeholder="Approver name"
              />
              <HawkeyeFormField
                type="textarea"
                label="Approval Notes"
                value={form.approval_notes}
                onChange={set('approval_notes')}
                placeholder="Notes on approval decision..."
              />
            </>
          ),
        },
      ]}
    />
  );
};
