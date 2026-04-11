import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PROPERTY_CHURNED_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.BOOLEAN,
    name: 'depositRefunded',
    label: 'Deposit Refunded',
    description: 'Whether the security deposit has been refunded',
    icon: 'IconCash',
    isNullable: true,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'exitCostOpx',
    label: 'Exit Cost OPX',
    description: 'Operating expense costs incurred at exit',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'churnDate',
    label: 'Churn Date',
    description: 'Date the property was churned',
    icon: 'IconCalendar',
    isNullable: true,
  },
];
