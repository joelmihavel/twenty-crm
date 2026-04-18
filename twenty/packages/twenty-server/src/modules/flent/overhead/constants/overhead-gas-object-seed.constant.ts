import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_GAS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead Gases',
  labelSingular: 'Overhead Gas',
  namePlural: 'overheadGases',
  nameSingular: 'overheadGas',
  icon: 'IconFlame',
  description: 'Gas supply overhead details including connection type and account',
  skipNameField: true,
};
