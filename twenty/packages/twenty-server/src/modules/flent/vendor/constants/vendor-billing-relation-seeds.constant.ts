import { VENDOR_OBJECT_SEED } from 'src/modules/flent/vendor/constants/vendor-object-seed.constant';

export const VENDOR_BILLING_RELATION_SEEDS: {
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
    name: 'vendorBillings',
    label: 'Billing Details',
    icon: 'IconFileInvoice',
    targetObjectName: 'vendorBilling',
    targetFieldLabel: 'Vendor',
    targetFieldIcon: 'IconTruck',
  },
];
