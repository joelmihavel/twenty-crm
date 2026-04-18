import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const VENDOR_COMMERCIALS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.SELECT,
    name: 'qualityTier',
    label: 'Quality Tier',
    description: 'Vendor quality classification tier',
    icon: 'IconStar',
    options: [
      { label: 'T1', value: 'T1', position: 0, color: 'green' },
      { label: 'T2', value: 'T2', position: 1, color: 'yellow' },
      { label: 'T3', value: 'T3', position: 2, color: 'red' },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    name: 'paymentTerms',
    label: 'Payment Terms',
    description: 'Payment terms agreed with the vendor',
    icon: 'IconCreditCard',
    isNullable: true,
    defaultValue: "''",
  },
  {
    type: FieldMetadataType.CURRENCY,
    name: 'minOrderValue',
    label: 'Min Order Value',
    description: 'Minimum order value for this vendor',
    icon: 'IconCurrencyRupee',
    isNullable: true,
  },
  {
    type: FieldMetadataType.RICH_TEXT,
    name: 'negotiationRemarks',
    label: 'Negotiation Remarks',
    description: 'Notes from price and terms negotiations',
    icon: 'IconNote',
    isNullable: true,
  },
];
