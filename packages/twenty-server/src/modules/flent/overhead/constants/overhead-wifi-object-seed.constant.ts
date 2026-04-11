import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_WIFI_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead WiFis',
  labelSingular: 'Overhead WiFi',
  namePlural: 'overheadWifis',
  nameSingular: 'overheadWifi',
  icon: 'IconWifi',
  description: 'WiFi service overhead details including provider, plan, and credentials',
  skipNameField: true,
};
