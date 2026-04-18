import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_TICKET_DETAILS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Ticket Details',
  labelSingular: 'Tenant Ticket Detail',
  namePlural: 'tenantTicketDetails',
  nameSingular: 'tenantTicketDetail',
  icon: 'IconUserCircle',
  description:
    'Tenant-facing ticket extension with SLA tracking, CSAT, and cost breakdown',
  skipNameField: true,
};
