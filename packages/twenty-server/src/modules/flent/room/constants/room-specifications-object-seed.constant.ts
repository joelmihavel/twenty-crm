import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ROOM_SPECIFICATIONS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Room Specifications',
  labelSingular: 'Room Specification',
  namePlural: 'roomSpecifications',
  nameSingular: 'roomSpecification',
  icon: 'IconRuler',
  description: 'Physical specifications for rooms (bathroom, balcony)',
  skipNameField: true,
};
