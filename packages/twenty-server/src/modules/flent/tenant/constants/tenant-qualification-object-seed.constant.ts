import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_QUALIFICATION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Qualifications',
  labelSingular: 'Tenant Qualification',
  namePlural: 'tenantQualifications',
  nameSingular: 'tenantQualification',
  icon: 'IconShieldCheck',
  description: 'Qualification status and background verification for tenants',
  skipNameField: true,
};
