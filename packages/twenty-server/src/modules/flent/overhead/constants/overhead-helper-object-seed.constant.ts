import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_HELPER_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead Helpers',
  labelSingular: 'Overhead Helper',
  namePlural: 'overheadHelpers',
  nameSingular: 'overheadHelper',
  icon: 'IconUsers',
  description: 'Helper/staff overhead details including role, salary, and schedule',
  skipNameField: true,
};
