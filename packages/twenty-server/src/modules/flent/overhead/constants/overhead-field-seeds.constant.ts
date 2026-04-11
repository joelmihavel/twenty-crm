import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const OVERHEAD_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'categoryType', label: 'Category Type', icon: 'IconCategory',
    options: [
      { label: 'Maintenance', value: 'MAINTENANCE', position: 0, color: 'blue' },
      { label: 'WiFi', value: 'WIFI', position: 1, color: 'green' },
      { label: 'DG', value: 'DG', position: 2, color: 'orange' },
      { label: 'Water', value: 'WATER', position: 3, color: 'sky' },
      { label: 'Water Purifier', value: 'WATER_PURIFIER', position: 4, color: 'turquoise' },
      { label: 'Gas', value: 'GAS', position: 5, color: 'red' },
      { label: 'Electricity', value: 'ELECTRICITY', position: 6, color: 'yellow' },
      { label: 'Helper', value: 'HELPER', position: 7, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.SELECT, name: 'objectType', label: 'Object Type', icon: 'IconRepeat',
    options: [
      { label: 'Recurring', value: 'RECURRING', position: 0, color: 'blue' },
      { label: 'One-Time', value: 'ONE_TIME', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT, name: 'frequency', label: 'Frequency', icon: 'IconCalendarRepeat',
    options: [
      { label: 'Monthly', value: 'MONTHLY', position: 0, color: 'blue' },
      { label: 'Quarterly', value: 'QUARTERLY', position: 1, color: 'green' },
      { label: 'Bi-Annually', value: 'BI_ANNUALLY', position: 2, color: 'yellow' },
      { label: 'Annually', value: 'ANNUALLY', position: 3, color: 'orange' },
    ],
  },
  { type: FieldMetadataType.DATE, name: 'startDate', label: 'Start Date', icon: 'IconCalendar', isNullable: true },
  { type: FieldMetadataType.DATE, name: 'endDate', label: 'End Date', icon: 'IconCalendar', isNullable: true },
  { type: FieldMetadataType.LINKS, name: 'document', label: 'Document', icon: 'IconFile', isNullable: true },
];
