import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TENANT_QUALIFICATION_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'qualificationStatus',
    label: 'Qualification Status',
    description: 'Current qualification status of the tenant',
    icon: 'IconShieldCheck',
    options: [
      { label: 'Qualified', value: 'QUALIFIED', position: 0, color: 'green' },
      { label: 'Not Qualified', value: 'NOT_QUALIFIED', position: 1, color: 'red' },
      { label: 'Dead', value: 'DEAD', position: 2, color: 'red' },
      { label: 'Paused', value: 'PAUSED', position: 3, color: 'yellow' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'disqualificationReason',
    label: 'Disqualification Reason',
    description: 'Reason for disqualification if applicable',
    icon: 'IconAlertCircle',
    options: [
      { label: 'Budget', value: 'BUDGET', position: 0, color: 'yellow' },
      { label: 'Location', value: 'LOCATION', position: 1, color: 'blue' },
      { label: 'Availability', value: 'AVAILABILITY', position: 2, color: 'orange' },
      { label: 'No Response', value: 'NO_RESPONSE', position: 3, color: 'red' },
      { label: 'Chose Competitor', value: 'CHOSE_COMPETITOR', position: 4, color: 'purple' },
      { label: 'Life Event', value: 'LIFE_EVENT', position: 5, color: 'turquoise' },
      { label: 'Other', value: 'OTHER', position: 6, color: 'sky' },
    ],
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'disqualificationDetail',
    label: 'Disqualification Detail',
    description: 'Additional details about disqualification',
    icon: 'IconNote',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    name: 'bgvStatus',
    label: 'BGV Status',
    description: 'Background verification status',
    icon: 'IconSearch',
    options: [
      { label: 'Not Started', value: 'NOT_STARTED', position: 0, color: 'sky' },
      { label: 'In Progress', value: 'IN_PROGRESS', position: 1, color: 'yellow' },
      { label: 'Passed', value: 'PASSED', position: 2, color: 'green' },
      { label: 'Failed', value: 'FAILED', position: 3, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'bgvReport',
    label: 'BGV Report',
    description: 'Link to background verification report',
    icon: 'IconFile',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'bgvCompletedDate',
    label: 'BGV Completed Date',
    description: 'Date when background verification was completed',
    icon: 'IconCalendarCheck',
    isNullable: true,
  },
];
