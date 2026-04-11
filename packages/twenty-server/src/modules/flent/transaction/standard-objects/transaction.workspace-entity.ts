import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TransactionClassificationWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction-classification.workspace-entity';
import { type TransactionPartiesWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction-parties.workspace-entity';
import { type TransactionPaymentWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction-payment.workspace-entity';
import { type TransactionLineItemsWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction-line-items.workspace-entity';
import { type TransactionLinksWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction-links.workspace-entity';
import { type TransactionPurchaseOrderWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/transaction-purchase-order.workspace-entity';
import { type PoLineWorkspaceEntity } from 'src/modules/flent/transaction/standard-objects/po-line.workspace-entity';

const UTN_FIELD_NAME = 'utn';

export const SEARCH_FIELDS_FOR_TRANSACTION: FieldTypeAndNameMetadata[] = [
  { name: UTN_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class TransactionWorkspaceEntity extends BaseWorkspaceEntity {
  // Primary key
  utn: string;

  // Type discriminator
  transactionType: string;
  creditDebit: string;

  // Core fields
  transactionDate: Date;
  amount: number;
  status: string;

  // Audit trail
  createdBy: string;
  createdDate: Date;
  authorisedBy: string | null;
  authorisedDate: Date | null;

  // Relations to extension tables (ONE_TO_MANY, semantically 1:1)
  transactionClassifications: EntityRelation<TransactionClassificationWorkspaceEntity[]>;
  transactionParties: EntityRelation<TransactionPartiesWorkspaceEntity[]>;
  transactionPayments: EntityRelation<TransactionPaymentWorkspaceEntity[]>;
  transactionLineItems: EntityRelation<TransactionLineItemsWorkspaceEntity[]>;
  transactionLinks: EntityRelation<TransactionLinksWorkspaceEntity[]>;
  transactionPurchaseOrders: EntityRelation<TransactionPurchaseOrderWorkspaceEntity[]>;

  // Child table (ONE_TO_MANY, true multi-row for PO line items)
  poLines: EntityRelation<PoLineWorkspaceEntity[]>;

  searchVector: string;
}
