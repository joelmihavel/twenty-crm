import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_CAPABILITY_RELATION_SEEDS: {
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
    name: 'vendorCapabilities',
    label: 'Capabilities',
    icon: 'IconTools',
    targetObjectName: 'vendorCapability',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
