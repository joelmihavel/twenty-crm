import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_FURNISHING_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Furnishings',
  labelSingular: 'Room Furnishing',
  namePlural: 'roomFurnishings',
  nameSingular: 'roomFurnishing',
  icon: 'IconArmchair',
  description: 'Furnishing details for rooms including bed, AC, and furniture',
  skipNameField: true,
};
