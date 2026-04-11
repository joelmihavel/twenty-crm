import { PROPERTY_OBJECT_SEED } from 'src/modules/flent/property/constants/property-object-seed.constant';
import { MERCHANT_OBJECT_SEED } from 'src/modules/flent/merchant/constants/merchant-object-seed.constant';

export const OVERHEAD_CROSS_RELATION_SEEDS = [
  { sourceObjectName: PROPERTY_OBJECT_SEED.nameSingular, name: 'overheads', label: 'Overheads', icon: 'IconReceipt', targetObjectName: 'overhead', targetFieldLabel: 'Property', targetFieldIcon: 'IconBuilding' },
  { sourceObjectName: MERCHANT_OBJECT_SEED.nameSingular, name: 'merchantOverheads', label: 'Merchant Overheads', icon: 'IconReceipt', targetObjectName: 'overhead', targetFieldLabel: 'Merchant', targetFieldIcon: 'IconBuildingSkyscraper' },
];
