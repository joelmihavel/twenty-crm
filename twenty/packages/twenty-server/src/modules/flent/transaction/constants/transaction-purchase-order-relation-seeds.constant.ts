import { TRANSACTION_OBJECT_SEED } from 'src/modules/flent/transaction/constants/transaction-object-seed.constant';
import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const TRANSACTION_PURCHASE_ORDER_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  // Relation: Transaction -> TransactionPurchaseOrder
  {
    sourceObjectName: TRANSACTION_OBJECT_SEED.nameSingular,
    name: 'transactionPurchaseOrders',
    label: 'Purchase Orders',
    icon: 'IconShoppingCart',
    targetObjectName: 'transactionPurchaseOrder',
    targetFieldLabel: 'Transaction',
    targetFieldIcon: 'IconReceipt',
  },
  // Relation: Vendor -> TransactionPurchaseOrder
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'transactionPurchaseOrders',
    label: 'Purchase Orders',
    icon: 'IconShoppingCart',
    targetObjectName: 'transactionPurchaseOrder',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
