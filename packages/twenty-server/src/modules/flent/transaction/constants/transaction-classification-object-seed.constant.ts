import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const TRANSACTION_CLASSIFICATION_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Transaction Classifications',
  labelSingular: 'Transaction Classification',
  namePlural: 'transactionClassifications',
  nameSingular: 'transactionClassification',
  icon: 'IconTags',
  description:
    'Purpose categories (OPEX/CAPEX) for financial reporting and cost center allocation',
  skipNameField: true,
};
