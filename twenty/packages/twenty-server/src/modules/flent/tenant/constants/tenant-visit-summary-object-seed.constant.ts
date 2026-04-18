import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_VISIT_SUMMARY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Visit Summaries',
  labelSingular: 'Tenant Visit Summary',
  namePlural: 'tenantVisitSummaries',
  nameSingular: 'tenantVisitSummary',
  icon: 'IconMapPin',
  description: 'Aggregated visit statistics and feedback for tenants',
  skipNameField: true,
};
