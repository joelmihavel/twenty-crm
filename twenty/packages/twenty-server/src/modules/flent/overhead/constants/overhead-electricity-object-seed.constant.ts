import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_ELECTRICITY_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead Electricities',
  labelSingular: 'Overhead Electricity',
  namePlural: 'overheadElectricities',
  nameSingular: 'overheadElectricity',
  icon: 'IconBolt',
  description: 'Electricity overhead details including provider, connection, and account',
  skipNameField: true,
};
