import { TRANSACTION_OBJECT_SEED } from 'src/modules/flent/transaction/constants/transaction-object-seed.constant';

export const PO_LINE_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  // Relation: Transaction -> PoLines (ONE_TO_MANY, true multi-row)
  {
    sourceObjectName: TRANSACTION_OBJECT_SEED.nameSingular,
    name: 'poLines',
    label: 'PO Lines',
    icon: 'IconListNumbers',
    targetObjectName: 'poLine',
    targetFieldLabel: 'Transaction',
    targetFieldIcon: 'IconReceipt',
  },
  // NOTE: Relation to FSIN deferred to Phase 6
];
