import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const MERCHANT_BROKER_RELATION_SEEDS: {
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
    name: 'merchantBrokers',
    label: 'Broker Details',
    icon: 'IconBriefcase',
    targetObjectName: 'merchantBroker',
    targetFieldLabel: 'Merchant',
    targetFieldIcon: 'IconBuildingSkyscraper',
  },
];
