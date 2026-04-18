import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MerchantWorkspaceEntity } from 'src/modules/flent/merchant/standard-objects/merchant.workspace-entity';

export class MerchantPocWorkspaceEntity extends BaseWorkspaceEntity {
  // Fields TBD - placeholder extension entity
  // BaseWorkspaceEntity provides id, createdAt, updatedAt, deletedAt

  // Relation to Merchant (MANY_TO_ONE, semantically 1:1)
  merchant: EntityRelation<MerchantWorkspaceEntity> | null;
  merchantId: string | null;
}
