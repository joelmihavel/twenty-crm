import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_REQUIREMENTS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Requirements',
  labelSingular: 'Tenant Requirement',
  namePlural: 'tenantRequirements',
  nameSingular: 'tenantRequirement',
  icon: 'IconChecklist',
  description: 'Housing preferences and requirements for tenants',
  skipNameField: true,
};
