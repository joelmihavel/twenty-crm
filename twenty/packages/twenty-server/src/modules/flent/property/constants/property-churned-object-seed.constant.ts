import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PROPERTY_CHURNED_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Property Churneds',
  labelSingular: 'Property Churned',
  namePlural: 'propertyChurneds',
  nameSingular: 'propertyChurned',
  icon: 'IconArrowBack',
  description: 'Tracking data for properties that have been churned/exited',
  skipNameField: true,
};
