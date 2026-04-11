import { type LinksMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type RoomWorkspaceEntity } from 'src/modules/flent/room/standard-objects/room.workspace-entity';

export class RoomFurnishingWorkspaceEntity extends BaseWorkspaceEntity {
  bedType: string | null;
  ac: boolean | null;
  acType: string | null;
  acFeasibility: string | null;
  studyTable: boolean | null;
  annexure: LinksMetadata | null;
  annexureLastUpdateDate: Date | null;

  room: EntityRelation<RoomWorkspaceEntity> | null;
  roomId: string | null;
}
