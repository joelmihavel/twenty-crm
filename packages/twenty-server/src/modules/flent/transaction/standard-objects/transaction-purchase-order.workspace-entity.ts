import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TransactionWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction.workspace-entity';
import { type VendorWorkspaceEntity } from 'src/modules/flent/vendor/standard-objects/vendor.workspace-entity';

export class TransactionPurchaseOrderWorkspaceEntity extends BaseWorkspaceEntity {
  // PO identification
  poNumber: string;
  vendorCode: string;
  vendorName: string;

  // Line item totals
  totalItems: number | null;
  gstPercent: number | null;

  // Payment split
  advanceAmount: number | null;
  remainingAmount: number | null;
  advanceDate: Date | null;
  fnfDate: Date | null;

  // Invoice and status
  invoice: string | null;
  poStatus: string;
  roundOff: number | null;

  // Self-referencing FKs to advance/remaining payment transactions
  txnIdAdvance: string | null;
  txnIdRemaining: string | null;

  // Relation to Transaction (MANY_TO_ONE, semantically 1:1 - this PO IS a transaction)
  transaction: EntityRelation<TransactionWorkspaceEntity> | null;
  transactionId: string | null;

  // Relation to Vendor
  vendor: EntityRelation<VendorWorkspaceEntity> | null;

  // Self-referencing relations to payment transactions
  advanceTransaction: EntityRelation<TransactionWorkspaceEntity> | null;
  remainingTransaction: EntityRelation<TransactionWorkspaceEntity> | null;
}
