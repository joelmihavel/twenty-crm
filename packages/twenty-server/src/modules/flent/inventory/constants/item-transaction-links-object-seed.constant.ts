import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const ITEM_TRANSACTION_LINKS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Item Transaction Links',
  labelSingular: 'Item Transaction Link',
  namePlural: 'itemTransactionLinks',
  nameSingular: 'itemTransactionLink',
  icon: 'IconLink',
  description:
    'Join entity linking individual inventory items to financial transactions',
  skipNameField: true,
};
