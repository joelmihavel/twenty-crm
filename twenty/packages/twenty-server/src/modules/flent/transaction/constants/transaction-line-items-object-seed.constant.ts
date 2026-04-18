import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_LINE_ITEMS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transaction Line Items',
  labelSingular: 'Transaction Line Item',
  namePlural: 'transactionLineItems',
  nameSingular: 'transactionLineItem',
  icon: 'IconListDetails',
  description:
    'Billing period, cost center allocation, and description for transaction entries',
  skipNameField: true,
};
