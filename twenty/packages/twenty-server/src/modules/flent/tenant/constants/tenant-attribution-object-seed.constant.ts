import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_ATTRIBUTION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Attributions',
  labelSingular: 'Tenant Attribution',
  namePlural: 'tenantAttributions',
  nameSingular: 'tenantAttribution',
  icon: 'IconTarget',
  description: 'Marketing attribution and source tracking for tenant leads',
  skipNameField: true,
};
