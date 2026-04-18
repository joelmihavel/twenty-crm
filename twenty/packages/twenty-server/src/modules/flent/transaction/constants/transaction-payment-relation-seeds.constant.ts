import { TRANSACTION_OBJECT_SEED } from 'src/modules/flent/transaction/constants/transaction-object-seed.constant';

export const TRANSACTION_PAYMENT_RELATION_SEEDS: {
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
    name: 'transactionPayments',
    label: 'Payments',
    icon: 'IconCreditCard',
    targetObjectName: 'transactionPayment',
    targetFieldLabel: 'Transaction',
    targetFieldIcon: 'IconReceipt',
  },
];
