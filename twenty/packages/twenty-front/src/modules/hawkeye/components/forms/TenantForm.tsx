import { useState, useCallback } from 'react';
import { type Tenant, type TenantLifecycle, type QualificationStatus, type BgvStatus } from '../../types/tenant.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const lifecycleOptions = [
  'New Inquiry', 'Visit Scheduled', 'Visit Done', 'Negotiation',
  'Converted', 'Gestation', 'Moved In', 'Notice Period', 'Moved Out', 'Dead Lead',
].map((v) => ({ value: v, label: v }));

const qualificationOptions = [
  'Qualified', 'Disqualified', 'Pending',
].map((v) => ({ value: v, label: v }));

const bgvOptions = [
  'BGV Passed', 'BGV Failed', 'BGV Pending', 'Not Started',
].map((v) => ({ value: v, label: v }));

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

type TenantFormData = {
  first_name: string;
  last_name: string;
  email: string;
  mobile_phone: string;
  whatsapp_phone: string;
  gender: string;
  date_of_birth: string;
  occupation: string;
  employer_name: string;
  aadhaar_number: string;
  pan: string;
  first_inquiry_channel: string;
  preferred_occupancy_type: string;
  budget_max: string;
  tenant_lifecycle: string;
  qualification_status: string;
  bgv_status: string;
};

const emptyForm: TenantFormData = {
  first_name: '',
  last_name: '',
  email: '',
  mobile_phone: '',
  whatsapp_phone: '',
  gender: '',
  date_of_birth: '',
  occupation: '',
  employer_name: '',
  aadhaar_number: '',
  pan: '',
  first_inquiry_channel: '',
  preferred_occupancy_type: '',
  budget_max: '',
  tenant_lifecycle: 'New Inquiry',
  qualification_status: 'Pending',
  bgv_status: 'Not Started',
};

const fromTenant = (t: Tenant): TenantFormData => ({
  first_name: t.first_name,
  last_name: t.last_name,
  email: t.email,
  mobile_phone: t.mobile_phone,
  whatsapp_phone: t.whatsapp_phone,
  gender: t.gender,
  date_of_birth: t.date_of_birth,
  occupation: t.occupation,
  employer_name: t.employer_name,
  aadhaar_number: t.aadhaar_number,
  pan: t.pan,
  first_inquiry_channel: t.first_inquiry_channel,
  preferred_occupancy_type: t.preferred_occupancy_type,
  budget_max: String(t.budget_max),
  tenant_lifecycle: t.tenant_lifecycle,
  qualification_status: t.qualification_status,
  bgv_status: t.bgv_status,
});

type TenantFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Tenant>) => void;
  tenant?: Tenant;
};

export const TenantForm = ({
  isOpen,
  onClose,
  onSave,
  tenant,
}: TenantFormProps) => {
  const [form, setForm] = useState<TenantFormData>(
    tenant ? fromTenant(tenant) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof TenantFormData>(key: K) =>
      (value: TenantFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    // TODO: Replace with API call
    setTimeout(() => {
      onSave({
        ...form,
        budget_max: Number(form.budget_max) || 0,
        gender: form.gender as 'Male' | 'Female',
        tenant_lifecycle: form.tenant_lifecycle as TenantLifecycle,
        qualification_status: form.qualification_status as QualificationStatus,
        bgv_status: form.bgv_status as BgvStatus,
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={tenant ? 'Edit Tenant' : 'New Tenant'}
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
                  type="text"
                  label="First Name"
                  value={form.first_name}
                  onChange={set('first_name')}
                  required
                  placeholder="Enter first name"
                />
                <HawkeyeFormField
                  type="text"
                  label="Last Name"
                  value={form.last_name}
                  onChange={set('last_name')}
                  required
                  placeholder="Enter last name"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  placeholder="email@example.com"
                />
                <HawkeyeFormField
                  type="select"
                  label="Gender"
                  value={form.gender}
                  onChange={set('gender')}
                  options={genderOptions}
                  placeholder="Select gender"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="tel"
                  label="Mobile Phone"
                  value={form.mobile_phone}
                  onChange={set('mobile_phone')}
                  required
                  placeholder="+91 9876543210"
                />
                <HawkeyeFormField
                  type="tel"
                  label="WhatsApp Phone"
                  value={form.whatsapp_phone}
                  onChange={set('whatsapp_phone')}
                  placeholder="+91 9876543210"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="date"
                label="Date of Birth"
                value={form.date_of_birth}
                onChange={set('date_of_birth')}
              />
            </>
          ),
        },
        {
          title: 'Identity & Employment',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Aadhaar Number"
                  value={form.aadhaar_number}
                  onChange={set('aadhaar_number')}
                  placeholder="1234 5678 9012"
                />
                <HawkeyeFormField
                  type="text"
                  label="PAN"
                  value={form.pan}
                  onChange={set('pan')}
                  placeholder="ABCDE1234F"
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Occupation"
                  value={form.occupation}
                  onChange={set('occupation')}
                  placeholder="Software Engineer"
                />
                <HawkeyeFormField
                  type="text"
                  label="Employer"
                  value={form.employer_name}
                  onChange={set('employer_name')}
                  placeholder="Company name"
                />
              </StyledFieldRow>
            </>
          ),
        },
        {
          title: 'Preferences & Source',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Preferred Occupancy"
                  value={form.preferred_occupancy_type}
                  onChange={set('preferred_occupancy_type')}
                  placeholder="Single, Sharing, etc."
                />
                <HawkeyeFormField
                  type="number"
                  label="Budget Max (₹)"
                  value={form.budget_max}
                  onChange={set('budget_max')}
                  placeholder="25000"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Inquiry Channel"
                value={form.first_inquiry_channel}
                onChange={set('first_inquiry_channel')}
                placeholder="Website, Referral, etc."
              />
            </>
          ),
        },
        {
          title: 'Status',
          children: (
            <>
              <HawkeyeFormField
                type="select"
                label="Lifecycle Stage"
                value={form.tenant_lifecycle}
                onChange={set('tenant_lifecycle')}
                options={lifecycleOptions}
                required
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Qualification"
                  value={form.qualification_status}
                  onChange={set('qualification_status')}
                  options={qualificationOptions}
                />
                <HawkeyeFormField
                  type="select"
                  label="BGV Status"
                  value={form.bgv_status}
                  onChange={set('bgv_status')}
                  options={bgvOptions}
                />
              </StyledFieldRow>
            </>
          ),
        },
      ]}
    />
  );
};
