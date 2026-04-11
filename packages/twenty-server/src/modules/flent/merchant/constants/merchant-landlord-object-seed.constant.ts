import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const MERCHANT_LANDLORD_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'Merchant Landlords',
  labelSingular: 'Merchant Landlord',
  namePlural: 'merchantLandlords',
  nameSingular: 'merchantLandlord',
  icon: 'IconHome',
  description: 'Landlord-specific details for merchants including KYC, banking, and personality notes',
  skipNameField: true,
};
