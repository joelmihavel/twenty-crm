import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TENANT_CONTRACT_DETAILS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Tenant Contract Details',
  labelSingular: 'Tenant Contract Details',
  namePlural: 'tenantContractDetails',
  nameSingular: 'tenantContractDetail',
  icon: 'IconFileDescription',
  description:
    'Tenant-specific contract extension with rent breakdown, deposits, deductions, and lifecycle tracking',
  skipNameField: true,
};
