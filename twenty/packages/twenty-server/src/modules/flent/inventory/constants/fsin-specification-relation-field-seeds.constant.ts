export const FSIN_SPECIFICATION_RELATION_FIELD_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: 'fsinSpecification',
    name: 'fsin',
    label: 'FSIN',
    icon: 'IconBarcode',
    targetObjectName: 'fsin',
    targetFieldLabel: 'Specifications',
    targetFieldIcon: 'IconListDetails',
  },
];
