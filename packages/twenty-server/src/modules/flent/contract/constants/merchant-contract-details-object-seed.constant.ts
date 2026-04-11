import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_CONTRACT_DETAILS_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Contract Details',
  labelSingular: 'Merchant Contract Details',
  namePlural: 'merchantContractDetails',
  nameSingular: 'merchantContractDetails',
  icon: 'IconFileInvoice',
  description:
    'Merchant-specific contract extension with base rent JSONB schedule, increment terms, COGS, and payment cycle',
  skipNameField: true,
};
