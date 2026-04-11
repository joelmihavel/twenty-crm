import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_BILLING_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Billings',
  labelSingular: 'Vendor Billing',
  namePlural: 'vendorBillings',
  nameSingular: 'vendorBilling',
  icon: 'IconFileInvoice',
  description: 'GST, PAN, banking, and MSME details for vendor billing',
  skipNameField: true,
};
