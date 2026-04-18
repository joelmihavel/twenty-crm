import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const PROPERTY_ACTIVE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Property Actives',
  labelSingular: 'Property Active',
  namePlural: 'propertyActives',
  nameSingular: 'propertyActive',
  icon: 'IconCircleCheck',
  description: 'Active property details including address, amenities, furnishing, and commercial terms',
  skipNameField: true,
};
