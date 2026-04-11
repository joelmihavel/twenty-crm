import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_STATE_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.BOOLEAN,
    label: 'Lock',
    name: 'lock',
    icon: 'IconLock',
    description:
      'Whether the item is locked (reserved for a specific property/operation)',
    isNullable: false,
    defaultValue: false,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Locked By PFS',
    name: 'lockByPfs',
    icon: 'IconUserCheck',
    description: 'PFS (Property Furnishing Specialist) who locked the item',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Locked At',
    name: 'lockedAt',
    icon: 'IconClockLock',
    description: 'Timestamp when the item was locked',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Location',
    name: 'location',
    icon: 'IconMapPin',
    description:
      'Current location: PID-RID for deployed items or WH-rack for warehouse items',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'State',
    name: 'state',
    icon: 'IconStatusChange',
    description: 'Current lifecycle state of the inventory item',
    isNullable: false,
    defaultValue: "'BUY'",
    options: [
      { label: 'BUY', value: 'BUY', position: 0, color: 'blue' },
      { label: 'WIB', value: 'WIB', position: 1, color: 'sky' },
      { label: 'WOB', value: 'WOB', position: 2, color: 'turquoise' },
      { label: 'PIB', value: 'PIB', position: 3, color: 'green' },
      { label: 'POB', value: 'POB', position: 4, color: 'orange' },
      { label: 'WORK', value: 'WORK', position: 5, color: 'purple' },
      { label: 'DEAD', value: 'DEAD', position: 6, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'State Time',
    name: 'stateTime',
    icon: 'IconClock',
    description: 'Timestamp when the item entered the current state',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Latest Snapshot Date',
    name: 'latestSnapshotDate',
    icon: 'IconCalendarEvent',
    description: 'Date of the most recent condition snapshot/photo',
    isNullable: true,
  },
  {
    type: FieldMetadataType.LINKS,
    label: 'Snapshot',
    name: 'snapshot',
    icon: 'IconCamera',
    description: 'URL to the latest condition snapshot image',
    isNullable: true,
  },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Utilised At',
    name: 'utilisedAt',
    icon: 'IconClockCheck',
    description: 'Timestamp when the item was first placed in a property',
    isNullable: true,
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'QA Flag',
    name: 'qaFlag',
    icon: 'IconShieldCheck',
    description: 'Quality assurance inspection result',
    isNullable: true,
    options: [
      { label: 'Yes', value: 'YES', position: 0, color: 'green' },
      { label: 'No', value: 'NO', position: 1, color: 'red' },
    ],
  },
];
