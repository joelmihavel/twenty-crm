import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const TRANSACTION_LINE_ITEMS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.DATE,
    name: 'lineItemDate',
    label: 'Line Item Date',
    description: 'Billing period date',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'costRevenueCenter',
    label: 'Cost/Revenue Center',
    description: 'Cost center or revenue center name for allocation',
    icon: 'IconBuildingStore',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'lineItemDescription',
    label: 'Description',
    description: 'Rich text description of the line item entry',
    icon: 'IconAlignLeft',
    isNullable: true,
  },
];
