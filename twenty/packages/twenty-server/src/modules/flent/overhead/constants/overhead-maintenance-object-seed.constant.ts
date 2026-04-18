import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const OVERHEAD_MAINTENANCE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Overhead Maintenances',
  labelSingular: 'Overhead Maintenance',
  namePlural: 'overheadMaintenances',
  nameSingular: 'overheadMaintenance',
  icon: 'IconTool',
  description: 'Maintenance-specific overhead details for properties',
  skipNameField: true,
};
