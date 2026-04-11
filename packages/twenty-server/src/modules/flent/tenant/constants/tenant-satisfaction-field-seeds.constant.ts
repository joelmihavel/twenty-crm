import { FieldMetadataType, NumberDataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_SATISFACTION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.NUMBER,
    name: 'onboardingCsatScore',
    label: 'Onboarding CSAT Score',
    description: 'Customer satisfaction score from onboarding',
    icon: 'IconStar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'offboardingCsatScore',
    label: 'Offboarding CSAT Score',
    description: 'Customer satisfaction score from offboarding',
    icon: 'IconStar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.NUMBER,
    name: 'lastNpsScore',
    label: 'Last NPS Score',
    description: 'Most recent Net Promoter Score (0-10)',
    icon: 'IconChartBar',
    isNullable: true,
    settings: {
      dataType: NumberDataType.INT,
      type: 'number',
    },
  } as FieldMetadataDTO<FieldMetadataType.NUMBER>,
  {
    type: FieldMetadataType.DATE,
    name: 'lastNpsDate',
    label: 'Last NPS Date',
    description: 'Date of the most recent NPS survey',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'npsCategory',
    label: 'NPS Category',
    description: 'NPS category based on score',
    icon: 'IconCategory',
    options: [
      { label: 'Promoter', value: 'PROMOTER', position: 0, color: 'green' },
      { label: 'Passive', value: 'PASSIVE', position: 1, color: 'yellow' },
      { label: 'Detractor', value: 'DETRACTOR', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'lastNpsComment',
    label: 'Last NPS Comment',
    description: 'Comment from the most recent NPS survey',
    icon: 'IconMessage',
    isNullable: true,
  },
];
