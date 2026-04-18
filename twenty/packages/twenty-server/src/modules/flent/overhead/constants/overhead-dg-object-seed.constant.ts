import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_DG_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead DGs',
  labelSingular: 'Overhead DG',
  namePlural: 'overheadDgs',
  nameSingular: 'overheadDg',
  icon: 'IconEngine',
  description: 'Diesel generator overhead details including capacity and fuel',
  skipNameField: true,
};
