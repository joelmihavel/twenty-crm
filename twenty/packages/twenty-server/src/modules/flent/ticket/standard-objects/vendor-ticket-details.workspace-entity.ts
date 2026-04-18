import { type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

type TicketWorkspaceEntityRef = BaseWorkspaceEntity;

export class VendorTicketDetailsWorkspaceEntity extends BaseWorkspaceEntity {
  notes: RichTextMetadata | null;
  firstResponseMins: number | null;
  timeToCloseHours: number | null;
  ticket: EntityRelation<TicketWorkspaceEntityRef> | null;
  ticketId: string | null;
}
