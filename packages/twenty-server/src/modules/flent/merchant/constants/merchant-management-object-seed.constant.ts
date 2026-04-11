import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_MANAGEMENT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Managements',
  labelSingular: 'Merchant Management',
  namePlural: 'merchantManagements',
  nameSingular: 'merchantManagement',
  icon: 'IconSettings',
  description: 'Management company details for merchant relationships (fields TBD)',
  skipNameField: true,
};
