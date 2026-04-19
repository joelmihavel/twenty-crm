import { useState, useCallback } from 'react';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const typeOptions = [
  { value: 'Purchase Order', label: 'Purchase Order' },
  { value: 'Payment Request', label: 'Payment Request' },
  { value: 'Vendor Invoice', label: 'Vendor Invoice' },
];

const urgencyOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

type PoApprovalFormData = {
  type: string;
  title: string;
  urgency: string;
  vendor_name: string;
  pid: string;
  requester: string;
  amount: string;
  notes: string;
};

const emptyForm: PoApprovalFormData = {
  type: 'Purchase Order',
  title: '',
  urgency: 'Medium',
  vendor_name: '',
  pid: '',
  requester: '',
  amount: '',
  notes: '',
};

type PoApprovalFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
};

export const PoApprovalForm = ({
  isOpen,
  onClose,
  onSave,
}: PoApprovalFormProps) => {
  const [form, setForm] = useState<PoApprovalFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof PoApprovalFormData>(key: K) =>
      (value: PoApprovalFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        amount: Number(form.amount) || 0,
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title="New Approval Request"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Request Details',
          children: (
            <>
              <HawkeyeFormField
                type="select"
                label="Type"
                value={form.type}
                onChange={set('type')}
                options={typeOptions}
              />
              <HawkeyeFormField
                type="text"
                label="Title"
                value={form.title}
                onChange={set('title')}
                required
                placeholder="Short description"
              />
              <HawkeyeFormField
                type="select"
                label="Urgency"
                value={form.urgency}
                onChange={set('urgency')}
                options={urgencyOptions}
              />
            </>
          ),
        },
        {
          title: 'Vendor & Property',
          children: (
            <>
              <HawkeyeFormField
                type="text"
                label="Vendor Name"
                value={form.vendor_name}
                onChange={set('vendor_name')}
                required
                placeholder="Vendor name"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="PID"
                  value={form.pid}
                  onChange={set('pid')}
                  required
                  placeholder="Property ID"
                />
                <HawkeyeFormField
                  type="text"
                  label="Requester"
                  value={form.requester}
                  onChange={set('requester')}
                  required
                  placeholder="Requester name"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Financial',
          children: (
            <>
              <HawkeyeFormField
                type="number"
                label="Amount (₹)"
                value={form.amount}
                onChange={set('amount')}
                required
                placeholder="0"
              />
              <HawkeyeFormField
                type="text"
                label="Notes"
                value={form.notes}
                onChange={set('notes')}
                placeholder="Additional context"
              />
            </>
          ),
        },
      ]}
    />
  );
};
