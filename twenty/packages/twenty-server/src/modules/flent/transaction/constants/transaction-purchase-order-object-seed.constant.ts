import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_PURCHASE_ORDER_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transaction Purchase Orders',
  labelSingular: 'Transaction Purchase Order',
  namePlural: 'transactionPurchaseOrders',
  nameSingular: 'transactionPurchaseOrder',
  icon: 'IconShoppingCart',
  description:
    'PO-specific fields: PO number, vendor reference, line item totals, GST, advance/remaining split, invoice, and status',
  skipNameField: true,
};
