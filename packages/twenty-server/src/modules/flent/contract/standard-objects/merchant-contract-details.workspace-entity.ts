import { type CurrencyMetadata, type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ContractWorkspaceEntity } from 'src/modules/flent/contract/standard-objects/contract.workspace-entity';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantContractDetailsWorkspaceEntity extends BaseWorkspaceEntity {
  // Denormalized party name
  partyNameMerchant: string;

  // Handover
  keyHandoverDate: Date | null;

  // Increment terms
  incrementPercentage: number | null;
  incrementFrequency: string | null;

  // Agreement status
  agreementStatus: string | null;

  // Base rent as JSONB hike schedule
  // Format: [{"month":0,"amount":60000},{"month":12,"amount":66000}]
  baseRent: Record<string, unknown>[];

  // Financial fields
  merchantSecurityDeposit: CurrencyMetadata | null;
  managementFeePerMonth: CurrencyMetadata | null;
  totalCogs: CurrencyMetadata | null; // Derived: base_rent + overheads
  contractAcquisitionCost: CurrencyMetadata | null;
  contractAcquisitionCostPaidTo: string | null; // Party name, NOT an amount (type fix)

  // Payment terms
  paymentCycle: string;
  paymentDeadline: Date;

  // Inventory document
  inventoryList: LinksMetadata | null;

  // Relation to Contract (MANY_TO_ONE via contract_uid PK/FK)
  contract: EntityRelation<ContractWorkspaceEntity> | null;
  contractId: string | null;

  // Relation to Merchant (MANY_TO_ONE)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
