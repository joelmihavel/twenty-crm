import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_BROKER_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Brokers',
  labelSingular: 'Merchant Broker',
  namePlural: 'merchantBrokers',
  nameSingular: 'merchantBroker',
  icon: 'IconBriefcase',
  description: 'Broker-specific details for merchant relationships (fields TBD)',
  skipNameField: true,
};
