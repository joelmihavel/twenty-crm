import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TransactionWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction.workspace-entity';
import { type TenantWorkspaceEntity } from 'src/modules/flent/tenant/standard-objects/tenant.workspace-entity';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class TransactionLinksWorkspaceEntity extends BaseWorkspaceEntity {
  // Explicit FK dropdowns (replacing polymorphic contact_id, audit fix #21)
  tenantId: string | null;
  merchantId: string | null;
  vendorCode: string | null;
  overheadId: string | null;

  // Cross-entity links
  contractUid: string | null;
  ticketId: number | null; // FK deferred to Phase 5
  pid: string | null;
  rid: string | null;

  // Relation to Transaction (MANY_TO_ONE, semantically 1:1)
  transaction: EntityRelation<TransactionWorkspaceEntity> | null;
  transactionId: string | null;

  // Relations to linked entities
  tenant: EntityRelation<TenantWorkspaceEntity> | null;
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  vendor: EntityRelation<VendorWorkspaceEntity> | null;

  // Deferred relations (Phase 2 entities not yet in workspace layer)
  // contract: EntityRelation<ContractWorkspaceEntity> | null;
  // overhead: EntityRelation<OverheadWorkspaceEntity> | null;
  // property: EntityRelation<PropertyWorkspaceEntity> | null;
  // room: EntityRelation<RoomWorkspaceEntity> | null;
  // ticket: EntityRelation<TicketWorkspaceEntity> | null; // Phase 5
}
