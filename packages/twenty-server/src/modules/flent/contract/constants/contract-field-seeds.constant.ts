import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const CONTRACT_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'contractType',
    label: 'Contract Type',
    description: 'Type of contract: L&L (Leave & License), Authorisation, or C&S (Caretaker & Service)',
    icon: 'IconCategory',
    isNullable: false,
    options: [
      { label: 'L&L', value: 'L_AND_L', position: 0, color: 'blue' },
      { label: 'Authorisation', value: 'AUTHORISATION', position: 1, color: 'green' },
      { label: 'C&S', value: 'C_AND_S', position: 2, color: 'purple' },
    ],
  },
  {
    type: FieldMetadataType.DATE,
    name: 'contractStartDate',
    label: 'Contract Start Date',
    description: 'Start date of the contract',
    icon: 'IconCalendar',
    isNullable: false,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'contractEndDate',
    label: 'Contract End Date',
    description: 'End date of the contract',
    icon: 'IconCalendarOff',
    isNullable: false,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'serviceTerm',
    label: 'Service Term',
    description: 'Duration of the contract in months',
    icon: 'IconClock',
    isNullable: false,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'lockInDuration',
    label: 'Lock-in Duration',
    description: 'Lock-in period in months',
    icon: 'IconLock',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE,
    name: 'lockInEndDate',
    label: 'Lock-in End Date',
    description: 'Auto-calculated: contract start date + lock-in duration months',
    icon: 'IconLockOpen',
    isNullable: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'noticePeriod',
    label: 'Notice Period',
    description: 'Notice period in days',
    icon: 'IconBell',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    name: 'agreementPdf',
    label: 'Agreement PDF',
    description: 'URL to the signed agreement document',
    icon: 'IconFileTypePdf',
    isNullable: true,
  },
];
