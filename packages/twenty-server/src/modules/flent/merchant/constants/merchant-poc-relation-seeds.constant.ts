import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_POC_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular,
    name: 'merchantPocs',
    label: 'POC Details',
    icon: 'IconUserCircle',
    targetObjectName: 'merchantPoc',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
