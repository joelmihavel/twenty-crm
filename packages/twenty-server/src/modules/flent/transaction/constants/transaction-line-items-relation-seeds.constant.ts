import { TRANSACTION_OBJECT_SEED } from 'src/modules/flent/transaction/constants/transaction-object-seed.constant';

export const TRANSACTION_LINE_ITEMS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: TRANSACTION_OBJECT_SEED.nameSingular,
    name: 'transactionLineItems',
    label: 'Line Items',
    icon: 'IconListDetails',
    targetObjectName: 'transactionLineItem',
    targetFieldLabel: 'Transaction',
    targetFieldIcon: 'IconReceipt',
  },
];
