import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_MANAGEMENT_RELATION_SEEDS: {
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
    name: 'merchantManagements',
    label: 'Management Details',
    icon: 'IconSettings',
    targetObjectName: 'merchantManagement',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
