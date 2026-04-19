import { useState, useCallback } from 'react';
import { type Overhead } from '../../types/overhead.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const categoryTypeOptions = [
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'WiFi', label: 'WiFi' },
  { value: 'Electricity', label: 'Electricity' },
  { value: 'DG (Generator)', label: 'DG (Generator)' },
  { value: 'Water', label: 'Water' },
  { value: 'Water Purifier', label: 'Water Purifier' },
  { value: 'Gas Connection', label: 'Gas Connection' },
  { value: 'Helper', label: 'Helper' },
];

const objectTypeOptions = [
  { value: 'property', label: 'Property' },
  { value: 'room', label: 'Room' },
];

const frequencyOptions = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Yearly', label: 'Yearly' },
  { value: 'One-time', label: 'One-time' },
];

const booleanOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

type OverheadFormData = {
  pid: string;
  category_type: string;
  object_type: string;
  frequency: string;
  start_date: string;
  end_date: string;
  amount: string;
  pay_to_landlord: string;
  collect_from_tenant: string;
};

const emptyForm: OverheadFormData = {
  pid: '',
  category_type: 'Maintenance',
  object_type: 'property',
  frequency: 'Monthly',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  amount: '',
  pay_to_landlord: 'false',
  collect_from_tenant: 'false',
};

const fromOverhead = (o: Overhead): OverheadFormData => ({
  pid: o.pid,
  category_type: o.category_type,
  object_type: o.object_type,
  frequency: o.frequency,
  start_date: o.start_date.split('T')[0],
  end_date: o.end_date ? o.end_date.split('T')[0] : '',
  amount: String(o.maintenance_amount ?? ''),
  pay_to_landlord: String(o.pay_to_landlord),
  collect_from_tenant: String(o.collect_from_tenant),
});

type OverheadFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Overhead>) => void;
  overhead?: Overhead;
};

export const OverheadForm = ({
  isOpen,
  onClose,
  onSave,
  overhead,
}: OverheadFormProps) => {
  const [form, setForm] = useState<OverheadFormData>(
    overhead ? fromOverhead(overhead) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof OverheadFormData>(key: K) =>
      (value: OverheadFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        category_type: form.category_type as Overhead['category_type'],
        object_type: form.object_type as Overhead['object_type'],
        pay_to_landlord: form.pay_to_landlord === 'true',
        collect_from_tenant: form.collect_from_tenant === 'true',
        maintenance_amount: Number(form.amount) || 0,
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={overhead ? 'Edit Overhead' : 'New Overhead'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Overhead Identity',
          children: (
            <>
              <HawkeyeFormField
                type="text"
                label="PID"
                value={form.pid}
                onChange={set('pid')}
                required
                placeholder="PID-09B"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Category Type"
                  value={form.category_type}
                  onChange={set('category_type')}
                  options={categoryTypeOptions}
                  required
                />
                <HawkeyeFormField
                  type="select"
                  label="Object Type"
                  value={form.object_type}
                  onChange={set('object_type')}
                  options={objectTypeOptions}
                  required
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Frequency"
                value={form.frequency}
                onChange={set('frequency')}
                options={frequencyOptions}
                required
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="date"
                  label="Start Date"
                  value={form.start_date}
                  onChange={set('start_date')}
                  required
                />
                <HawkeyeFormField
                  type="date"
                  label="End Date"
                  value={form.end_date}
                  onChange={set('end_date')}
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Billing',
          children: (
            <>
              <HawkeyeFormField
                type="number"
                label="Amount (₹)"
                value={form.amount}
                onChange={set('amount')}
                placeholder="0"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Pay to Landlord"
                  value={form.pay_to_landlord}
                  onChange={set('pay_to_landlord')}
                  options={booleanOptions}
                />
                <HawkeyeFormField
                  type="select"
                  label="Collect from Tenant"
                  value={form.collect_from_tenant}
                  onChange={set('collect_from_tenant')}
                  options={booleanOptions}
                />
              </StyledFieldRow>
            </>
          ),
        },
      ]}
    />
  );
};
