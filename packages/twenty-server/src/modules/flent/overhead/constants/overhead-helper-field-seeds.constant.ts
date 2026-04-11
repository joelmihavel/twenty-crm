import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_HELPER_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, name: 'helperName', label: 'Helper Name', icon: 'IconUser', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.PHONES, name: 'helperPhone', label: 'Helper Phone', icon: 'IconPhone', isNullable: true },
  {
    type: FieldMetadataType.SELECT, name: 'helperRole', label: 'Helper Role', icon: 'IconBriefcase',
    options: [
      { label: 'Cook', value: 'COOK', position: 0, color: 'blue' },
      { label: 'Cleaner', value: 'CLEANER', position: 1, color: 'green' },
      { label: 'Gardener', value: 'GARDENER', position: 2, color: 'turquoise' },
      { label: 'Security', value: 'SECURITY', position: 3, color: 'orange' },
      { label: 'Driver', value: 'DRIVER', position: 4, color: 'purple' },
      { label: 'Other', value: 'OTHER', position: 5, color: 'sky' },
    ],
  },
  { type: FieldMetadataType.CURRENCY, name: 'helperSalary', label: 'Helper Salary', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.TEXT, name: 'helperHours', label: 'Helper Hours', icon: 'IconClock', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.TEXT, name: 'helperResponsibilities', label: 'Responsibilities', icon: 'IconChecklist', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.BOOLEAN, name: 'helperPayToLl', label: 'Pay to LL', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'helperCollectTenant', label: 'Collect from Tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
