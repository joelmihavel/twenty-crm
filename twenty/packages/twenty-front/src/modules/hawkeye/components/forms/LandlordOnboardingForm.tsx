import { useState, useCallback } from 'react';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const prefixOptions = [
  'Mr.', 'Mrs.', 'Ms.', 'Dr.',
].map((v) => ({ value: v, label: v }));

const propertyTypeOptions = [
  'Apartment', 'Villa', 'Independent House', 'PG',
].map((v) => ({ value: v, label: v }));

const furnishingOptions = [
  'Fully Furnished', 'Semi Furnished', 'Unfurnished',
].map((v) => ({ value: v, label: v }));

type LandlordOnboardingFormData = {
  prefix: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_city: string;
  property_address: string;
  property_type: string;
  total_units: string;
  furnishing_status: string;
  expected_rent: string;
  lock_in_months: string;
  notice_period_months: string;
  maintenance_included: boolean;
  pan_number: string;
  bank_account_number: string;
  beneficiary_name: string;
  ifsc_code: string;
};

const emptyForm: LandlordOnboardingFormData = {
  prefix: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  current_city: '',
  property_address: '',
  property_type: '',
  total_units: '',
  furnishing_status: '',
  expected_rent: '',
  lock_in_months: '',
  notice_period_months: '',
  maintenance_included: false,
  pan_number: '',
  bank_account_number: '',
  beneficiary_name: '',
  ifsc_code: '',
};

type LandlordOnboardingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<LandlordOnboardingFormData>) => void;
};

export const LandlordOnboardingForm = ({
  isOpen,
  onClose,
  onSave,
}: LandlordOnboardingFormProps) => {
  const [form, setForm] = useState<LandlordOnboardingFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof LandlordOnboardingFormData>(key: K) =>
      (value: LandlordOnboardingFormData[K]) =>
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
      title="Onboard Landlord"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Personal Information',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Prefix"
                  value={form.prefix}
                  onChange={set('prefix')}
                  options={prefixOptions}
                  placeholder="Select prefix"
                />
                <HawkeyeFormField
                  type="text"
                  label="First Name"
                  value={form.first_name}
                  onChange={set('first_name')}
                  required
                  placeholder="Enter first name"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Last Name"
                  value={form.last_name}
                  onChange={set('last_name')}
                  required
                  placeholder="Enter last name"
                />
                <HawkeyeFormField
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  placeholder="email@example.com"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="tel"
                  label="Phone"
                  value={form.phone}
                  onChange={set('phone')}
                  required
                  placeholder="+91 9876543210"
                />
                <HawkeyeFormField
                  type="text"
                  label="Current City"
                  value={form.current_city}
                  onChange={set('current_city')}
                  placeholder="Enter city"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Property Details',
          children: (
            <>
              <HawkeyeFormField
                type="textarea"
                label="Property Address"
                value={form.property_address}
                onChange={set('property_address')}
                placeholder="Enter full property address"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Property Type"
                  value={form.property_type}
                  onChange={set('property_type')}
                  options={propertyTypeOptions}
                  placeholder="Select property type"
                />
                <HawkeyeFormField
                  type="number"
                  label="Total Units"
                  value={form.total_units}
                  onChange={set('total_units')}
                  placeholder="10"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Furnishing Status"
                value={form.furnishing_status}
                onChange={set('furnishing_status')}
                options={furnishingOptions}
                placeholder="Select furnishing status"
              />
            </>
          ),
        },
        {
          title: 'Commercial Terms',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Expected Rent (₹)"
                  value={form.expected_rent}
                  onChange={set('expected_rent')}
                  placeholder="25000"
                />
                <HawkeyeFormField
                  type="number"
                  label="Lock-in Period (Months)"
                  value={form.lock_in_months}
                  onChange={set('lock_in_months')}
                  placeholder="6"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Notice Period (Months)"
                  value={form.notice_period_months}
                  onChange={set('notice_period_months')}
                  placeholder="1"
                />
                <HawkeyeFormField
                  type="checkbox"
                  label="Maintenance Included"
                  checked={form.maintenance_included}
                  onChange={set('maintenance_included')}
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Banking & KYC',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="PAN Number"
                  value={form.pan_number}
                  onChange={set('pan_number')}
                  placeholder="ABCDE1234F"
                />
                <HawkeyeFormField
                  type="text"
                  label="Bank Account Number"
                  value={form.bank_account_number}
                  onChange={set('bank_account_number')}
                  placeholder="Enter account number"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Beneficiary Name"
                  value={form.beneficiary_name}
                  onChange={set('beneficiary_name')}
                  placeholder="Account holder name"
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
      ]}
    />
  );
};
