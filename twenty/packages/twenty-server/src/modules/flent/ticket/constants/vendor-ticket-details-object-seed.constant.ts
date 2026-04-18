import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const VENDOR_TICKET_DETAILS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Vendor Ticket Details',
  labelSingular: 'Vendor Ticket Detail',
  namePlural: 'vendorTicketDetails',
  nameSingular: 'vendorTicketDetail',
  icon: 'IconTool',
  description:
    'Vendor-facing ticket extension with response and resolution metrics',
  skipNameField: true,
};
