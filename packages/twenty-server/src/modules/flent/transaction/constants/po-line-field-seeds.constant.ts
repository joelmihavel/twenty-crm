import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const PO_LINE_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    name: 'fsinCode',
    label: 'FSIN Code',
    description:
      'Flent Standard Identification Number (FK deferred to Phase 6)',
    icon: 'IconBarcode',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'itemName',
    label: 'Item Name',
    description: 'Name of the item being purchased',
    icon: 'IconPackage',
    isNullable: false,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'qty',
    label: 'Quantity',
    description: 'Number of units (CHECK >= 1)',
    icon: 'IconHash',
    isNullable: false,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'unitPrice',
    label: 'Unit Price',
    description: 'Price per unit',
    icon: 'IconCurrencyRupee',
    isNullable: false,
  },
  {
    type: FieldMetadataType.NUMBER,
    name: 'lineAmount',
    label: 'Line Amount',
    description:
      'Auto-calculated: qty * unit_price (maintained by database trigger)',
    icon: 'IconCalculator',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'notes',
    label: 'Notes',
    description: 'Additional notes for this line item',
    icon: 'IconNote',
    isNullable: true,
  },
];
