import { TRANSACTION_OBJECT_SEED } from 'src/modules/flent/transaction/constants/transaction-object-seed.constant';

export const TRANSACTION_CLASSIFICATION_RELATION_SEEDS: {
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
    name: 'transactionClassifications',
    label: 'Classifications',
    icon: 'IconTags',
    targetObjectName: 'transactionClassification',
    targetFieldLabel: 'Transaction',
    targetFieldIcon: 'IconReceipt',
  },
];
