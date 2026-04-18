import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_WATER_PURIFIER_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead Water Purifiers',
  labelSingular: 'Overhead Water Purifier',
  namePlural: 'overheadWaterPurifiers',
  nameSingular: 'overheadWaterPurifier',
  icon: 'IconFilter',
  description: 'Water purifier overhead details including serial number and subscription',
  skipNameField: true,
};
