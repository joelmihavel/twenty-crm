export const ITEM_TRANSACTION_LINKS_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'itemTransactionLink',
    name: 'item',
    label: 'Item',
    icon: 'IconBox',
    targetObjectName: 'item',
    targetFieldLabel: 'Transaction Links',
    targetFieldIcon: 'IconLink',
  },
  {
    sourceObjectName: 'itemTransactionLink',
    name: 'txnNo',
    label: 'Transaction',
    icon: 'IconReceipt',
    targetObjectName: 'transaction',
    targetFieldLabel: 'Item Transaction Links',
    targetFieldIcon: 'IconLink',
  },
];
