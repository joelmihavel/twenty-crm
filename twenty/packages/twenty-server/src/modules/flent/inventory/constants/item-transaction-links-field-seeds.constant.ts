import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const ITEM_TRANSACTION_LINKS_FIELD_SEEDS: FieldMetadataSeed[] = [
  {
    type: FieldMetadataType.TEXT,
    label: 'Bill Document ID',
    name: 'billDocumentId',
    icon: 'IconFileInvoice',
    description: 'Reference to the external billing document',
    isNullable: true,
  },
];
