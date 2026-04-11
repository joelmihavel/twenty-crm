import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TransactionWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction.workspace-entity';

export class TransactionClassificationWorkspaceEntity extends BaseWorkspaceEntity {
  // Purpose categories for financial reporting
  purposeCategory1: string | null;
  purposeCategory2: string | null;

  // Relation to Transaction (MANY_TO_ONE, semantically 1:1)
  transaction: EntityRelation<TransactionWorkspaceEntity> | null;
  transactionId: string | null;
}
