import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TenantContractDetailsWorkspaceEntity } from 'src/modules/flent/contract/standard-objects/tenant-contract-details.workspace-entity';
import { type MerchantContractDetailsWorkspaceEntity } from 'src/modules/flent/contract/standard-objects/merchant-contract-details.workspace-entity';

// Deferred import types for Phase 2 entities (Property, Room)
// import { type PropertyWorkspaceEntity } from 'src/modules/flent/property/standard-objects/property.workspace-entity';
// import { type RoomWorkspaceEntity } from 'src/modules/flent/property/standard-objects/room.workspace-entity';

export class ContractWorkspaceEntity extends BaseWorkspaceEntity {
  // Contract type discriminator
  contractType: string;

  // Dates and terms
  contractStartDate: Date;
  contractEndDate: Date;
  serviceTerm: number;
  lockInDuration: number | null;
  lockInEndDate: Date | null; // Auto-calculated by trigger: startDate + lockInDuration months
  noticePeriod: number | null;

  // Agreement document
  agreementPdf: LinksMetadata | null;

  // Relations to Property and Room (MANY_TO_ONE)
  // Deferred until Phase 2 entities are created
  // property: EntityRelation<PropertyWorkspaceEntity>;
  // propertyId: string;
  // room: EntityRelation<RoomWorkspaceEntity> | null;
  // roomId: string | null;

  // Relations to extension tables (ONE_TO_MANY from contract perspective)
  tenantContractDetails: EntityRelation<TenantContractDetailsWorkspaceEntity[]>;
  merchantContractDetails: EntityRelation<MerchantContractDetailsWorkspaceEntity[]>;
}
