import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_SATISFACTION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Satisfactions',
  labelSingular: 'Tenant Satisfaction',
  namePlural: 'tenantSatisfactions',
  nameSingular: 'tenantSatisfaction',
  icon: 'IconStar',
  description: 'CSAT and NPS scores for tenant satisfaction tracking',
  skipNameField: true,
};
