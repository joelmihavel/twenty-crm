export const ITEM_STATE_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'itemState',
    name: 'item',
    label: 'Item',
    icon: 'IconBox',
    targetObjectName: 'item',
    targetFieldLabel: 'Item States',
    targetFieldIcon: 'IconMapPin',
  },
];
