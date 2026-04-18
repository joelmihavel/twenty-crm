import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_MAINTENANCE_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.CURRENCY, name: 'maintenanceAmount', label: 'Maintenance Amount', icon: 'IconCurrencyRupee', isNullable: true },
  { type: FieldMetadataType.TEXT, name: 'maintenanceCutoffDate', label: 'Maintenance Cutoff Date', icon: 'IconCalendar', isNullable: true, defaultValue: "''" },
  {
    type: FieldMetadataType.SELECT, name: 'maintenanceCycle', label: 'Maintenance Cycle', icon: 'IconRepeat',
    options: [
      { label: 'Monthly', value: 'MONTHLY', position: 0, color: 'blue' },
      { label: 'Quarterly', value: 'QUARTERLY', position: 1, color: 'green' },
      { label: 'Bi-Annually', value: 'BI_ANNUALLY', position: 2, color: 'yellow' },
      { label: 'Annually', value: 'ANNUALLY', position: 3, color: 'orange' },
    ],
  },
  { type: FieldMetadataType.BOOLEAN, name: 'maintenancePayToLl', label: 'Pay to LL', description: 'Whether maintenance is paid to the landlord', icon: 'IconCash', isNullable: true, defaultValue: false },
  { type: FieldMetadataType.BOOLEAN, name: 'maintenanceCollectTenant', label: 'Collect from Tenant', description: 'Whether maintenance is collected from tenant', icon: 'IconCash', isNullable: true, defaultValue: false },
];
