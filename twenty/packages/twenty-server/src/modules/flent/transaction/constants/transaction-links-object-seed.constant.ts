import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_LINKS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transaction Links',
  labelSingular: 'Transaction Link',
  namePlural: 'transactionLinks',
  nameSingular: 'transactionLink',
  icon: 'IconLink',
  description:
    'Explicit FK dropdowns to tenant, merchant, vendor, overhead, contract, property, room, and ticket (audit fix #21, replacing polymorphic contact_id)',
  skipNameField: true,
};
