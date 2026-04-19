import { useState, useCallback } from 'react';
import { type Vendor } from '../../types/vendor.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const vendorTypeOptions = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Company', label: 'Company' },
  { value: 'Partnership', label: 'Partnership' },
];

const qualityTierOptions = [
  { value: 'Premium', label: 'Premium' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Budget', label: 'Budget' },
];

type VendorFormData = {
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  specialization: string;
  quality_tier: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  tat_in_days: string;
  min_order_value: string;
  gst_number: string;
  bank_name: string;
  bank_account_number: string;
  ifsc_code: string;
};

const emptyForm: VendorFormData = {
  vendor_code: '',
  vendor_name: '',
  vendor_type: 'Individual',
  specialization: '',
  quality_tier: 'Standard',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  tat_in_days: '',
  min_order_value: '',
  gst_number: '',
  bank_name: '',
  bank_account_number: '',
  ifsc_code: '',
};

const fromVendor = (v: Vendor): VendorFormData => ({
  vendor_code: v.vendor_code,
  vendor_name: v.vendor_name,
  vendor_type: v.vendor_type,
  specialization: v.specialization,
  quality_tier: v.quality_tier,
  contact_name: v.contact_name,
  phone: v.phone,
  email: v.email,
  address: v.address,
  city: v.city,
  state: '',
  pincode: '',
  tat_in_days: String(v.tat_in_days),
  min_order_value: String(v.min_order_value),
  gst_number: v.gst_number,
  bank_name: v.bank_name ?? '',
  bank_account_number: v.bank_account_number ?? '',
  ifsc_code: v.ifsc_code ?? '',
});

type VendorFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vendor>) => void;
  vendor?: Vendor;
};

export const VendorForm = ({
  isOpen,
  onClose,
  onSave,
  vendor,
}: VendorFormProps) => {
  const [form, setForm] = useState<VendorFormData>(
    vendor ? fromVendor(vendor) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof VendorFormData>(key: K) =>
      (value: VendorFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        tat_in_days: Number(form.tat_in_days) || 0,
        min_order_value: Number(form.min_order_value) || 0,
        vendor_type: form.vendor_type as Vendor['vendor_type'],
        quality_tier: form.quality_tier as Vendor['quality_tier'],
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={vendor ? 'Edit Vendor' : 'New Vendor'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Identification',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Vendor Code"
                  value={form.vendor_code}
                  onChange={set('vendor_code')}
                  required
                  placeholder="VND-001"
                />
                <HawkeyeFormField
                  type="text"
                  label="Vendor Name"
                  value={form.vendor_name}
                  onChange={set('vendor_name')}
                  required
                  placeholder="Vendor name"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Vendor Type"
                  value={form.vendor_type}
                  onChange={set('vendor_type')}
                  options={vendorTypeOptions}
                  required
                />
                <HawkeyeFormField
                  type="text"
                  label="Specialization"
                  value={form.specialization}
                  onChange={set('specialization')}
                  placeholder="Plumbing, Electrical, etc."
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Quality Tier"
                value={form.quality_tier}
                onChange={set('quality_tier')}
                options={qualityTierOptions}
              />
            </>
          ),
        },
        {
          title: 'Contact',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Contact Person"
                  value={form.contact_name}
                  onChange={set('contact_name')}
                  placeholder="Contact name"
                />
                <HawkeyeFormField
                  type="text"
                  label="Phone"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 9876543210"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Email"
                value={form.email}
                onChange={set('email')}
                placeholder="vendor@example.com"
              />
              <HawkeyeFormField
                type="text"
                label="Address"
                value={form.address}
                onChange={set('address')}
                placeholder="Full address"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="City"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="City"
                />
                <HawkeyeFormField
                  type="text"
                  label="State"
                  value={form.state}
                  onChange={set('state')}
                  placeholder="State"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Pincode"
                value={form.pincode}
                onChange={set('pincode')}
                placeholder="110001"
              />
            </>
          ),
        },
        {
          title: 'Commercials',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="TAT (Days)"
                  value={form.tat_in_days}
                  onChange={set('tat_in_days')}
                  placeholder="0"
                />
                <HawkeyeFormField
                  type="number"
                  label="Minimum Order Value (₹)"
                  value={form.min_order_value}
                  onChange={set('min_order_value')}
                  placeholder="0"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="GST Number"
                value={form.gst_number}
                onChange={set('gst_number')}
                placeholder="22AAAAA0000A1Z5"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Bank Name"
                  value={form.bank_name}
                  onChange={set('bank_name')}
                  placeholder="Bank name"
                />
                <HawkeyeFormField
                  type="text"
                  label="Bank Account"
                  value={form.bank_account_number}
                  onChange={set('bank_account_number')}
                  placeholder="Account number"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="IFSC Code"
                value={form.ifsc_code}
                onChange={set('ifsc_code')}
                placeholder="SBIN0001234"
              />
            </>
          ),
        },
      ]}
    />
  );
};
