import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_WATER_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead Waters',
  labelSingular: 'Overhead Water',
  namePlural: 'overheadWaters',
  nameSingular: 'overheadWater',
  icon: 'IconDroplet',
  description: 'Water supply overhead details including account and ownership',
  skipNameField: true,
};
