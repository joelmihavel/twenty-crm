import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overheads',
  labelSingular: 'Overhead',
  namePlural: 'overheads',
  nameSingular: 'overhead',
  icon: 'IconReceipt',
  description: 'Recurring and one-time overhead costs for properties',
  skipNameField: true,
};
