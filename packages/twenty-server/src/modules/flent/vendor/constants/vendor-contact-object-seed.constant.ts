import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_CONTACT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Contacts',
  labelSingular: 'Vendor Contact',
  namePlural: 'vendorContacts',
  nameSingular: 'vendorContact',
  icon: 'IconAddressBook',
  description: 'Contact information and address for vendors',
  skipNameField: true,
};
