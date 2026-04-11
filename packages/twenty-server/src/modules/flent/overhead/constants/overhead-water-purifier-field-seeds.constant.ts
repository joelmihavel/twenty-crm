import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_WATER_PURIFIER_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, name: 'purifierSerialNo', label: 'Purifier Serial No', icon: 'IconHash', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'purifierSubscription', label: 'Purifier Subscription', icon: 'IconCalendar', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'purifierOwnership', label: 'Purifier Ownership', icon: 'IconUser',
    options: [
      { label: 'Flent', value: 'FLENT', position: 0, color: 'blue' },
      { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'green' },
      { label: 'Tenant', value: 'TENANT', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'purifierPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'purifierCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
