import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ITEM_STATE_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Item States',
  labelSingular: 'Item State',
  namePlural: 'itemStates',
  nameSingular: 'itemState',
  icon: 'IconMapPin',
  description:
    'Current location, lifecycle state, and condition tracking for an inventory item',
  skipNameField: true,
};
