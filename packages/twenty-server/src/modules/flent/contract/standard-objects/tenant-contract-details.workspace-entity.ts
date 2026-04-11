import { type CurrencyMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ContractWorkspaceEntity } from 'src/modules/flent/contract/standard-objects/contract.workspace-entity';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';

// Deferred import type for Phase 2 Room entity
// import { type RoomWorkspaceEntity } from 'src/modules/flent/property/standard-objects/room.workspace-entity';

export class TenantContractDetailsWorkspaceEntity extends BaseWorkspaceEntity {
  // Denormalized party name
  partyNameTenant: string;

  // Lifecycle dates
  preferredMoveOutDate: Date | null;

  // Lifecycle state machines
  paymentLifecycle: string | null;
  agreementLifecycle: string | null;

  // Rent breakdown (8 fee line items)
  totalRetailRent: CurrencyMetadata | null;
  monthlyLicenseFee: CurrencyMetadata | null;
  maintenanceFee: CurrencyMetadata | null;
  furnishingFee: CurrencyMetadata | null;
  convenienceFee: CurrencyMetadata | null;
  gst: CurrencyMetadata | null;
  discountAmount: CurrencyMetadata | null;
  effectiveRetailRent: CurrencyMetadata | null; // Auto-calculated: totalRetailRent - discountAmount

  // Deposits
  securityDeposit: CurrencyMetadata | null;
  cautionDeposit: CurrencyMetadata | null;

  // Fees and deductions
  lockInFee: CurrencyMetadata | null;
  exitFee: CurrencyMetadata | null;
  damagesDeductions: CurrencyMetadata | null;
  societyFees: CurrencyMetadata | null;
  penalty: CurrencyMetadata | null;
  totalDeductions: CurrencyMetadata | null; // Auto-calculated: damages + society + penalty

  // Status fields
  fmrStatus: string | null;
  depositPaidStatus: string | null;

  // Relation to Contract (MANY_TO_ONE via contract_uid PK/FK)
  contract: EntityRelation<ContractWorkspaceEntity> | null;
  contractId: string | null;

  // Relation to Tenant (MANY_TO_ONE)
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  tenantId: string | null;

  // Relation to Room (MANY_TO_ONE) -- deferred until Phase 2
  // room: EntityRelation<RoomWorkspaceEntity>;
  // roomId: string;
}
