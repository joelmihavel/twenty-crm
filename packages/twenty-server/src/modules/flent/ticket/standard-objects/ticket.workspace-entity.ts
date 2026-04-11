import {
  type CurrencyMetadata,
  FieldMetadataType,
  type RichTextMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Forward-reference types for Phase 1/2/4 entities
// These will resolve once those workspace entities exist
type PropertyWorkspaceEntity = BaseWorkspaceEntity;
type VendorWorkspaceEntity = BaseWorkspaceEntity;
type TransactionWorkspaceEntity = BaseWorkspaceEntity;
type TenantTicketDetailsWorkspaceEntity = BaseWorkspaceEntity;
type VendorTicketDetailsWorkspaceEntity = BaseWorkspaceEntity;

const TICKET_DESCRIPTION_FIELD_NAME = 'ticketDescription';

export const SEARCH_FIELDS_FOR_TICKET: FieldTypeAndNameMetadata[] = [
  { name: TICKET_DESCRIPTION_FIELD_NAME, type: FieldMetadataType.RICH_TEXT },
];

export class TicketWorkspaceEntity extends BaseWorkspaceEntity {
  pipeline: string;
  ticketDescription: RichTextMetadata | null;
  ticketOwner: string | null;
  ticketCategory: string;
  ticketStatus: string;
  priority: string;
  resolutionNotes: RichTextMetadata | null;
  collectedFromTenant: CurrencyMetadata | null;
  collectedFromMerchant: CurrencyMetadata | null;
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;
  assignedVendor: EntityRelation<VendorWorkspaceEntity> | null;
  assignedVendorId: string | null;
  transaction: EntityRelation<TransactionWorkspaceEntity> | null;
  transactionId: string | null;
  tenantTicketDetails: EntityRelation<TenantTicketDetailsWorkspaceEntity[]>;
  vendorTicketDetails: EntityRelation<VendorTicketDetailsWorkspaceEntity[]>;
  searchVector: string;
}
