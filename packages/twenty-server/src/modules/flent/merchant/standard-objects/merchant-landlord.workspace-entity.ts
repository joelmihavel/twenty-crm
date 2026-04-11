import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantLandlordWorkspaceEntity extends BaseWorkspaceEntity {
  // Personality & notes
  landlordPersonality: string | null;
  generalLlComments: string | null;
  potentiallyMultihome: boolean | null;

  // Professional
  designation: string | null;
  organization: string | null;

  // KYC Documents
  aadhaarBack: LinksMetadata | null;
  panNumber: string | null;
  panCardImage: LinksMetadata | null;

  // Banking
  bankAccountNumber: string | null;
  beneficiaryName: string | null;
  ifscCode: string | null;

  // Addresses
  currentResidential: string | null;
  permanentResidential: string | null;

  // Permissions
  communicationsPermission: boolean | null;
  signingAuthority: boolean | null;

  // Social
  linkedinUrl: LinksMetadata | null;

  // Relation to Merchant (MANY_TO_ONE, semantically 1:1)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
