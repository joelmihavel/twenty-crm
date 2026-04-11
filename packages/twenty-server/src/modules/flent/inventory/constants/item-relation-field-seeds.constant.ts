export const ITEM_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'item',
    name: 'fsin',
    label: 'FSIN',
    icon: 'IconBarcode',
    targetObjectName: 'fsin',
    targetFieldLabel: 'Items',
    targetFieldIcon: 'IconBox',
  },
  {
    sourceObjectName: 'item',
    name: 'poLine',
    label: 'PO Line',
    icon: 'IconFileInvoice',
    targetObjectName: 'poLine',
    targetFieldLabel: 'Items',
    targetFieldIcon: 'IconBox',
  },
];
