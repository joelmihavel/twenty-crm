export const FSIN_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'fsin',
    name: 'vendor',
    label: 'Vendor',
    icon: 'IconTool',
    targetObjectName: 'vendor',
    targetFieldLabel: 'FSINs',
    targetFieldIcon: 'IconBarcode',
  },
];
