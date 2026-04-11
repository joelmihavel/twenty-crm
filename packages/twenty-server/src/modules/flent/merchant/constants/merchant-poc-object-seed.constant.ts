import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_POC_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant POCs',
  labelSingular: 'Merchant POC',
  namePlural: 'merchantPocs',
  nameSingular: 'merchantPoc',
  icon: 'IconUserCircle',
  description: 'Point of contact details for merchant interactions (fields TBD)',
  skipNameField: true,
};
