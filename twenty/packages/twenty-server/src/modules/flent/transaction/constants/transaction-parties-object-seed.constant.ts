import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_PARTIES_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transaction Parties',
  labelSingular: 'Transaction Party',
  namePlural: 'transactionParties',
  nameSingular: 'transactionParty',
  icon: 'IconUsers',
  description:
    'From/to party tracking with type classification and derived KYC info',
  skipNameField: true,
};
