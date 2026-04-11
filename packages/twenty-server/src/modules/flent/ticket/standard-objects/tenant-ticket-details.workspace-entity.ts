import {
  type CurrencyMetadata,
  type RichTextMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

// Forward-reference types
type TicketWorkspaceEntityRef = BaseWorkspaceEntity;
type RoomWorkspaceEntity = BaseWorkspaceEntity;

export class TenantTicketDetailsWorkspaceEntity extends BaseWorkspaceEntity {
  ticketName: string | null;
  conversationId: string | null;
  categoryPhase: string | null;
  timeSlot: Date | null;
  ticketFlag: string | null;
  flagNotes: RichTextMetadata | null;
  costPaidByFlent: CurrencyMetadata | null;
  totalCost: CurrencyMetadata | null;
  vendorGroupChatId: string | null;
  relatedTickets: string | null;
  timeToFirstRepAssignment: number | null;
  timeToFirstResponseSlaHours: number | null;
  tenantRating: string | null;
  csatFeedback: RichTextMetadata | null;
  csatResponse: RichTextMetadata | null;
  ticket: EntityRelation<TicketWorkspaceEntityRef> | null;
  ticketId: string | null;
  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
