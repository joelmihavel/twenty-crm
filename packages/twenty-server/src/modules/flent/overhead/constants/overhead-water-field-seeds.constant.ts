import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_WATER_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, name: 'waterAccountNo', label: 'Water Account No', icon: 'IconHash', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'waterPassword', label: 'Water Account Password', icon: 'IconLock', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'waterOwnership', label: 'Water Ownership', icon: 'IconUser',
    options: [
      { label: 'Flent', value: 'FLENT', position: 0, color: 'blue' },
      { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'green' },
      { label: 'Tenant', value: 'TENANT', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.TEXT, name: 'waterPaymentsDues', label: 'Water Payments/Dues', icon: 'IconCash', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.BOOLEAN, name: 'waterPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'waterCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
