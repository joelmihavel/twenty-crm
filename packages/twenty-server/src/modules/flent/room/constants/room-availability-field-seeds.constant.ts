import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ROOM_AVAILABILITY_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT, name: 'roomStatus', label: 'Room Status', icon: 'IconCircleCheck',
    options: [
      { label: 'Available', value: 'AVAILABLE', position: 0, color: 'green' },
      { label: 'Occupied', value: 'OCCUPIED', position: 1, color: 'blue' },
      { label: 'Under Maintenance', value: 'UNDER_MAINTENANCE', position: 2, color: 'yellow' },
      { label: 'Blocked', value: 'BLOCKED', position: 3, color: 'red' },
    ],
  },
  { type: FieldMetadataType.TEXT, name: 'currentTenantName', label: 'Current Tenant Name', icon: 'IconUser', isNullable: true, defaultValue: "''" },
  { type: FieldMetadataType.DATE, name: 'availableFrom', label: 'Available From', icon: 'IconCalendar', isNullable: true },
];
