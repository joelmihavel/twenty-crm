import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type ItemWorkspaceEntityRef = BaseWorkspaceEntity;
type TransactionWorkspaceEntity = BaseWorkspaceEntity;

export class ItemTransactionLinksWorkspaceEntity extends BaseWorkspaceEntity {
  billDocumentId: string | null;
  item: EntityRelation<ItemWorkspaceEntityRef> | null;
  itemId: string | null;
  txnNo: EntityRelation<TransactionWorkspaceEntity> | null;
  txnNoId: string | null;
}
