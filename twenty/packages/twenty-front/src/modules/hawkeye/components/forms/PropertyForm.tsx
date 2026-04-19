import { useState, useCallback } from 'react';
import { type Pid } from '../../types/pid.types';
import { HawkeyeFormDrawer, StyledFieldRow } from '@/hawkeye/components/HawkeyeFormDrawer';
import { HawkeyeFormField } from '@/hawkeye/components/HawkeyeFormField';

const propertyTypeTagOptions = [
  { value: 'Studio', label: 'Studio' },
  { value: '1BHK', label: '1BHK' },
  { value: '2BHK', label: '2BHK' },
  { value: '3BHK', label: '3BHK' },
  { value: '4BHK', label: '4BHK' },
  { value: 'Villa', label: 'Villa' },
];

const furnishingOptions = [
  { value: 'Unfurnished', label: 'Unfurnished' },
  { value: 'Semi-Furnished', label: 'Semi-Furnished' },
  { value: 'Fully-Furnished', label: 'Fully-Furnished' },
];

const tierOptions = [
  { value: 'Tier 1', label: 'Tier 1' },
  { value: 'Tier 2', label: 'Tier 2' },
  { value: 'Tier 3', label: 'Tier 3' },
];

type PropertyFormData = {
  house_no: string;
  building_society: string;
  cluster: string;
  address: string;
  city: string;
  pincode: string;
  property_type: string;
  floor: string;
  furnishing_status: string;
  merchant_id: string;
  deal_owner: string;
  tier: string;
  active_units_count: string;
  total_bed_count: string;
  parking_number: string;
};

const emptyForm: PropertyFormData = {
  house_no: '',
  building_society: '',
  cluster: '',
  address: '',
  city: '',
  pincode: '',
  property_type: 'Studio',
  floor: '',
  furnishing_status: 'Unfurnished',
  merchant_id: '',
  deal_owner: '',
  tier: 'Tier 1',
  active_units_count: '',
  total_bed_count: '',
  parking_number: '',
};

const fromPid = (p: Pid): PropertyFormData => ({
  house_no: p.house_no,
  building_society: p.building_society,
  cluster: p.active_cluster,
  address: p.address,
  city: '',
  pincode: '',
  property_type: p.property_type,
  floor: p.floor,
  furnishing_status: p.furnishing_status,
  merchant_id: p.merchant_id,
  deal_owner: p.deal_owner,
  tier: p.tier,
  active_units_count: String(p.active_units_count),
  total_bed_count: String(p.units_count ?? 0),
  parking_number: p.parking_number ?? '',
});

type PropertyFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Pid>) => void;
  property?: Pid;
};

export const PropertyForm = ({
  isOpen,
  onClose,
  onSave,
  property,
}: PropertyFormProps) => {
  const [form, setForm] = useState<PropertyFormData>(
    property ? fromPid(property) : emptyForm,
  );
  const [saving, setSaving] = useState(false);

  const set = useCallback(
    <K extends keyof PropertyFormData>(key: K) =>
      (value: PropertyFormData[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSave = useCallback(() => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...form,
        active_units_count: Number(form.active_units_count) || 0,
        active_cluster: form.cluster,
        property_type: form.property_type,
        furnishing_status: form.furnishing_status,
      });
      setSaving(false);
      onClose();
    }, 300);
  }, [form, onSave, onClose]);

  return (
    <HawkeyeFormDrawer
      isOpen={isOpen}
      title={property ? 'Edit Property' : 'New Property'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      sections={[
        {
          title: 'Property Details',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="House No."
                  value={form.house_no}
                  onChange={set('house_no')}
                  required
                  placeholder="101"
                />
                <HawkeyeFormField
                  type="text"
                  label="Building / Society"
                  value={form.building_society}
                  onChange={set('building_society')}
                  required
                  placeholder="Green Acres Apt."
                />
              </StyledFieldRow>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Cluster"
                  value={form.cluster}
                  onChange={set('cluster')}
                  placeholder="HSR Layout"
                />
                <HawkeyeFormField
                  type="text"
                  label="City"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Bangalore"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Address"
                value={form.address}
                onChange={set('address')}
                placeholder="Full address"
              />
              <HawkeyeFormField
                type="text"
                label="Pincode"
                value={form.pincode}
                onChange={set('pincode')}
                placeholder="560102"
              />
              <StyledFieldRow>
                <HawkeyeFormField
                  type="select"
                  label="Property Type"
                  value={form.property_type}
                  onChange={set('property_type')}
                  options={propertyTypeTagOptions}
                  required
                />
                <HawkeyeFormField
                  type="text"
                  label="Floor"
                  value={form.floor}
                  onChange={set('floor')}
                  placeholder="3rd"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Furnishing"
                value={form.furnishing_status}
                onChange={set('furnishing_status')}
                options={furnishingOptions}
              />
            </>
          ),
        },
        {
          title: 'Ownership',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="text"
                  label="Merchant ID"
                  value={form.merchant_id}
                  onChange={set('merchant_id')}
                  placeholder="MER-001"
                />
                <HawkeyeFormField
                  type="text"
                  label="Deal Owner"
                  value={form.deal_owner}
                  onChange={set('deal_owner')}
                  placeholder="Owner name"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="select"
                label="Tier"
                value={form.tier}
                onChange={set('tier')}
                options={tierOptions}
              />
            </>
          ),
        },
        {
          title: 'Units',
          children: (
            <>
              <StyledFieldRow>
                <HawkeyeFormField
                  type="number"
                  label="Active Units Count"
                  value={form.active_units_count}
                  onChange={set('active_units_count')}
                  placeholder="0"
                />
                <HawkeyeFormField
                  type="number"
                  label="Total Bed Count"
                  value={form.total_bed_count}
                  onChange={set('total_bed_count')}
                  placeholder="0"
                />
              </StyledFieldRow>
              <HawkeyeFormField
                type="text"
                label="Parking Number"
                value={form.parking_number}
                onChange={set('parking_number')}
                placeholder="P-12"
              />
            </>
          ),
        },
      ]}
    />
  );
};
