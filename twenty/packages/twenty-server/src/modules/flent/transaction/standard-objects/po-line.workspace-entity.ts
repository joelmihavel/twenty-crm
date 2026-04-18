import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TransactionWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction.workspace-entity';

export class PoLineWorkspaceEntity extends BaseWorkspaceEntity {
  // Line item identification
  fsinCode: string | null; // FK deferred to Phase 6
  itemName: string;

  // Quantities and pricing
  qty: number;
  unitPrice: number;
  lineAmount: number | null; // Auto-calculated: qty * unit_price (trigger)

  // Metadata
  notes: string | null;

  // Relation to Transaction (MANY_TO_ONE - parent PO transaction)
  transaction: EntityRelation<TransactionWorkspaceEntity> | null;
  transactionId: string | null;

  // Deferred relation (Phase 6)
  // fsin: EntityRelation<FsinWorkspaceEntity> | null;
}
