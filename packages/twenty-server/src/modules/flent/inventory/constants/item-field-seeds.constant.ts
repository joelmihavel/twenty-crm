import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Item Code',
    name: 'itemCode',
    icon: 'IconQrcode',
    description: 'Unique identifier for this individual inventory unit',
    isNullable: false,
    isUnique: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'Serial No',
    name: 'serialNo',
    icon: 'IconHash',
    description: 'Sequential serial number within the FSIN group',
    isNullable: true,
  },
  {
    type: FieldMetadataType.CURRENCY,
    label: 'Unit Price',
    name: 'unitPrice',
    icon: 'IconCurrencyRupee',
    description:
      'Purchase price per unit (immutable, copied from PO line at creation)',
    isNullable: true,
    isUIReadOnly: true,
  },
  {
    type: FieldMetadataType.NUMBER,
    label: 'GST Percent',
    name: 'gstPercent',
    icon: 'IconPercentage',
    description: 'GST percentage (immutable, copied from PO at creation)',
    isNullable: true,
    isUIReadOnly: true,
  },
];
