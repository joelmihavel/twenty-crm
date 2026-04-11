import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_COMMERCIALS_RELATION_SEEDS: {
  sourceObjectName: string;
  name: string;
  label: string;
  icon: string;
  targetObjectName: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
}[] = [
  {
    sourceObjectName: VENDOR_OBJECT_SEED.nameSingular,
    name: 'vendorCommercials',
    label: 'Commercials',
    icon: 'IconCash',
    targetObjectName: 'vendorCommercial',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
