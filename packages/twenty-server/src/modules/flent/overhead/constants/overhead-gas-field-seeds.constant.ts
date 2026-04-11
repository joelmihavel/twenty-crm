import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_GAS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'gasConnectionType', label: 'Gas Connection Type', icon: 'IconFlame',
    options: [
      { label: 'Piped', value: 'PIPED', position: 0, color: 'blue' },
      { label: 'Cylinder', value: 'CYLINDER', position: 1, color: 'green' },
      { label: 'None', value: 'NONE', position: 2, color: 'red' },
    ],
  },
  { type: FieldMetadataType.TEXT, name: 'gasAccountNo', label: 'Gas Account No', icon: 'IconHash', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'gasPassword', label: 'Gas Account Password', icon: 'IconLock', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'gasOwnership', label: 'Gas Ownership', icon: 'IconUser',
    options: [
      { label: 'Flent', value: 'FLENT', position: 0, color: 'blue' },
      { label: 'Landlord', value: 'LANDLORD', position: 1, color: 'green' },
      { label: 'Tenant', value: 'TENANT', position: 2, color: 'yellow' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'gasPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'gasCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
