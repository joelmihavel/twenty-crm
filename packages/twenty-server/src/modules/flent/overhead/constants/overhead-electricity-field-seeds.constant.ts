import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_ELECTRICITY_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, name: 'electricityProvider', label: 'Electricity Provider', icon: 'IconBolt', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'electricityConnectionType', label: 'Connection Type', icon: 'IconPlug',
    options: [
      { label: 'Prepaid', value: 'PREPAID', position: 0, color: 'blue' },
      { label: 'Postpaid', value: 'POSTPAID', position: 1, color: 'green' },
    ],
  },
  { type: FieldMetadataType.TEXT, name: 'electricityAccountNo', label: 'Account Number', icon: 'IconHash', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'electricityPassword', label: 'Account Password', icon: 'IconLock', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'electricityOwnership', label: 'Ownership', icon: 'IconUser',
    options: [
      { label: 'Flent', value: 'FLENT', position: 0, color: 'blue' },
      { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'green' },
      { label: 'Tenant', value: 'TENANT', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'electricityPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'electricityCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
