import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transactions',
  labelSingular: 'Transaction',
  namePlural: 'transactions',
  nameSingular: 'transaction',
  icon: 'IconReceipt',
  description:
    'Financial ledger entry with UTN identifier, type discriminator, credit/debit direction, amount, and audit trail',
};
