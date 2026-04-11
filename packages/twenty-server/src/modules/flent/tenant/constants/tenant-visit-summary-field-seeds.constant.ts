import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_VISIT_SUMMARY_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.NUMBER,
    name: 'totalVisitsCount',
    label: 'Total Visits Count',
    description: 'Total number of property visits',
    icon: 'IconHash',
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'visitsCancelled',
    label: 'Visits Cancelled',
    description: 'Number of cancelled visits',
    icon: 'IconX',
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'visitsCompleted',
    label: 'Visits Completed',
    description: 'Number of completed visits',
    icon: 'IconCheck',
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.DATE,
    name: 'firstVisitDate',
    label: 'First Visit Date',
    description: 'Date of the first property visit',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'ridsVisited',
    label: 'RIDs Visited',
    description: 'Comma-separated list of room IDs visited',
    icon: 'IconDoor',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'feedback',
    label: 'Feedback',
    description: 'Tenant feedback from property visits',
    icon: 'IconMessage',
    isNullable: true,
  },
];
