import {
  type EmailsMetadata,
  FieldMetadataType,
  type FullNameMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantLandlordWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-landlord.workspace-entity';
import { type MerchantPocWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-poc.workspace-entity';
import { type MerchantBrokerWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-broker.workspace-entity';
import { type MerchantManagementWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant-management.workspace-entity';
import { type MerchantContractDetailsWorkspaceEntity } from 'src/modules/flent/contract/standard-objects/merchant-contract-details.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';

export const SEARCH_FIELDS_FOR_MERCHANT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
];

export class MerchantWorkspaceEntity extends BaseWorkspaceEntity {
  // Type & Identity
  merchantType: string | null;
  prefix: string | null;
  name: FullNameMetadata | null;
  emails: EmailsMetadata;
  phones: PhonesMetadata;
  currentCity: string | null;

  // Lead & Status
  leadSource: string | null;
  uniqueId: string | null;
  disqualificationReason: string | null;
  lostReason: string | null;

  // Relations to extensions (ONE_TO_MANY from merchant perspective)
  merchantLandlords: EntityRelation<MerchantLandlordWorkspaceEntity[]>;
  merchantPocs: EntityRelation<MerchantPocWorkspaceEntity[]>;
  merchantBrokers: EntityRelation<MerchantBrokerWorkspaceEntity[]>;
  merchantManagements: EntityRelation<MerchantManagementWorkspaceEntity[]>;
  merchantContracts: EntityRelation<MerchantContractDetailsWorkspaceEntity[]>;

  searchVector: string;
}
