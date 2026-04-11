import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_PAYMENT_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transaction Payments',
  labelSingular: 'Transaction Payment',
  namePlural: 'transactionPayments',
  nameSingular: 'transactionPayment',
  icon: 'IconCreditCard',
  description:
    'Payment channel, provider, and gateway reference for reconciliation',
  skipNameField: true,
};
