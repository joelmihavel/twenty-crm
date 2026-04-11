import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_TICKET_DETAILS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.RICH_TEXT,
    label: 'Notes',
    name: 'notes',
    icon: 'IconNotes',
    description: 'Internal vendor notes on ticket work performed',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'First Response (Minutes)',
    name: 'firstResponseMins',
    icon: 'IconClockHour4',
    description: 'Minutes from vendor assignment to first vendor response',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Time to Close (Hours)',
    name: 'timeToCloseHours',
    icon: 'IconClockHour8',
    description:
      'Hours from vendor assignment to ticket resolution by vendor',
    isNullable: true,
  },
];
